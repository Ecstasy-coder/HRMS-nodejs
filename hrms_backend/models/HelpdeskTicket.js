const mongoose = require("mongoose");

const helpdeskSchema = new mongoose.Schema({

    ticketId:{
        type:String,
        required:true
    },

    subject:{
        type:String,
        required:true
    },

    employee:{
        type:String,
        required:true
    },

    department:{
        type:String,
        required:true
    },

    category:{
        type:String,
        required:true
    },

    priority:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    assignedTo:{
        type:String,
        default:""
    },

    status:{
        type:String,
        default:"Open"
    },

    date:{
        type:Date,
        default:Date.now
    }

});

module.exports=mongoose.model(
"HelpdeskTicket",
helpdeskSchema
);