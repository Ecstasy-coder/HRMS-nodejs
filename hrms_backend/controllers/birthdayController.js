const Userbirthdays = require("../models/Userbirthdays");

function daysUntilBirthday(dob) {
    const today = new Date();
    const birthDate = new Date(dob);

    const nextBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    );

    today.setHours(0, 0, 0, 0);
    nextBirthday.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return Math.ceil(
        (nextBirthday - today) /
        (1000 * 60 * 60 * 24)
    );
}



exports.getBirthdays = async(req, res) => {
    try {
        const employees = await Userbirthdays.find({})
            .select("fullName email department designation birthday joinedDate phone status");

        res.status(200).json({
            success: true,
            employees: employees
        });

    } catch (error) {
        console.log("BIRTHDAY API ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Birthday fetch failed",
            error: error.message
        });
    }
};