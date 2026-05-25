const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req,file,cb)=>{
        cb(null,"uploads/calendars");
    },

    filename:(req,file,cb)=>{

        cb(
            null,
            Date.now() +
            "_" +
            file.originalname.replace(/\s+/g,"_")
        );
    }

});

const fileFilter=(req,file,cb)=>{

const allowed=[
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
];

if(allowed.includes(file.mimetype)){
    cb(null,true);
}else{
    cb(
        new Error(
            "Only PDF, PNG and JPG allowed"
        )
    );
}

};

module.exports=multer({

storage,

limits:{
fileSize:10*1024*1024
},

fileFilter

});