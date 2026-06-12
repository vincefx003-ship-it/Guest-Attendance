const SHEET_GUESTS = "Guests";
const SHEET_ATTENDANCE = "Attendance";
const SHEET_EVENTS = "Events";
const SHEET_AUDIT = "AuditLog";

/* ================= ENTRY ================= */
function doGet(e) {
  const action = e.parameter.action;

  if (action === "search") return searchGuest(e);
  if (action === "checkin") return markPresent(e);
  if (action === "walkin") return addWalkIn(e);
  if (action === "dashboard") return getDashboard();
  if (action === "exportGuests") return exportGuests();
  if (action === "exportAttendance") return exportAttendance(e);

  return json({ error: "Invalid action" });
}

/* ================= SEARCH ================= */
function searchGuest(e) {
  const q = (e.parameter.q || "").toLowerCase();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_GUESTS);
  const data = sheet.getDataRange().getValues();

  let results = [];

  for (let i = 1; i < data.length; i++) {
    const g = {
      guestId: data[i][0],
      name: data[i][1],
      phone: data[i][2],
      rsvp: data[i][3]
    };

    if (
      g.guestId.toLowerCase().includes(q) ||
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q)
    ) {
      results.push(g);
    }
  }

  logAction("SEARCH", q);

  return json({ success: true, results });
}

/* ================= ACTIVE EVENT ================= */
function getActiveEvent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EVENTS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === true || data[i][3] === "TRUE") {
      return {
        eventId: data[i][0],
        eventName: data[i][1],
        eventDate: data[i][2]
      };
    }
  }
  return null;
}

/* ================= CHECK IF ALREADY PRESENT ================= */
function alreadyCheckedIn(guestId, eventId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === guestId && data[i][2] === eventId) {
      return { exists: true, time: data[i][5] };
    }
  }
  return { exists: false };
}

/* ================= CHECK-IN ================= */
function markPresent(e) {
  const guestId = e.parameter.guestId;
  const operator = e.parameter.operator || "Admin";

  const event = getActiveEvent();
  if (!event) return json({ success: false, message: "No active event" });

  const check = alreadyCheckedIn(guestId, event.eventId);

  if (check.exists) {
    return json({
      success: false,
      message: "Already checked in",
      time: check.time
    });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);

  const now = new Date();
  const time = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");

  sheet.appendRow([
    "ATT-" + new Date().getTime(),
    guestId,
    event.eventId,
    event.eventName,
    now,
    time,
    operator
  ]);

  logAction("CHECKIN", guestId + " @ " + event.eventName);

  return json({
    success: true,
    message: "Checked in",
    time: time
  });
}

/* ================= WALK-IN ================= */
function addWalkIn(e) {
  const name = e.parameter.name;
  const phone = e.parameter.phone || "";
  const operator = e.parameter.operator || "Admin";

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const guestSheet = ss.getSheetByName(SHEET_GUESTS);

  const existing = findByPhone(phone);
  if (existing.exists) {
    return json({ success: false, message: "Duplicate found", guest: existing });
  }

  const guestId = "G-" + new Date().getTime();

  guestSheet.appendRow([
    guestId,
    name,
    phone,
    "Walk-in",
    new Date()
  ]);

  const event = getActiveEvent();
  const attendance = ss.getSheetByName(SHEET_ATTENDANCE);

  const now = new Date();
  const time = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss");

  attendance.appendRow([
    "ATT-" + new Date().getTime(),
    guestId,
    event.eventId,
    event.eventName,
    now,
    time,
    operator
  ]);

  logAction("WALKIN", name);

  return json({ success: true, message: "Walk-in added" });
}

/* ================= FIND BY PHONE ================= */
function findByPhone(phone) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_GUESTS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === phone) {
      return {
        exists: true,
        guestId: data[i][0],
        name: data[i][1]
      };
    }
  }
  return { exists: false };
}

/* ================= DASHBOARD ================= */
function getDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const guests = ss.getSheetByName(SHEET_GUESTS).getDataRange().getValues();
  const attendance = ss.getSheetByName(SHEET_ATTENDANCE).getDataRange().getValues();

  const event = getActiveEvent();

  let present = 0;

  for (let i = 1; i < attendance.length; i++) {
    if (attendance[i][2] === event.eventId) {
      present++;
    }
  }

  return json({
    totalGuests: guests.length - 1,
    presentToday: present,
    event: event
  });
}

/* ================= EXPORT GUESTS ================= */
function exportGuests() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_GUESTS);
  const data = sheet.getDataRange().getValues();

  let csv = [];

  for (let i = 0; i < data.length; i++) {
    csv.push(data[i].join(","));
  }

  return ContentService.createTextOutput(csv.join("\n"))
    .setMimeType(ContentService.MimeType.CSV);
}

/* ================= EXPORT ATTENDANCE ================= */
function exportAttendance(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATTENDANCE);
  const data = sheet.getDataRange().getValues();

  let csv = [];

  for (let i = 0; i < data.length; i++) {
    csv.push(data[i].join(","));
  }

  return ContentService.createTextOutput(csv.join("\n"))
    .setMimeType(ContentService.MimeType.CSV);
}

/* ================= LOG ================= */
function logAction(action, details) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_AUDIT);
  sheet.appendRow([new Date(), action, details]);
}

/* ================= JSON ================= */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
