
// const Payslip = require("../models/Payslip");

// // Get all payslips
// exports.getAllPayslips = async (req, res) => {
//     try {
//         const payslips = await Payslip.find();
//         res.status(200).json(payslips);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get payslip by employee ID
// exports.getPayslipByEmployee = async (req, res) => {
//     try {
//         const { employeeId } = req.params;

//         const payslips = await Payslip.find({ employeeId });

//         if (!payslips.length) {
//             return res.status(404).json({ message: "No payslips found" });
//         }

//         res.status(200).json(payslips);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Create payslip
// exports.createPayslip = async (req, res) => {
//     try {
//         const newPayslip = new Payslip(req.body);
//         const savedPayslip = await newPayslip.save();

//         res.status(201).json(savedPayslip);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Update payslip
// exports.updatePayslip = async (req, res) => {
//     try {
//         const updatedPayslip = await Payslip.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );

//         if (!updatedPayslip) {
//             return res.status(404).json({ message: "Payslip not found" });
//         }

//         res.status(200).json(updatedPayslip);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete payslip
// exports.deletePayslip = async (req, res) => {
//     try {
//         const deletedPayslip = await Payslip.findByIdAndDelete(req.params.id);

//         if (!deletedPayslip) {
//             return res.status(404).json({ message: "Payslip not found" });
//         }

//         res.status(200).json({ message: "Payslip deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };



const Payroll = require("../models/payslip");

// Get all payslips OR filter by empCode / name
exports.getAllPayslips = async (req, res) => {
    try {
        const { empCode, name } = req.query;
        let query = {};

        if (empCode) query.empCode = empCode;
          if (name) query.employeeName = name; 

        const payslips = await Payroll.find(query);

        // return empty array instead of error
        res.status(200).json(payrolls);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get ONE payslip by employee code
exports.getPayslipByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const payroll = await Payroll.find({
            empCode: employeeId.trim()
        });

        if (!payroll) {
            return res.status(404).json({
                message: "Payslip not found"
            });
        }

        res.status(200).json(payroll);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Create payslip
exports.createPayslip = async (req, res) => {
    try {
        const newPayslip = new Payslip(req.body);
        const savedPayslip = await newPayslip.save();

        res.status(201).json(savedPayslip);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update payslip
exports.updatePayslip = async (req, res) => {
    try {
        const updatedPayslip = await Payslip.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedPayslip) {
            return res.status(404).json({ message: "Payslip not found" });
        }

        res.status(200).json(updatedPayslip);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete payslip
exports.deletePayslip = async (req, res) => {
    try {
        const deletedPayslip = await Payslip.findByIdAndDelete(req.params.id);

        if (!deletedPayslip) {
            return res.status(404).json({ message: "Payslip not found" });
        }

        res.status(200).json({
            message: "Payslip deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};