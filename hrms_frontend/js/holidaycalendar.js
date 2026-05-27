const API_URL =
    "http://localhost:5000/api/holiday-calendar";

const uploadBtn =
    document.getElementById("uploadBtn");

const tableBody =
    document.getElementById(
        "calendarTableBody"
    );

// ========================================
// UPLOAD CALENDAR
// ========================================
fetch('sidebar.html').then(r => r.text()).then(html => {
    document.getElementById('sidebar').innerHTML = html;

    // Highlight active nav link after sidebar is injected
    const currentFile = window.location.pathname
        .split('/').pop().toLowerCase().replace(/\s+/g, '').trim();

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        const linkFile = (link.getAttribute('href') || '')
            .split('/').pop().toLowerCase().replace(/\s+/g, '').trim();
        link.classList.remove('active');
        if (currentFile === linkFile) link.classList.add('active');
    });
});

uploadBtn.addEventListener(
    "click",
    async() => {

        const year =
            document.getElementById(
                "calendarYear"
            ).value;

        const file =
            document.getElementById(
                "calendarFile"
            ).files[0];

        if (!file) {

            alert(
                "Please select a file"
            );

            return;

        }

        const formData =
            new FormData();

        formData.append(
            "year",
            year
        );

        formData.append(
            "calendar",
            file
        );

        try {

            await axios.post(
                `${API_URL}/upload`,
                formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(
                "Calendar uploaded successfully"
            );

            document.getElementById(
                "calendarFile"
            ).value = "";

            loadCalendars();

        } catch (error) {

            console.log(error);

            alert("Upload failed");

        }

    }
);

// ========================================
// LOAD CALENDARS
// ========================================

async function loadCalendars() {

    try {

        const response =
            await axios.get(
                `${API_URL}/all`
            );

        const calendars =
            response.data.data;

        tableBody.innerHTML = "";

        calendars.forEach(
            (calendar) => {

                tableBody.innerHTML += `

<tr>

  <td class="file-column">

    <div class="file-name">

      <div class="pdf-icon">
        PDF
      </div>

      <div class="file-details">

        <span class="file-text">
          ${calendar.title}
        </span>

      </div>

    </div>

  </td>

  <td>
    ${calendar.year}
  </td>

  <td>

    <span class="file-type">
      PDF
    </span>

  </td>

  <td>
    ${calendar.fileSize}
  </td>

  <td>
    ${new Date(
      calendar.createdAt
    ).toLocaleDateString("en-GB")}
  </td>

  <td>

    <div class="actions">

      <a
        href="http://localhost:5000${calendar.filePath}"
        target="_blank"
      >

        <button class="view-btn">
          View
        </button>

      </a>

      <a
        href="http://localhost:5000${calendar.filePath}"
        download
      >

        <button class="download-btn">
          Download
        </button>

      </a>

      <button
        class="delete-btn"
        onclick="deleteCalendar('${calendar._id}')"
      >
        Delete
      </button>

    </div>

  </td>

</tr>

        `;
            }
        );

    } catch (error) {

        console.log(error);

    }

}

// ========================================
// DELETE CALENDAR
// ========================================

async function deleteCalendar(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this calendar?"
        );

    if (!confirmDelete) return;

    try {

        await axios.delete(
            `${API_URL}/delete/${id}`
        );

        alert(
            "Deleted successfully"
        );

        loadCalendars();

    } catch (error) {

        console.log(error);

    }

}

// ========================================
// INITIAL LOAD
// ========================================

loadCalendars();