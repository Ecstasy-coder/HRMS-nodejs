const HolidayCalendar = require("../models/HolidayCalendar");
const HolidayDate     = require("../models/HolidayDate");
const pdfParse        = require("pdf-parse");

// ========================================
// HELPER — Parse holidays from PDF text
// Format: "14 Jan 2026 Wednesday Bhogi"
// ========================================

function parseHolidaysFromText(text, year) {

  const holidays = [];

  const monthMap = {
    january:"01", february:"02", march:"03",
    april:"04",   may:"05",      june:"06",
    july:"07",    august:"08",   september:"09",
    october:"10", november:"11", december:"12",
    jan:"01", feb:"02", mar:"03", apr:"04",
    jun:"06", jul:"07", aug:"08", sep:"09",
    oct:"10", nov:"11", dec:"12"
  };

  // Day-of-week words — these are NOT holiday names
  const DAY_WORDS = new Set([
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
  ]);

  const MONTH_RE =
    "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|" +
    "jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|" +
    "oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";

  // ── Step 1: join lines so split holiday names are re-joined ──
  // Strategy: if a line starts with a date pattern it's a new entry.
  // Otherwise it's a continuation of the previous line.
  const DATE_START = new RegExp(
    `^\\d{1,2}\\s+(?:${MONTH_RE})\\s+\\d{4}`, "i"
  );

  const rawLines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // Merge continuation lines into the entry above them
  const mergedLines = [];
  for (const line of rawLines) {
    if (DATE_START.test(line)) {
      mergedLines.push(line);
    } else if (mergedLines.length > 0) {
      // Continuation — append to previous line
      mergedLines[mergedLines.length - 1] += " " + line;
    }
  }

  // ── Step 2: parse each merged line ──
  for (const line of mergedLines) {

    let day, month, name;

    // Pattern 1: "14 Jan 2026 Wednesday Bhogi"  (with day-of-week)
    const p1 = line.match(
      new RegExp(`^(\\d{1,2})\\s+(${MONTH_RE})\\s+\\d{4}\\s+(\\w+)\\s+(.+)`, "i")
    );

    // Pattern 2: "14 Jan 2026 Bhogi"  (no day-of-week)
    const p2 = line.match(
      new RegExp(`^(\\d{1,2})\\s+(${MONTH_RE})\\s+\\d{4}\\s+(.+)`, "i")
    );

    if (p1) {
      const possibleDay = p1[3].toLowerCase();
      if (DAY_WORDS.has(possibleDay)) {
        // p1[3] is a day-of-week word → name starts at p1[4]
        day   = p1[1].padStart(2, "0");
        month = monthMap[p1[2].toLowerCase()];
        name  = p1[4].trim();
      } else {
        // p1[3] is actually the start of the name
        day   = p1[1].padStart(2, "0");
        month = monthMap[p1[2].toLowerCase()];
        name  = (p1[3] + " " + p1[4]).trim();
      }
    } else if (p2) {
      day   = p2[1].padStart(2, "0");
      month = monthMap[p2[2].toLowerCase()];
      name  = p2[3].trim();

      // If extracted name is only a day-of-week word, skip — means name was on next line
      // (shouldn't happen after merging, but guard anyway)
      if (DAY_WORDS.has(name.toLowerCase())) continue;
    }

    if (day && month && name) {
      // Clean: remove trailing asterisks, pipes, extra spaces
      name = name
        .replace(/\s{2,}/g, " ")
        .replace(/[|•·]+.*/g, "")
        .replace(/\*+$/g, "")
        .trim();

      if (
        name.length > 2 &&
        name.length < 100 &&
        !DAY_WORDS.has(name.toLowerCase()) &&
        !/^(date|day|occasion|holiday|month|public)/i.test(name)
      ) {
        holidays.push({
          date:  `${year}-${month}-${day}`,
          name,
          type:  "Holiday",
          year:  parseInt(year)
        });
      }
    }
  }

  // Deduplicate by date
  const seen = new Set();
  return holidays.filter(h => {
    if (seen.has(h.date)) return false;
    seen.add(h.date);
    return true;
  });
}


// ========================================
// UPLOAD CALENDAR
// ========================================

exports.uploadCalendar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const year     = req.body.year;
    const fileSize = (req.file.size / (1024*1024)).toFixed(2) + " MB";

    const calendar = await HolidayCalendar.create({
      title: req.file.originalname, year,
      fileName: req.file.originalname, fileSize,
      mimeType: req.file.mimetype,
      fileData: Buffer.from(req.file.buffer)
    });

    let parsedCount = 0;
    let parseError  = null;

    try {
      if (req.file.mimetype === "application/pdf") {

        const pdfData  = await pdfParse(req.file.buffer);
        const rawText  = pdfData.text || "";

        console.log("[HolidayCalendar] Extracted text sample:\n", rawText.substring(0, 800));

        const holidays = parseHolidaysFromText(rawText, year);
        console.log(`[HolidayCalendar] Parsed ${holidays.length} holidays:`, holidays);

        if (holidays.length > 0) {
          await HolidayDate.deleteMany({ year: parseInt(year) });
          await HolidayDate.insertMany(
            holidays.map(h => ({ ...h, calendarId: calendar._id }))
          );
          parsedCount = holidays.length;
        } else {
          console.warn("[HolidayCalendar] 0 holidays parsed. Full text:\n", rawText);
        }
      }
    } catch (parseErr) {
      console.error("[HolidayCalendar] Parse error:", parseErr.message);
      parseError = parseErr.message;
    }

    res.status(201).json({
      success: true, message: "Calendar uploaded successfully",
      parsedHolidays: parsedCount, parseError,
      data: {
        _id: calendar._id, title: calendar.title, year: calendar.year,
        fileName: calendar.fileName, fileSize: calendar.fileSize,
        mimeType: calendar.mimeType, createdAt: calendar.createdAt,
        fileUrl: `/api/holiday-calendar/view/${calendar._id}`
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================================
// GET ALL CALENDARS
// ========================================

exports.getCalendars = async (req, res) => {
  try {
    const calendars = await HolidayCalendar.find().sort({ createdAt: -1 });
    res.json({ success: true, data: calendars.map(item => ({
      _id: item._id, title: item.title, year: item.year,
      fileName: item.fileName, fileSize: item.fileSize,
      mimeType: item.mimeType, createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      fileUrl: `/api/holiday-calendar/view/${item._id}`
    }))});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================================
// VIEW CALENDAR
// ========================================

exports.viewCalendar = async (req, res) => {
  try {
    const calendar = await HolidayCalendar.findById(req.params.id);
    if (!calendar) return res.status(404).json({ success: false, message: "Calendar not found" });
    const buffer = Buffer.from(calendar.fileData);
    res.set({ "Content-Type": calendar.mimeType,
              "Content-Disposition": `inline; filename="${calendar.fileName}"`,
              "Content-Length": buffer.length });
    res.end(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================================
// DOWNLOAD CALENDAR
// ========================================

exports.downloadCalendar = async (req, res) => {
  try {
    const calendar = await HolidayCalendar.findById(req.params.id);
    if (!calendar) return res.status(404).json({ success: false, message: "Calendar not found" });
    const buffer = Buffer.from(calendar.fileData);
    res.set({ "Content-Type": calendar.mimeType,
              "Content-Disposition": `attachment; filename="${calendar.fileName}"`,
              "Content-Length": buffer.length });
    res.end(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================================
// DELETE CALENDAR
// ========================================

exports.deleteCalendar = async (req, res) => {
  try {
    const deleted = await HolidayCalendar.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Calendar not found" });
    await HolidayDate.deleteMany({ calendarId: deleted._id });
    res.json({ success: true, message: "Calendar deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========================================
// GET HOLIDAY DATES BY YEAR
// GET /api/holiday-calendar/dates/:year
// ========================================

exports.getHolidayDates = async (req, res) => {
  try {
    const holidays = await HolidayDate.find({ year: parseInt(req.params.year) }).sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};