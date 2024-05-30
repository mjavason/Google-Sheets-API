import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { google } from 'googleapis';

//#region app setup
const app = express();
app.use(express.json()); // Middleware to parse JSON or URL-encoded data
app.use(express.urlencoded({ extended: true })); // For complex form data
app.use(cors());
dotenv.config({ path: './.env' });
//#endregion

//#region keys and configs
const PORT = process.env.PORT || 3000;
const baseURL = 'https://httpbin.org';
interface IGoogleSheetCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}
const GOOGLE_SHEET_CREDENTIALS: IGoogleSheetCredentials = JSON.parse(
  process.env.GOOGLE_SHEET_CREDENTIALS || '{}'
);
const GOOGLE_LIVE_SHEET_ID = process.env.GOOGLE_LIVE_SHEET_ID || 'xxxx';
const auth = new google.auth.JWT({
  email: GOOGLE_SHEET_CREDENTIALS.client_email,
  key: GOOGLE_SHEET_CREDENTIALS.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheet = google.sheets('v4');
//#endregion

// insert 'change' into a2, 'demon' into b2, 'excellent' into c2 and so on...
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

// get all the entries by column from a to z
app.get('/', async (req: Request, res: Response) => {
  const result = await sheet.spreadsheets.values.get({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    range: 'A1:Z',
    majorDimension: 'COLUMNS',
  });

  return res.send({ data: result.data });
});

// batch get
app.get('/batch', async (req: Request, res: Response) => {
  const result = await sheet.spreadsheets.values.batchGet({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    ranges: ['a1:a', 'b1:b'],
    majorDimension: 'COLUMNS',
  });

  return res.send({ data: result.data });
});

// update/insert ....
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


//#region Server setup

// default message
app.get('/api', async (req: Request, res: Response) => {
  const result = await axios.get(baseURL);
  console.log(result.status);
  return res.send({
    message: 'Demo API called (httpbin.org)',
    data: result.status,
  });
});

//default message
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'}`);
  return res
    .status(500)
    .send({ success: false, status: 500, message: err.message });
});
//#endregion
