const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/calendarUpload");

const {
  uploadCalendar,
  getCalendars,
  viewCalendar,
  downloadCalendar,
  deleteCalendar,
  getHolidayDates          // ← NEW
} = require("../controllers/holidayCalendarController");


router.post(
  "/upload",
  upload.single("calendar"),
  uploadCalendar
);

router.get(
  "/all",
  getCalendars
);

router.get(
  "/view/:id",
  viewCalendar
);

router.get(
  "/download/:id",
  downloadCalendar
);

router.delete(
  "/delete/:id",
  deleteCalendar
);

// ── NEW: returns structured holiday dates for a given year
// Called by attendance pages to populate calendar holiday badges
router.get(
  "/dates/:year",
  getHolidayDates
);


module.exports = router;