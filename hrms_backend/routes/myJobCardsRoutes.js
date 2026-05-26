const express = require("express");
const router = express.Router();

const {
    createMyJobCard,
    getMyJobCards,
    getMyJobCardById,
    deleteMyJobCard
} = require("../controllers/myJobCardsController");

router.post("/", createMyJobCard);
router.get("/", getMyJobCards);
router.get("/:id", getMyJobCardById);
router.delete("/:id", deleteMyJobCard);

module.exports = router;