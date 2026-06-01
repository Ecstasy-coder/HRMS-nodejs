const express=require("express");
const router=express.Router();

const AboutUs=
require("../models/AboutUs");


// GET ABOUT DATA

router.get("/",async(req,res)=>{

try{

let data=
await AboutUs.findOne();

if(!data){

data=
await AboutUs.create({});

}

res.json({

success:true,
data

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false,
message:"Server Error"

});

}

});




// SAVE ABOUT DATA

router.post("/",async(req,res)=>{

try{

const{

companyName,
heroTagline,
mission,
values,
quote1,
quote2

}=req.body;

let data=
await AboutUs.findOne();

if(!data){

data=
new AboutUs();

}

data.companyName=
companyName;

data.heroTagline=
heroTagline;

data.mission=
mission;

data.values=
values;

data.quote1=
quote1;

data.quote2=
quote2;

await data.save();

res.json({

success:true,
message:"Saved Successfully"

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false,
message:"Save Failed"

});

}

});

module.exports=router;