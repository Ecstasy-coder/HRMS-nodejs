const MyJobCard = require("../models/MyJobCard");
exports.createMyJobCard = async(req, res) => {
    try {


        const {
            date,
            projectName,
            hoursWorked,
            workDescription
        } = req.body || {};

        if (!date || !projectName || !hoursWorked || !workDescription) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                receivedBody: req.body
            });
        }

        const jobCard = await MyJobCard.create({
            date,
            projectName,
            hoursWorked: Number(hoursWorked),
            workDescription,
            status: "Sent to HR"
        });

        res.status(201).json({
            success: true,
            message: "My job card sent to HR successfully",
            data: jobCard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating my job card",
            error: error.message
        });
    }
};


// GET ALL MY JOB CARDS
exports.getMyJobCards = async(req, res) => {
    try {
        const jobCards = await MyJobCard.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobCards.length,
            data: jobCards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching my job cards",
            error: error.message
        });
    }
};

// GET SINGLE MY JOB CARD
exports.getMyJobCardById = async(req, res) => {
    try {
        const jobCard = await MyJobCard.findById(req.params.id);

        if (!jobCard) {
            return res.status(404).json({
                success: false,
                message: "My job card not found"
            });
        }

        res.status(200).json({
            success: true,
            data: jobCard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching my job card",
            error: error.message
        });
    }
};

// DELETE MY JOB CARD
exports.deleteMyJobCard = async(req, res) => {
    try {
        const jobCard = await MyJobCard.findByIdAndDelete(req.params.id);

        if (!jobCard) {
            return res.status(404).json({
                success: false,
                message: "My job card not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "My job card deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting my job card",
            error: error.message
        });
    }
};