const mongoose=require("mongoose");

const aboutUsSchema=new mongoose.Schema({

companyName:{
type:String,
default:""
},

heroTagline:{
type:String,
default:""
},

mission:{
type:String,
default:""
},

values:{
type:String,
default:""
},

quote1:{
type:String,
default:""
},

quote2:{
type:String,
default:""
}

});

module.exports=
mongoose.model(
"AboutUs",
aboutUsSchema
);