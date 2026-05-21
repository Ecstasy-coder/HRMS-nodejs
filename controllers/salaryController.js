const SalaryStructure = require("../models/SalaryStructure");

const getSalary = async (req, res) => {

try {

const data = await SalaryStructure.find();

res.json(data);

}

catch (error) {

res.status(500).json({

message: error.message

});

}

};

const createSalary = async (req, res) => {

try {

const salary = await SalaryStructure.create(req.body);

res.json(salary);

}

catch (error) {

res.status(500).json({

message: error.message

});

}

};

module.exports = {

getSalary,

createSalary

};