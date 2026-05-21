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

const app = express();

app.use(cors());

app.use(express.json());

app.use(
express.static(
path.join(__dirname,"frontend")
)
);

app.use("/api",salaryRoutes);

app.use("/api",payrollRoutes);

app.use("/api",payslipRoutes);

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
app.get("/", (req, res) => {
   res.sendFile(path.join(__dirname, "frontend", "payroll.html"));

});

app.listen(5000,()=>{

console.log(
"Server running on port 5000"
);

});