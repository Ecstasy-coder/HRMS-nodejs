const Company=
require("../models/Company");


// GET company details
exports.getCompany=
async(req,res)=>{

try{

const company=
await Company.findOne();

res.json(company);

}
catch(err){

res.status(500).json({
message:err.message
});

}

};


// SAVE/UPDATE company
exports.updateCompany=
async(req,res)=>{

try{

let company=
await Company.findOne();

if(company){

company=
await Company.findByIdAndUpdate(

company._id,
req.body,
{new:true}

);

}
else{

company=
await Company.create(
req.body
);

}

res.json({

success:true,
company

});

}
catch(err){

res.status(500).json({
message:err.message
});

}

};