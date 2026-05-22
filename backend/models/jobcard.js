const mongoose = require("mongoose");

const JobCardSchema =
new mongoose.Schema({

  employeeName:String,

  department:String,

  projectName:String,

  hoursWorked:String,

  workDescription:String,

  date:String,

  status:{
    type:String,
    default:"Pending"
  },

  managerComment:{
    type:String,
    default:""
  },

  rating:{
    type:Number,
    default:0
  }

});

module.exports =
mongoose.model(
  "JobCard",
  JobCardSchema
);