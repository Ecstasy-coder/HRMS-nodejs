const express = require("express");

const path = require("path");

require("dotenv").config();

const mongoose = require("mongoose");

const cors = require("cors");

const salaryRoutes =
require("./routes/salaryRoutes");

const payrollRoutes =
require("./routes/payrollRoutes");

const payslipRoutes = require("./routes/payslipRoutes");

const eventsRoutes =
require("./routes/HolidayCalendarRoutes");


const app = express();

app.use(cors());

app.use(express.json());

app.use(
express.static(
path.join(__dirname,"../frontend")
)
);

app.use("/api/salary",salaryRoutes);

app.use("/api/payroll",payrollRoutes);

app.use("/api/payslip",payslipRoutes);

app.use("/api/holiday-calendar",eventsRoutes);

mongoose.connect(process.env.MONGO_URL)

.then(()=>{

console.log(
"MongoDB Atlas Connected"
);

})

.catch((err)=>{

console.log(err);

});

// app.get("/",(req,res)=>{

// res.send(
// "HRMS API Running"
// );

//});

app.get("/sidebar", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "sidebar.html")
   );
});

app.get("/dashboard", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "dashboard.html")
   );
});

app.get("/salary-structure", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "salary-structure.html")
   );
});

app.get("/payroll", (req, res) => {
   res.sendFile(path.join(__dirname, "../frontend", "payroll.html"));

});

app.get("/payslip", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "payslip.html")
   );
});

app.get("/paybill", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "paybill.html")
   );
});

app.get("/importantEvent", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "importantEvent.html")
   );
});

app.get("/attendance", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "attendance.html")
   );
});

app.get("/holiday", (req, res) => {
   res.sendFile(
      path.join(__dirname, "../frontend", "holiday-calendar.html")
   );
});


app.listen(5000,()=>{

console.log(
"Server running on port 5000"
);

});