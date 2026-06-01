const express = require("express");
const router = express.Router();

const HelpdeskTicket = require("../models/HelpdeskTicket");


/* ===================================
   Employee creates ticket
=================================== */

router.post(
"/tickets",
async(req,res)=>{

try{

const{

subject,
employee,
department,
category,
priority,
description

}=req.body;


const ticket=new HelpdeskTicket({

ticketId:
"TKT-"+Date.now(),

subject,
employee,
department,
category,
priority,
description,

assignedTo:"",

status:"Open"

});


await ticket.save();


res.json({

success:true,
message:"Ticket Created"

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



/* ===================================
   HR gets all tickets
=================================== */

router.get(
"/tickets",
async(req,res)=>{

try{

const tickets=

await HelpdeskTicket.find()
.sort({

date:-1

});


res.json({

tickets

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false

});

}

});




/* ===================================
   Update ticket
=================================== */

router.patch(
"/tickets/:id",
async(req,res)=>{

try{

await HelpdeskTicket.updateOne(

{

ticketId:
req.params.id

},

{

$set:req.body

}

);


res.json({

success:true

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false

});

}

});




/* ===================================
   HR assignee list
=================================== */

router.get(
"/assignees",
async(req,res)=>{

try{

const users=[

{
name:"HR Admin"
},

{
name:"IT Desk"
},

{
name:"Admin Team"
},

{
name:"Anusha HR"
}

];


res.json(users);

}
catch(err){

console.log(err);

res.status(500).json({

success:false

});

}

});


module.exports=router;