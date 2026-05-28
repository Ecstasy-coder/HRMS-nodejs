const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db");
const attendanceRoutes = require("./routes/attendanceRoutes");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const profileRoutes =
    require("./routes/profileRoutes");
const app = express();
const jobRoutes =
    require(
        "./routes/jobCardRoutes"
    );
const eventRoutes = require(
    "./routes/eventRoutes"
);
const myJobCardsRoutes = require("./routes/myJobCardsRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



connectDB();

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/birthdays", birthdayRoutes);

app.use("/api/myjobcards", myJobCardsRoutes);

const leaveRoutes = require("./routes/leaveRoutes");
app.use("/api/leaves", leaveRoutes);
app.use(express.json());
app.use("/api/attendance", attendanceRoutes);
app.use(
    "/api/events",
    eventRoutes
);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tickets", ticketRoutes);
app.use(
    "/api",
    profileRoutes
);

app.use(
    "/api/jobcards",
    jobRoutes
);



// ========================================
// STATIC UPLOADS
// (HR Upload + View)
// ========================================

app.use(
    "/uploads",
    express.static(
        "uploads"
    )
);

// ========================================
// RM DOWNLOAD ROUTE ONLY
// (WILL NOT AFFECT HR)
// ========================================

app.get(
    "/download-calendar/:fileName",
    (
        req,
        res
    ) => {

        const filePath =
            path.join(
                __dirname,
                "uploads",
                "calendars",
                req.params.fileName
            );

        res.download(
            filePath,
            req.params.fileName,
            (err) => {

                if (err) {

                    console.log(
                        "Download Error:",
                        err
                    );

                }

            }
        );

    }
);

// ========================================
// HOLIDAY ROUTES
// ========================================

const holidayRoutes =
    require(
        "./routes/holidaycalendarroutes"
    );

app.use(
    "/api/holiday-calendar",
    holidayRoutes
);


app.get("/", (req, res) => {
    res.send("HRMS MongoDB Backend Running Successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});