const express = require("express");

const router = express.Router();

const upload =
require("../middleware/calendarUpload");

const {

uploadCalendar,

getCalendars,

viewCalendar,

deleteCalendar

} = require(
"../controllers/holidayCalendarController"
);


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


router.delete(
"/delete/:id",
deleteCalendar
);


module.exports = router;