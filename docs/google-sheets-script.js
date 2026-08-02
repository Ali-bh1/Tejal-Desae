/**
 * Google Apps Script — Tejal Desae Lead Logger
 * 
 * SETUP INSTRUCTIONS:
 * ─────────────────────────────────────────────────────────────
 * 1. Go to https://sheets.google.com → Create a new spreadsheet
 *    Name it: "Tejal Desae — Leads"
 * 
 * 2. Go to Extensions → Apps Script
 * 
 * 3. Delete the default code and paste THIS ENTIRE FILE
 * 
 * 4. Click "Deploy" → "New deployment"
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 * 
 * 5. Copy the Web App URL (looks like: https://script.google.com/macros/s/ABC.../exec)
 * 
 * 6. Paste that URL into js/lead-service.js where it says GOOGLE_SHEET_URL
 * 
 * Done! Every form submission now logs a row automatically.
 * ─────────────────────────────────────────────────────────────
 */

const HEADERS = [
  'Timestamp',
  'Source',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Program',
  'Archetype',
  'Expansion Scores',
  'Message',
  'Quiz Answers',
];

/**
 * Handles incoming POST requests from the website.
 * Appends a row to the active spreadsheet.
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Auto-create headers on first row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#f3f0e8');
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents);

    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.source       || '',
      data.firstName     || data.name || '',
      data.lastName      || '',
      data.email         || '',
      data.phone         || '',
      data.program       || '',
      data.archetype     || '',
      data.scores        || '',
      data.message       || '',
      data.quizAnswers   || '',
    ];

    sheet.appendRow(row);

    // Auto-resize columns for readability (first 20 submissions only)
    if (sheet.getLastRow() <= 21) {
      sheet.autoResizeColumns(1, HEADERS.length);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests (for testing the deployment).
 * Visit the Web App URL in a browser to confirm it's live.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Tejal Desae Lead Logger is active. POST to this URL to log a lead.',
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
