const API =
    "http://localhost:5000/api/events/all";

let allEvents = [];

// ======================================
// LOAD EVENTS
// ======================================

async function loadEvents() {

    try {

        const response =
            await fetch(API);

        const data =
            await response.json();

        allEvents =
            data.data || [];

        renderEvents("all");

    } catch (error) {

        console.log(
            "Error:",
            error
        );
    }
}

// ======================================
// RENDER EVENTS
// ======================================

function renderEvents(category) {

    const wrapper =
        document.getElementById(
            "eventsWrapper"
        );

    const count =
        document.getElementById(
            "eventCount"
        );

    const today =
        new Date();

    today.setHours(
        0, 0, 0, 0
    );

    let filtered = [...allEvents];

    // ======================================
    // FILTER LOGIC
    // ======================================

    if (
        category ===
        "Performance Review"
    ) {

        // SHOW ONLY PAST EVENTS
        filtered =
            filtered.filter(
                event => {

                    const eventDate =
                        new Date(
                            event.date
                        );

                    eventDate.setHours(
                        0, 0, 0, 0
                    );

                    return (
                        eventDate <
                        today
                    );
                }
            );
    } else if (
        category !== "all"
    ) {

        filtered =
            filtered.filter(
                event =>
                event.category ===
                category
            );
    }

    // ======================================
    // SPLIT EVENTS
    // ======================================

    const upcomingEvents =
        filtered.filter(
            event => {

                const eventDate =
                    new Date(
                        event.date
                    );

                eventDate.setHours(
                    0, 0, 0, 0
                );

                return (
                    eventDate >=
                    today
                );
            }
        );

    const pastEvents =
        filtered.filter(
            event => {

                const eventDate =
                    new Date(
                        event.date
                    );

                eventDate.setHours(
                    0, 0, 0, 0
                );

                return (
                    eventDate <
                    today
                );
            }
        );

    // EVENT COUNT
    count.innerText =
        `${filtered.length} event${
        filtered.length !== 1
        ? "s"
        : ""
    }`;

    // ======================================
    // EMPTY STATE
    // ======================================

    if (
        filtered.length === 0
    ) {

        wrapper.innerHTML =
            `
        <div class="empty-state">

            <div class="empty-icon">
                ⭐
            </div>

            <h2>
                No events found
            </h2>

            <p>
                HR will post
                important events here.
                Check back soon.
            </p>

        </div>
        `;

        return;
    }

    // ======================================
    // CREATE EVENT CARD
    // ======================================

    function createCard(
        event,
        isPast
    ) {

        const eventDate =
            new Date(
                event.date
            );

        // REMOVE TIME
        eventDate.setHours(
            0, 0, 0, 0
        );

        const diffTime =
            eventDate -
            today;

        const daysLeft =
            Math.floor(
                diffTime /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );
        let statusText =
            "";

        if (
            isPast
        ) {

            statusText =
                "Passed";

        } else if (
            daysLeft === 0
        ) {

            statusText =
                "🎉 Today!";

        } else {

            statusText =
                `In ${daysLeft} day${
                daysLeft > 1
                ? "s"
                : ""
            }`;
        }

        return `

        <div class="
            event-card
            ${
                isPast
                ? "past-card"
                : "upcoming-card"
            }
        ">

            <div class="
                event-left
            ">

                <div class="
                    event-title
                ">
                    ${event.title}
                </div>

                <div class="
                    category-badge
                ">
                    ${event.category}
                </div>

                <div class="
                    event-date
                ">
                    ${eventDate.toDateString()}
                </div>

            </div>

           <div class="
    status-btn
    ${
        isPast
        ? "passed"
        : daysLeft === 0
        ? "celebration"
        : "upcoming"
    }
">
    ${statusText}
</div>

        </div>
        `;
    }

    // ======================================
    // HTML RENDER
    // ======================================

    let html = "";

    // UPCOMING EVENTS
    if (
        upcomingEvents.length > 0
    ) {

        html += `

        <div class="
            section-header
        ">

            <span class="
                green-dot
            "></span>

            UPCOMING EVENTS
            (
            ${upcomingEvents.length}
            )

        </div>

        <div class="
            section-line
        "></div>

        `;

        upcomingEvents.forEach(
            event => {

                html +=
                    createCard(
                        event,
                        false
                    );
            }
        );
    }

    // PAST EVENTS
    if (
        pastEvents.length > 0
    ) {

        html += `

        <div class="
            section-header
            past-header
        ">

            <span class="
                gray-dot
            "></span>

            PAST EVENTS
            (
            ${pastEvents.length}
            )

        </div>

        <div class="
            section-line
        "></div>

        `;

        pastEvents.forEach(
            event => {

                html +=
                    createCard(
                        event,
                        true
                    );
            }
        );
    }

    wrapper.innerHTML =
        html;
}

// ======================================
// FILTER BUTTON CLICK
// ======================================

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (document.querySelector(".filter-btn.active")) {
                    document
                        .querySelector(".filter-btn.active")
                        .classList.remove("active");
                }

                button
                    .classList.add(
                        "active"
                    );

                renderEvents(
                    button.dataset
                    .category
                );
            }
        );
    });

// ======================================
// INITIAL LOAD
// ======================================

loadEvents();