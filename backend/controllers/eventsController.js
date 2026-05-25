const {
  getEventsService,
} = require("../services/eventsService");

const getEvents = (req, res) => {

  const category = req.query.cat;

  const events = getEventsService(category);

  res.json(events);
};

module.exports = {
  getEvents,
};