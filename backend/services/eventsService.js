const getEventsService = (category) => {

  const events = [

    {
      title: "Monthly Awards",

      category: "Performance Review",

      type: "review",

      date: "Thursday, 21 May 2026",

      description:
      "All employees should attend the review meeting.",

      days: "🎉 Today!",

      line: "#7c3aed",

      badgeBg: "#fff0dc",

      badgeColor: "#ff7a00",
    },

    {
      title: "Town Hall Meeting",

      category: "Town Hall",

      type: "townhall",

      date: "Saturday, 23 May 2026",

      description:
      "Quarterly company townhall discussion.",

      days: "In 2 days",

      line: "#0891b2",

      badgeBg: "#dffcf3",

      badgeColor: "#0f9f74",
    },

    {
      title: "Finance Deadline",

      category: "Deadline",

      type: "deadline",

      date: "25 May 2026",

      description:
      "Final deadline for finance reports.",

      days: "In 5 days",

      line: "#dc2626",

      badgeBg: "#fee2e2",

      badgeColor: "#dc2626",
    },

    {
      title: "Company Event",

      category: "Company Event",

      type: "event",

      date: "30 May 2026",

      description:
      "Annual company celebration event.",

      days: "In 10 days",

      line: "#2563eb",

      badgeBg: "#dbeafe",

      badgeColor: "#2563eb",
    },

    {
      title: "General Notice",

      category: "Other",

      type: "other",

      date: "1 June 2026",

      description:
      "General HR announcements and notices.",

      days: "In 12 days",

      line: "#6b7280",

      badgeBg: "#f3f4f6",

      badgeColor: "#374151",
    },

  ];

  if (
    !category ||
    category === "all"
  ) {

    return events;

  }

  return events.filter(
    (event) =>
      event.type === category
  );
};

module.exports = {
  getEventsService,
};