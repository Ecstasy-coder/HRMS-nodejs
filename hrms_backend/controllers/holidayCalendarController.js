const HolidayCalendar = require(
    "../models/HolidayCalendar"
);

// ========================================
// UPLOAD CALENDAR
// ========================================

const uploadCalendar = async(
    req,
    res
) => {

    try {

        console.log(req.file);

        // CHECK FILE
        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "No file uploaded",

            });

        }

        // CREATE DATA
        const newCalendar =
            new HolidayCalendar({

                title: req.file.originalname,

                year: req.body.year,

                fileName: req.file.filename,

                filePath: `/uploads/calendars/${req.file.filename}`,

                fileType: req.file.mimetype,

                fileSize: `${(
            req.file.size / 1024
          ).toFixed(2)} KB`,

                uploadedBy: "HR Admin",

            });

        // SAVE
        await newCalendar.save();

        // RESPONSE
        res.status(201).json({

            success: true,

            message: "Calendar uploaded successfully",

            data: newCalendar,

        });

    } catch (error) {

        console.log(
            "UPLOAD ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Upload failed",

            error: error.message,

        });

    }

};

// ========================================
// GET ALL CALENDARS
// ========================================

const getCalendars = async(
    req,
    res
) => {

    try {

        const calendars =
            await HolidayCalendar.find()
            .sort({
                createdAt: -1,
            });

        res.status(200).json({

            success: true,

            data: calendars,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to fetch calendars",

        });

    }

};

// ========================================
// DELETE CALENDAR
// ========================================

const deleteCalendar = async(
    req,
    res
) => {

    try {

        await HolidayCalendar.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({

            success: true,

            message: "Deleted successfully",

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Delete failed",

        });

    }

};

// ========================================
// EXPORT
// ========================================

module.exports = {

    uploadCalendar,

    getCalendars,

    deleteCalendar,

};