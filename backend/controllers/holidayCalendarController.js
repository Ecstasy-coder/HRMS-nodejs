const HolidayCalendar =
require("../models/HolidayCalendar");

const fs=require("fs");
const path=require("path");

exports.uploadCalendar=
async(req,res)=>{

try{

if(!req.file){

return res.status(400).json({
message:"No file uploaded"
});

}

const fileSize=(
req.file.size/
(1024*1024)
).toFixed(2)+" MB";

const calendar=
await HolidayCalendar.create({

title:req.file.originalname,

year:req.body.year,

filePath:
"/uploads/calendars/"
+
req.file.filename,

fileName:req.file.filename,

fileSize,

mimeType:req.file.mimetype

});

res.status(201).json({

success:true,
data:calendar

});

}catch(err){

res.status(500).json({
message:err.message
});

}

};



exports.getCalendars=
async(req,res)=>{

try{

const data=
await HolidayCalendar
.find()
.sort({
createdAt:-1
});

res.json({

success:true,
data

});

}catch(err){

res.status(500).json({
message:err.message
});

}

};



exports.deleteCalendar=
async(req,res)=>{

try{

const calendar=
await HolidayCalendar.findById(
req.params.id
);

if(!calendar){

return res.status(404)
.json({
message:"Calendar not found"
});

}

const filePath=
path.join(
__dirname,
"..",
calendar.filePath
);

if(
fs.existsSync(filePath)
){

fs.unlinkSync(filePath);

}

await HolidayCalendar.findByIdAndDelete(
req.params.id
);

res.json({

success:true,
message:"Deleted successfully"

});

}catch(err){

res.status(500).json({
message:err.message
});

}

};