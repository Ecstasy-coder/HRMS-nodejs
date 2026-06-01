const RMJobCard=
require("../models/RMJobCard");


// CREATE CARD
exports.createRMCard=
async(req,res)=>{

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
message:"RM Job Card submitted",
card:newCard

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false,
message:"Submission failed"

});

}

};


// GET ALL CARDS
exports.getAllCards=
async(req,res)=>{

try{

const cards=
await RMJobCard.find()
.sort({submittedAt:-1});

res.json({

success:true,
cards

});

}
catch(err){

res.status(500).json({
message:"Error"
});

}

};


// REVIEW CARD
exports.reviewCard=
async(req,res)=>{

try{

const{
status,
comment,
rating
}=req.body;

const updated=
await RMJobCard.findByIdAndUpdate(

req.params.id,

{

status,
comment,
rating,
reviewedAt:new Date()

},

{new:true}

);

res.json({

success:true,
message:"Reviewed successfully",
card:updated

});

}
catch(err){

res.status(500).json({

message:"Review failed"

});

}

};