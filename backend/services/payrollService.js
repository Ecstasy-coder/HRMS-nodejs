const calculatePayroll = (

basic,

bonus,

deductions

)=>{

const grossSalary =

basic + bonus;

const netSalary =

grossSalary - deductions;

return {

grossSalary,

netSalary

};

};

module.exports =
calculatePayroll;