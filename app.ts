import axios from 'axios';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { auth, BASE_URL, GOOGLE_LIVE_SHEET_ID, PORT, sheet } from './constants';
import { setupSwagger } from './swagger.config';

//#region app setup
const app = express();
app.use(express.json()); // Middleware to parse JSON or URL-encoded data
app.use(express.urlencoded({ extended: true })); // For complex form data
app.use(cors());
setupSwagger(app, BASE_URL);

//#region Google Sheets API Endpoints

/**
 * @swagger
 * /:
 *   post:
 *     summary: Append a new row to the sheet
 *     description: Appends a new row with the specified values to the Google Sheet
 *     tags: [Google Sheets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Successful append
 *       '400':
 *         description: Bad request
 */
app.post('/', async (req: Request, res: Response) => {
  await sheet.spreadsheets.values.append({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    range: 'A2:F2',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['change', 'demon', 'excellent', 'fire']],
    },
  });

  return res.send({
    success: true,
    message: 'Sheet updated successfully',
    status: 200,
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all entries from the sheet
 *     description: Retrieves all entries from the specified range of the Google Sheet
 *     tags: [Google Sheets]
 *     responses:
 *       '200':
 *         description: Successful retrieval
 *       '400':
 *         description: Bad request
 */
app.get('/', async (req: Request, res: Response) => {
  const result = await sheet.spreadsheets.values.get({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    range: 'A1:Z',
    majorDimension: 'COLUMNS',
  });

  return res.send({ data: result.data });
});

/**
 * @swagger
 * /batch:
 *   get:
 *     summary: Get multiple ranges from the sheet
 *     description: Retrieves values from multiple ranges in the Google Sheet
 *     tags: [Google Sheets]
 *     responses:
 *       '200':
 *         description: Successful retrieval
 *       '400':
 *         description: Bad request
 */
app.get('/batch', async (req: Request, res: Response) => {
  const result = await sheet.spreadsheets.values.batchGet({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    ranges: ['a1:a', 'b1:b'],
    majorDimension: 'COLUMNS',
  });

  return res.send({ data: result.data });
});

/**
 * @swagger
 * /:
 *   patch:
 *     summary: Update values in the sheet
 *     description: Updates the values in the specified range of the Google Sheet
 *     tags: [Google Sheets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               range:
 *                 type: string
 *               values:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       '200':
 *         description: Successful update
 *       '400':
 *         description: Bad request
 */
app.patch('/', async (req: Request, res: Response) => {
  await sheet.spreadsheets.values.update({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    range: req.body.range,
    valueInputOption: 'RAW',
    requestBody: {
      values: req.body.values,
    },
  });

  return res.send({
    success: true,
    message: 'Sheet updated successfully',
    status: 200,
  });
});

//#endregion

//#region Server Setup

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get('https://httpbin.org');
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({
      error: 'Failed to call external API',
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({
    message: 'API is Live!',
  });
});

/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'API route does not exist',
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');
  console.log(`${'\x1b[31m'}`); // start color red
  console.log(`${err.message}`);
  console.log(`${'\x1b][0m]'}`); //stop color

  return res.status(500).send({
    success: false,
    status: 500,
    message: err.message,
  });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf(BASE_URL), 600000);

//#endregion
