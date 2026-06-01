const express = require("express");
const router = express.Router();

const RMJobCard =
require("../models/RMJobCard");


// CREATE CARD
router.post("/", async(req,res)=>{

try{

const{
rm_name,
department,
project_name,
hours_worked,
work_description
}=req.body;

const newCard=
new RMJobCard({

rm_name,
department,
project_name,
hours_worked,
work_description

});

await newCard.save();

res.json({

success:true,
message:"Job Card created successfully",
data:newCard

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false,
message:"Failed to create job card"

});

}

});


// GET ALL
router.get("/",async(req,res)=>{

try{

const cards=
await RMJobCard.find()
.sort({createdAt:-1});

res.json(cards);

}
catch(err){

console.log(err);

res.status(500).json({
message:"Server Error"
});

}

});

module.exports=router;