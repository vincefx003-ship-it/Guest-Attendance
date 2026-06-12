const SHEET_GUESTS = "Guests";
const SHEET_ATTENDANCE = "Attendance";
const SHEET_EVENTS = "Events";
const SHEET_AUDIT = "AuditLog";

// ===================== ENTRY POINT =====================
function doGet(e) {
  const action = e.parameter.action || "health";

  if (action === "health") {
    return json({
      success: true,
      message: "Guest Attendance API is running"
    });
  }

  if (action === "search") {
    return searchGuest(e);
  }

  return json({
    success: false,
    error: "Invalid action"
  });
}

// ===================== SEARCH GUEST =====================
function searchGuest(e) {
  const q = (e.parameter.q || "").toLowerCase().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GUESTS);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  let results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const guest = {
      guestId: row[0],
      name: row[1],
      phone: row[2],
      rsvp: row[3]
    };

    if (
      guest.guestId.toLowerCase().includes(q) ||
      guest.name.toLowerCase().includes(q) ||
      guest.phone.toLowerCase().includes(q)
    ) {
      results.push(guest);
    }
  }

  logAction("SEARCH", q);

  return json({ success: true, results });
}

// ===================== UTIL: JSON RESPONSE =====================
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===================== AUDIT LOG =====================
function logAction(action, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_AUDIT);

  sheet.appendRow([
    new Date(),
    action,
    details
  ]);
}
