const Event = require(
    "../models/Events"
);

// ADD EVENT
const addEvent = async(
    req,
    res
) => {
    try {
        const newEvent =
            await Event.create(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Event Added Successfully",
            data: newEvent,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET EVENTS
const getAllEvents =
    async(req, res) => {
        try {
            const events =
                await Event.find();

            res.status(200).json({
                success: true,
                data: events,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

module.exports = {
    addEvent,
    getAllEvents,
};