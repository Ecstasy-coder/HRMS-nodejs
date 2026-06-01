const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({

    companyName:{
        type:String
    },

    email:{
        type:String
    },

    phone:{
        type:String
    },

    website:{
        type:String
    },

    address:{
        type:String
    },

    description:{
        type:String
    }

},
{
    timestamps:true
});

module.exports=
mongoose.model(
"Company",
companySchema
);