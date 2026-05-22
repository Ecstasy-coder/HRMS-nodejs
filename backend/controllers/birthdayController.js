// const User = require("../models/User");

// const {
//   daysUntilBirthday
// } = require("../utils/birthdayUtils");

// /* =========================
//    GET BIRTHDAY DATA
// ========================= */

// exports.getBirthdays = async (req, res) => {

//   try {

//     const employees = await User.find({

//       isActive: true,

//       dateOfBirth: { $ne: null }

//     });

//     const formatted = employees.map(emp => {

//       const dob = new Date(emp.dateOfBirth);

//       return {

//         _id: emp._id,

//         name: emp.name,

//         email: emp.email,

//         department: emp.department,

//         dateOfBirth: dob,

//         birthday: dob.toLocaleDateString(
//           "en-IN",
//           {
//             day: "2-digit",
//             month: "long"
//           }
//         ),

//         age:
//           new Date().getFullYear()
//           - dob.getFullYear(),

//         daysUntil:
//           daysUntilBirthday(dob)

//       };

//     });

//     formatted.sort(
//       (a, b) =>
//         a.daysUntil - b.daysUntil
//     );

//     const todayBirthdays =
//       formatted.filter(
//         e => e.daysUntil === 0
//       );

//     const thisMonthCount =
//       formatted.filter(e => {

//         return (
//           new Date(e.dateOfBirth)
//             .getMonth()
//           ===
//           new Date().getMonth()
//         );

//       }).length;

//     const nextBirthday =
//       formatted.find(
//         e => e.daysUntil > 0
//       );

//     res.json({

//       totalEmployees:
//         formatted.length,

//       todayBirthdays,

//       thisMonthCount,

//       nextBirthday,

//       employees: formatted

//     });

//   } catch (err) {

//     res.status(500).json({
//       message: err.message
//     });

//   }

// };


const User = require("../models/User");

function daysUntilBirthday(dob) {
  const today = new Date();
  const birthDate = new Date(dob);

  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  today.setHours(0,0,0,0);
  nextBirthday.setHours(0,0,0,0);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.ceil(
    (nextBirthday - today) /
    (1000 * 60 * 60 * 24)
  );
}

exports.getBirthdays = async (req, res) => {
  try {

    const employees = await User.find({
      birthday: { $exists: true, $ne: "" }
    });

    const formatted = employees.map(emp => ({
      _id: emp._id,
      name: emp.fullName,
      email: emp.email,
      department: emp.department || "",
      birthday: emp.birthday,
      age:
        new Date().getFullYear()
        - new Date(emp.birthday).getFullYear(),

      daysUntil:
        daysUntilBirthday(emp.birthday)
    }));

    formatted.sort(
      (a,b) => a.daysUntil - b.daysUntil
    );

    const todayBirthdays =
      formatted.filter(
        x => x.daysUntil === 0
      );

    const thisMonthCount =
      formatted.filter(x =>
        new Date(x.birthday).getMonth() ===
        new Date().getMonth()
      ).length;

    const nextBirthday =
      formatted.find(
        x => x.daysUntil > 0
      );

    res.json({
      totalEmployees: formatted.length,
      todayBirthdays,
      thisMonthCount,
      nextBirthday,
      employees: formatted
    });

  }
  catch(err){
    console.error(err);

    res.status(500).json({
      message:"Failed to fetch birthdays"
    });
  }
};