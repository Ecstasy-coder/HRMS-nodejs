const API_URL = "http://localhost:5000/api/myjobcards";

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

const form = document.getElementById("myJobCardForm");
const tableBody = document.getElementById("myJobCardsBody");

document.addEventListener("DOMContentLoaded", () => {
    loadMyJobCards();
});

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
        date: document.getElementById("date").value,
        projectName: document.getElementById("projectName").value.trim(),
        hoursWorked: Number(document.getElementById("hoursWorked").value),
        workDescription: document.getElementById("workDescription").value.trim()
    };

    console.log("Sending Data:", data);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log("POST RESULT:", result);

        if (result.success) {
            alert("Job card sent to HR successfully");
            form.reset();
            loadMyJobCards();
        } else {
            alert(result.message || "Failed to send job card");
        }
    } catch (error) {
        console.error("Create job card error:", error);
        alert("Unable to connect backend. Check CORS/server.");
    }
});

async function loadMyJobCards() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            mode: "cors"
        });

        const result = await response.json();

        console.log("GET RESULT:", result);

        const cards = result.data || [];

        tableBody.innerHTML = "";

        if (cards.length === 0) {
            tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty">No job cards submitted yet</td>
        </tr>
      `;
            return;
        }

        cards.forEach((card) => {
            const row = document.createElement("tr");

            row.innerHTML = `
        <td>${card.date || "-"}</td>
        <td>${card.projectName || "-"}</td>
        <td>${card.hoursWorked || 0}</td>
        <td>${card.workDescription || "-"}</td>
        <td><span class="status">${card.status || "Sent to HR"}</span></td>
        <td>
          <button class="delete-btn" onclick="deleteMyJobCard('${card._id}')">
            Delete
          </button>
        </td>
      `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Fetch job cards error:", error);

        tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">Unable to fetch job cards</td>
      </tr>
    `;
    }
}

async function deleteMyJobCard(id) {
    const confirmDelete = confirm("Are you sure you want to delete this job card?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            mode: "cors"
        });

        const result = await response.json();

        if (result.success) {
            alert("Job card deleted successfully");
            loadMyJobCards();
        } else {
            alert(result.message || "Delete failed");
        }
    } catch (error) {
        console.error("Delete job card error:", error);
        alert("Error deleting job card");
    }
}
document.addEventListener("DOMContentLoaded", function() {

    const dayFilter = document.getElementById("dayFilter");
    const monthFilter = document.getElementById("monthFilter");
    const yearFilter = document.getElementById("yearFilter");

    // DAYS
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        dayFilter.appendChild(option);
    }

    // MONTHS
    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthFilter.appendChild(option);
    });

    // YEARS
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 2020; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }

});

function filterJobCardRows() {
    const selectedDay = document.getElementById("dayFilter").value;
    const selectedMonth = document.getElementById("monthFilter").value;
    const selectedYear = document.getElementById("yearFilter").value;

    const rows = document.querySelectorAll("#myJobCardsBody tr");

    rows.forEach(row => {
        const dateCell = row.children[0];

        if (!dateCell) return;

        const rowDateText = dateCell.innerText.trim();

        if (!rowDateText || rowDateText === "Loading...") return;

        const rowDate = new Date(rowDateText);

        const rowDay = rowDate.getDate().toString();
        const rowMonth = (rowDate.getMonth() + 1).toString();
        const rowYear = rowDate.getFullYear().toString();

        const dayMatch = selectedDay === "" || selectedDay === rowDay;
        const monthMatch = selectedMonth === "" || selectedMonth === rowMonth;
        const yearMatch = selectedYear === "" || selectedYear === rowYear;

        if (dayMatch && monthMatch && yearMatch) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

document.getElementById("dayFilter").addEventListener("change", filterJobCardRows);
document.getElementById("monthFilter").addEventListener("change", filterJobCardRows);
document.getElementById("yearFilter").addEventListener("change", filterJobCardRows);

document.getElementById("clearFilters").addEventListener("click", function() {
    document.getElementById("dayFilter").value = "";
    document.getElementById("monthFilter").value = "";
    document.getElementById("yearFilter").value = "";

    filterJobCardRows();
});