const API_URL =
    "http://localhost:5000/api/holiday-calendar/all";

const container =
    document.getElementById(
        "calendarContainer"
    );

// ========================================
// LOAD HOLIDAY CALENDAR
// ========================================

async function loadCalendar() {

    try {

        // FETCH API DATA
        const response =
            await axios.get(
                API_URL
            );

        console.log(
            "API Response:",
            response.data
        );

        const calendars =
            response.data.data;

        // CLEAR OLD DATA
        container.innerHTML =
            "";

        // NO DATA FOUND
        if (!calendars ||
            calendars.length === 0
        ) {

            container.innerHTML = `

<div
  style="
    padding:40px;
    text-align:center;
    color:#64748b;
    font-size:16px;
    font-weight:500;
  "
>
  No Holiday Calendar Found
</div>

`;

            return;
        }

        // LOOP CALENDARS
        calendars.forEach(
            (calendar) => {

                // REMOVE BROKEN SYMBOLS
                const cleanTitle =
                    calendar.title.replace(
                        /[^a-zA-Z0-9 .-]/g,
                        ""
                    );

                container.innerHTML += `

<div class="holiday-item">

  <!-- LEFT SECTION -->

  <div class="left-section">

    <!-- PDF ICON -->

    <div class="pdf-icon-box">

      <i
        class="fa-regular fa-file-pdf"
      ></i>

    </div>

    <!-- FILE DETAILS -->

    <div class="holiday-info">

    <div class="file-name">

  <i class="fa-regular fa-calendar-days calendar-icon"></i>

  ${cleanTitle}

</div>

      <div class="file-meta">

        Year:
        ${calendar.year}

        · Size:
        ${calendar.fileSize}

        · Uploaded:
        ${new Date(
          calendar.createdAt
        ).toLocaleDateString(
          "en-GB"
        )}

      </div>

    </div>

  </div>

  <!-- RIGHT BUTTONS -->

  <div class="action-buttons">

    <!-- VIEW -->

    <a
      href="http://localhost:5000${calendar.filePath}"
      target="_blank"
      class="btn-view"
    >
      View Calendar
    </a>

    <!-- DOWNLOAD -->

    <a
      href="http://localhost:5000/download-calendar/${calendar.fileName}"
      class="btn-download"
    >
      Download PDF
    </a>

  </div>

</div>

`;

            }
        );

    } catch (error) {

        console.error(
            "Calendar Error:",
            error
        );

        container.innerHTML = `

<div
  style="
    padding:40px;
    text-align:center;
    color:red;
    font-size:16px;
    font-weight:600;
  "
>
  Failed to Load Holiday Calendar
</div>

`;

    }

}

// ========================================
// RUN FUNCTION
// ========================================

loadCalendar();