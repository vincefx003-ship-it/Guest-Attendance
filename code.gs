const SHEET_NAME = "Guests";

// SEARCH GUEST
function doGet(e) {
  const action = e.parameter.action;

  if (action === "search") return searchGuest(e);

  return json({ message: "Invalid GET request" });
}

// MAIN SEARCH LOGIC
function searchGuest(e) {
  const q = (e.parameter.q || "").toLowerCase();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  let found = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (
      row[1].toLowerCase() === q ||  // name exact
      row[0].toLowerCase() === q ||  // id
      row[2].toLowerCase() === q     // phone
    ) {
      found = {
        rowIndex: i + 1,
        guestId: row[0],
        name: row[1],
        phone: row[2],
        status: row[3]
      };
      break;
    }
  }

  return json({ found });
}

// CHECK IN GUEST
function doPost(e) {
  const action = e.parameter.action;

  if (action === "checkin") return checkIn(e);
  if (action === "register") return registerGuest(e);

  return json({ message: "Invalid POST" });
}

// MARK PRESENT
function checkIn(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 4).setValue("present");
      return json({ success: true, message: "Checked in successfully" });
    }
  }

  return json({ success: false, message: "Guest not found" });
}

// REGISTER NEW GUEST + MARK PRESENT
function registerGuest(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const guestId = "G" + Date.now();
  const name = e.parameter.name;
  const phone = e.parameter.phone;

  sheet.appendRow([guestId, name, phone, "present"]);

  return json({
    success: true,
    message: "Registered and checked in",
    guestId
  });
}

// JSON HELPER
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
