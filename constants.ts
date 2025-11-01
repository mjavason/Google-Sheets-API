import dotenv from 'dotenv';
import { google } from 'googleapis';
import { GoogleSheetCredentialsType } from './google-sheet-credentials.type';

dotenv.config({
  path: './.env',
});

export const PORT = process.env.PORT || 5000;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export const GOOGLE_SHEET_CREDENTIALS: GoogleSheetCredentialsType = JSON.parse(
  process.env.GOOGLE_SHEET_CREDENTIALS || '{}'
);
export const GOOGLE_LIVE_SHEET_ID = process.env.GOOGLE_LIVE_SHEET_ID || 'xxxx';

export const auth = new google.auth.JWT({
  email: GOOGLE_SHEET_CREDENTIALS.client_email,
  key: GOOGLE_SHEET_CREDENTIALS.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
export const sheet = google.sheets('v4');
