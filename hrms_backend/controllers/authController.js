// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const generateToken = (user) => {
//     return jwt.sign({
//             id: user._id,
//             role: user.role,
//             email: user.email,
//         },
//         process.env.JWT_SECRET, { expiresIn: "1d" }
//     );
// };

// // First Admin Register
// const registerAdmin = async(req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         const existingAdmin = await User.findOne({ role: "admin" });

//         if (existingAdmin) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Admin already exists",
//             });
//         }

//         const existingEmail = await User.findOne({ email });

//         if (existingEmail) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email already exists",
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role: "admin",
//         });

//         res.status(201).json({
//             success: true,
//             message: "Admin registered successfully",
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Admin registration failed",
//             error: error.message,
//         });
//     }
// };

// // Login for all roles
// const login = async(req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Invalid email or password",
//             });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid email or password",
//             });
//         }

//         const token = generateToken(user);

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Login failed",
//             error: error.message,
//         });
//     }
// };

// // Admin creates HR and Finance
// const adminCreateUser = async(req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         const allowedRoles = ["hr", "finance"];

//         if (!allowedRoles.includes(role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Admin can create only HR and Finance",
//             });
//         }

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email already exists",
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//             createdBy: req.user._id,
//         });

//         res.status(201).json({
//             success: true,
//             message: `${role} created successfully by Admin`,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "User creation failed",
//             error: error.message,
//         });
//     }
// };

// // HR creates Manager and Employee
// const hrCreateUser = async(req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         const allowedRoles = ["manager", "employee"];

//         if (!allowedRoles.includes(role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "HR can create only Manager and Employee",
//             });
//         }

//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email already exists",
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//             createdBy: req.user._id,
//         });

//         res.status(201).json({
//             success: true,
//             message: `${role} created successfully by HR`,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "User creation failed",
//             error: error.message,
//         });
//     }
// };

// module.exports = {
//     registerAdmin,
//     login,
//     adminCreateUser,
//     hrCreateUser,
// };






const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign({
            id: user._id,
            role: user.role,
            email: user.email,
        },
        process.env.JWT_SECRET, { expiresIn: "1d" }
    );
};

// First Admin Register
const registerAdmin = async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (employeeId) {
            const existingEmployeeId = await User.findOne({ employeeId });

            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID already exists",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,
            managerId: null,
            createdBy: null,
        });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                employeeId: admin.employeeId,
                department: admin.department,
                designation: admin.designation,
                phoneNumber: admin.phoneNumber,
                dateOfBirth: admin.dateOfBirth,
                dateOfJoining: admin.dateOfJoining,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Admin registration failed",
            error: error.message,
        });
    }
};

// Login for all roles
const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate(
            "managerId",
            "name email role employeeId department designation"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                department: user.department,
                designation: user.designation,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                dateOfJoining: user.dateOfJoining,
                managerId: user.managerId,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// Admin creates HR and Finance only
const adminCreateUser = async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required",
            });
        }

        const allowedRoles = ["hr", "finance"];

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Admin can create only HR and Finance",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (employeeId) {
            const existingEmployeeId = await User.findOne({ employeeId });

            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID already exists",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,

            // HR and Finance do not have manager
            managerId: null,

            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: `${role} created successfully by Admin`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                department: user.department,
                designation: user.designation,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                dateOfJoining: user.dateOfJoining,
                managerId: user.managerId,
                createdBy: user.createdBy,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User creation failed",
            error: error.message,
        });
    }
};

// HR creates Manager and Employee
const hrCreateUser = async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,
            managerId,
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required",
            });
        }

        const allowedRoles = ["manager", "employee"];

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                message: "HR can create only Manager and Employee",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (employeeId) {
            const existingEmployeeId = await User.findOne({ employeeId });

            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID already exists",
                });
            }
        }

        let finalManagerId = null;

        // Manager assign only for employee
        if (role === "employee") {
            if (!managerId) {
                return res.status(400).json({
                    success: false,
                    message: "Manager is required for employee creation",
                });
            }

            const manager = await User.findOne({
                _id: managerId,
                role: "manager",
            });

            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Selected manager not found",
                });
            }

            finalManagerId = managerId;
        }

        // If role is manager, managerId is always null
        if (role === "manager") {
            finalManagerId = null;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            employeeId,
            department,
            designation,
            phoneNumber,
            dateOfBirth,
            dateOfJoining,
            managerId: finalManagerId,
            createdBy: req.user._id,
        });

        const createdUser = await User.findById(user._id)
            .select("-password")
            .populate("managerId", "name email role employeeId department designation")
            .populate("createdBy", "name email role");

        res.status(201).json({
            success: true,
            message: `${role} created successfully by HR`,
            user: createdUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User creation failed",
            error: error.message,
        });
    }
};

module.exports = {
    registerAdmin,
    login,
    adminCreateUser,
    hrCreateUser,
};

//