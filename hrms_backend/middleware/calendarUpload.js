const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowed = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PDF, PNG and JPG allowed"
            )
        );
    }
};

module.exports = multer({

    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter
});