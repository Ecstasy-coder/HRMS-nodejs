    const express =
        require("express");

    const router =
        express.Router();

    const {
        addEvent,
        getAllEvents,
    } = require(
        "../controllers/eventController"
    );

    router.post(
        "/add",
        addEvent
    );

    router.get(
        "/all",
        getAllEvents
    );

    module.exports =
        router;