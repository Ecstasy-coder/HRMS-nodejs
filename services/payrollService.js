const calculatePayroll = (
    basicSalary,
    hra,
    bonus,
    deductions,
    presentDays,
    totalWorkingDays
) => {

    // Salary per day
    const perDaySalary = basicSalary / totalWorkingDays;

    // Salary earned based on attendance
    const earnedBasic = perDaySalary * presentDays;

    // Gross salary
    const grossSalary = earnedBasic + hra + bonus;

    // Net salary
    const netSalary = grossSalary - deductions;

    return {
        presentDays,
        totalWorkingDays,
        earnedBasic,
        grossSalary,
        netSalary
    };
};

module.exports = calculatePayroll;