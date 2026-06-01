const express=
require("express");

const router=
express.Router();

const {

getCompany,
updateCompany

}=
require(
"../controllers/companyController"
);

router.get(
"/",
getCompany
);

router.put(
"/",
updateCompany
);

module.exports=
router;