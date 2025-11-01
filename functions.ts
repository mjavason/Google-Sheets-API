import { auth, GOOGLE_LIVE_SHEET_ID, sheet } from './constants';

const fs = require('fs');
const path = require('path');

export async function downloadLatestSheetData(tabName: string) {
  const result = await sheet.spreadsheets.values.get({
    spreadsheetId: GOOGLE_LIVE_SHEET_ID,
    auth: auth,
    range: `${tabName}!A1:Z`,
    majorDimension: 'COLUMNS',
  });

  const storesDir = path.join(__dirname, 'stores');
  if (!fs.existsSync(storesDir)) {
    fs.mkdirSync(storesDir, { recursive: true });
  }

  const filePath = path.join(storesDir, `${tabName}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2));
}
