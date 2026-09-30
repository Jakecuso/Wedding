/**
 * Wedding site backend. Paste this into Extensions > Apps Script
 * of a Google Sheet, then deploy as a Web app (see README.md).
 *
 * Tabs it creates automatically:
 *   RSVPs      - everyone's RSVP
 *   Overnight  - overnight guests confirming their stay
 *   Questions  - guest questions. Type an answer in the "Answer" column
 *                and it shows up on the website.
 */

const HEADERS = {
  RSVPs: ["Timestamp", "Name", "Email", "Phone", "Attending", "Party Size", "Other Guests", "Days", "Dietary", "Message"],
  Overnight: ["Timestamp", "Name", "Staying?", "Nights", "People", "Notes"],
  Questions: ["Timestamp", "Name", "Question", "Answer"],
};

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS[name].length).setFontWeight("bold");
  }
  return sh;
}

function clean_(v) {
  v = String(v || "").slice(0, 2000);
  // Stop spreadsheet formula injection
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  const p = e.parameter;
  const now = new Date();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (p.type === "rsvp") {
      sheet_("RSVPs").appendRow([now, p.name, p.email, p.phone, p.attending,
        p.attending === "Yes" ? p.partySize : 0, p.guestNames, p.days, p.dietary, p.message].map((v, i) => i ? clean_(v) : v));
    } else if (p.type === "overnight") {
      sheet_("Overnight").appendRow([now, p.name, p.staying, p.nights,
        p.staying === "Yes" ? p.partySize : 0, p.message].map((v, i) => i ? clean_(v) : v));
    } else if (p.type === "question") {
      sheet_("Questions").appendRow([now, clean_(p.name), clean_(p.question), ""]);
    }
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  let out = [];
  if (e.parameter.action === "questions") {
    const rows = sheet_("Questions").getDataRange().getValues().slice(1);
    out = rows
      .filter((r) => String(r[3]).trim())
      .map((r) => ({ name: String(r[1]).split(" ")[0], question: String(r[2]), answer: String(r[3]) }))
      .reverse();
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to create the tabs. */
function setup() {
  Object.keys(HEADERS).forEach(sheet_);
}
