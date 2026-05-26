// const API_BASE_URL = "http://localhost:5000/api/tickets";

// const ticketForm = document.getElementById("ticketForm");
// const message = document.getElementById("message");
// const ticketList = document.getElementById("ticketList");

// ticketForm.addEventListener("submit", async(e) => {
//     e.preventDefault();

//     const subject = document.getElementById("subject").value.trim();
//     const category = document.getElementById("category").value;
//     const priority = document.getElementById("priority").value;
//     const description = document.getElementById("description").value.trim();

//     if (!subject || !category || !priority || !description) {
//         showMessage("Please fill all fields", "error");
//         return;
//     }

//     const ticketData = {
//         subject,
//         category,
//         priority,
//         description
//     };

//     try {
//         const response = await fetch(`${API_BASE_URL}/raise`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(ticketData)
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             showMessage(data.message || "Failed to raise ticket", "error");
//             return;
//         }

//         showMessage("Ticket raised successfully", "success");

//         ticketForm.reset();

//         loadTickets();

//     } catch (error) {
//         showMessage("Backend server not connected", "error");
//         console.error("Ticket submit error:", error);
//     }
// });

// function showMessage(text, type) {
//     message.textContent = text;
//     message.className = type;

//     setTimeout(() => {
//         message.textContent = "";
//         message.className = "";
//     }, 3000);
// }

// async function loadTickets() {
//     try {
//         const response = await fetch(`${API_BASE_URL}/all`);
//         const data = await response.json();

//         if (!response.ok) {
//             ticketList.innerHTML = `<p class="empty-text">Failed to load tickets</p>`;
//             return;
//         }

//         if (!data.tickets || data.tickets.length === 0) {
//             ticketList.innerHTML = `<p class="empty-text">No tickets raised yet</p>`;
//             return;
//         }

//         ticketList.innerHTML = data.tickets
//             .map((ticket) => {
//                 return `
//           <div class="ticket-item">
//             <div class="ticket-top">
//               <h4>${ticket.subject}</h4>
//               <span class="ticket-status">${ticket.status}</span>
//             </div>

//             <div class="ticket-meta">
//               <span>Category: ${ticket.category}</span>
//               <span>Priority: ${ticket.priority}</span>
//               <span>Raised By: ${ticket.raisedByRole}</span>
//             </div>

//             <p class="ticket-description">
//               ${ticket.description}
//             </p>
//           </div>
//         `;
//             })
//             .join("");

//     } catch (error) {
//         ticketList.innerHTML = `<p class="empty-text">Backend server not connected</p>`;
//         console.error("Load tickets error:", error);
//     }
// }

// loadTickets();




const API_BASE_URL = "http://localhost:5000/api/tickets";

const ticketForm = document.getElementById("ticketForm");
const message = document.getElementById("message");
const ticketList = document.getElementById("ticketList");

const totalCount = document.getElementById("totalCount");
const openCount = document.getElementById("openCount");
const progressCount = document.getElementById("progressCount");
const resolvedCount = document.getElementById("resolvedCount");

let allTickets = [];

ticketForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const category = document.getElementById("category").value;
    const priority = document.getElementById("priority").value;
    const description = document.getElementById("description").value.trim();

    if (!subject || !category || !priority || !description) {
        showMessage("Please fill all required fields", "error");
        return;
    }

    if (description.length < 20) {
        showMessage("Description must be at least 20 characters", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/raise`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject,
                category,
                priority,
                description
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to submit ticket", "error");
            return;
        }

        showMessage("Ticket submitted successfully", "success");

        ticketForm.reset();
        document.getElementById("priority").value = "Medium";

        loadTickets();

    } catch (error) {
        showMessage("Backend server not connected", "error");
    }
});

async function loadTickets() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`);
        const data = await response.json();

        if (!response.ok || !data.tickets) {
            ticketList.innerHTML = `
        <tr>
          <td colspan="5" class="empty-text">Failed to load tickets</td>
        </tr>
      `;
            return;
        }

        allTickets = data.tickets;

        updateCounts(allTickets);
        renderTickets(allTickets);

    } catch (error) {
        ticketList.innerHTML = `
      <tr>
        <td colspan="5" class="empty-text">Backend server not connected</td>
      </tr>
    `;
    }
}

function updateCounts(tickets) {
    totalCount.textContent = tickets.length;

    openCount.textContent = tickets.filter(
        (ticket) => ticket.status === "Open"
    ).length;

    progressCount.textContent = tickets.filter(
        (ticket) => ticket.status === "In Progress"
    ).length;

    resolvedCount.textContent = tickets.filter(
        (ticket) => ticket.status === "Resolved" || ticket.status === "Closed"
    ).length;
}

function renderTickets(tickets) {
    if (tickets.length === 0) {
        ticketList.innerHTML = `
      <tr>
        <td colspan="5" class="empty-text">No tickets submitted yet</td>
      </tr>
    `;
        return;
    }

    ticketList.innerHTML = tickets
        .map((ticket, index) => {
            const ticketNumber = `TKT-${String(index + 1).padStart(5, "0")}`;

            const date = ticket.createdAt ?
                new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }) :
                "-";

            return `
        <tr>
          <td>
            <span class="ticket-id">${ticketNumber}</span>
          </td>

          <td>
            <div class="ticket-subject">${ticket.subject}</div>
            <div class="ticket-category">
              ${getCategoryIcon(ticket.category)} ${ticket.category}
            </div>
          </td>

          <td>
            <span class="badge ${getPriorityClass(ticket.priority)}">
              ${ticket.priority}
            </span>
          </td>

          <td>
            <span class="badge ${getStatusClass(ticket.status)}">
              ${ticket.status}
            </span>
          </td>

          <td>${date}</td>
        </tr>
      `;
        })
        .join("");
}

function filterTickets(event, status) {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (status === "All") {
        renderTickets(allTickets);
        return;
    }

    const filtered = allTickets.filter((ticket) => ticket.status === status);
    renderTickets(filtered);
}

function getPriorityClass(priority) {
    if (priority === "High") return "priority-high";
    if (priority === "Critical") return "priority-critical";
    if (priority === "Low") return "priority-low";

    return "priority-medium";
}

function getStatusClass(status) {
    if (status === "In Progress") return "status-progress";
    if (status === "Resolved") return "status-resolved";
    if (status === "Closed") return "status-closed";

    return "status-open";
}

function getCategoryIcon(category) {
    if (category === "Payroll Issue") return "💰";
    if (category === "HR Query") return "👥";
    if (category === "IT Support") return "💻";
    if (category === "Leave & Attendance") return "🗓️";
    if (category === "General Complaint") return "📋";

    return "🎫";
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;

    setTimeout(() => {
        message.textContent = "";
        message.className = "";
    }, 3000);
}

loadTickets();