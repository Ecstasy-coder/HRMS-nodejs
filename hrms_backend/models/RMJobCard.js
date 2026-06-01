const mongoose=require("mongoose");

const RMJobCardSchema=
new mongoose.Schema({

rm_name:{
type:String,
required:true
},

department:{
type:String,
required:true
},

project_name:{
type:String,
required:true
},

hours_worked:{
type:Number,
required:true
},

work_description:{
type:String,
required:true
},

status:{
type:String,
default:"pending"
},

rating:{
type:Number,
default:null
},

comment:{
type:String,
default:""
}

},{
timestamps:true
});

module.exports=
mongoose.model(
"RMJobCard",
RMJobCardSchema
);