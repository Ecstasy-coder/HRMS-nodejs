const API_URL = "http://localhost:5000/api/myjobcards";

fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar').innerHTML = data;
    })
    .catch(error => {
        console.log("Sidebar Error:", error);
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