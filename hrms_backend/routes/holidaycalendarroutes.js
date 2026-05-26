const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    uploadCalendar,
    getCalendars,
    deleteCalendar,
} = require("../controllers/holidayCalendarController");

// ========================================
// CREATE FOLDER IF NOT EXISTS
// ========================================

const uploadPath =
    path.join(
        __dirname,
        "../uploads/calendars"
    );

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {
        recursive: true,
    });

}

// ========================================
// MULTER STORAGE
// ========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s/g, "-");

        cb(null, uniqueName);

    },

});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedTypes = [

        "application/pdf",

        "image/png",

        "image/jpeg",

        "image/jpg",

    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF, PNG, JPG files are allowed"
            ),
            false
        );

    }

};

// ========================================
// MULTER CONFIG
// ========================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024,

    },

});

// ========================================
// ROUTES
// ========================================

// Upload Calendar
router.post(
    "/upload",
    upload.single("calendar"),
    uploadCalendar
);

// Get All Calendars
router.get(
    "/all",
    getCalendars
);

// Delete Calendar
router.delete(
    "/delete/:id",
    deleteCalendar
);

// ========================================
// EXPORT
// ========================================

module.exports = router;