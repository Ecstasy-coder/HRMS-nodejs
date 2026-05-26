const express = require("express");
const router = express.Router();

const {
    createTicket,
    getAllTickets
} = require("../controllers/ticketController");
router.get("/test", (req, res) => {
    res.send("Ticket routes working");
});
router.post("/raise", createTicket);
router.get("/all", getAllTickets);

module.exports = router;