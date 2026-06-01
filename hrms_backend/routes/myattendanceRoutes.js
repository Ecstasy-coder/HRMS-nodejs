const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const Attendance = require("../models/Attendance");


// MULTER

const storage = multer.diskStorage({

    destination: function(req, file, cb) {

        cb(null, "uploads/");
    },

    filename: function(req, file, cb) {

        cb(null, Date.now() + "-" + file.originalname);
    }

});

const upload = multer({ storage });


// CSV UPLOAD

router.post("/upload", upload.single("file"), async (req, res) => {

    const results = [];

    fs.createReadStream(req.file.path)

    .pipe(csv())

    .on("data", (data) => {

        results.push(data);

    })

    .on("end", async () => {

        try {

            for(const row of results){

                await Attendance.create({

                    employeeId: row.employeeId,
                    date: row.date,
                    punchIn: row.punchIn,
                    punchOut: row.punchOut,
                    workingHours: row.workingHours,
                    status: row.status

                });

            }

            res.json({

                success: true,
                message: "Attendance Uploaded Successfully"

            });

        } catch(error){

            res.status(500).json({

                success:false,
                message:error.message

            });

        }

    });

});


// GET EMPLOYEE ATTENDANCE

router.get("/:employeeId", async (req, res) => {

    const attendance = await Attendance.find({

        employeeId:req.params.employeeId

    });

    res.json(attendance);

});

module.exports = router;