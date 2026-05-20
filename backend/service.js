const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://127.0.0.1:27017/hrms"
);

app.get("/", (req, res) => {
  res.send("HRMS Backend Running");
});

const jobRoutes =
require("./routes/jobCardRoutes");

app.use("/api/jobcards", jobRoutes);

app.listen(5000, () => {
  console.log("Server Running");
});