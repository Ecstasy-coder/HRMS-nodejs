const Ticket = require("../models/Ticket");

const createTicket = async(req, res) => {
    try {
        const { subject, category, priority, description } = req.body;

        if (!subject || !category || !priority || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const ticket = await Ticket.create({
            subject,
            category,
            priority,
            description
        });

        res.status(201).json({
            success: true,
            message: "Ticket raised successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Ticket creation failed",
            error: error.message
        });
    }
};

const getAllTickets = async(req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tickets",
            error: error.message
        });
    }
};

module.exports = {
    createTicket,
    getAllTickets
};