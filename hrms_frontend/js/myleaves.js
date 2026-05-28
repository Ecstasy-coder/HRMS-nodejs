// ==========================
// CONFIGURATION
// ==========================

const API_URL = "http://localhost:5000/api/leaves";

// RM USER
const rmId = "RM001";
const rmName = "Rakesh";

// DOM Elements
const leaveForm = document.getElementById("leaveForm");
const leaveTableBody = document.getElementById("leaveTableBody");
const pendingCount = document.getElementById("pendingCount");

// Balance elements
const clTotalEl = document.getElementById("clTotal");
const clUsedEl = document.getElementById("clUsed");
const clLeftEl = document.getElementById("clLeft");

const slTotalEl = document.getElementById("slTotal");
const slUsedEl = document.getElementById("slUsed");
const slLeftEl = document.getElementById("slLeft");

// Store all leaves
let allLeaves = [];
let localLeaves = [];

// ==========================
// PAGE LOAD
// ==========================

window.onload = () => {
    addHeaderElements();
    fetchLeaves();
    fetchBalances();
};

// ==========================
// ADD HEADER ELEMENTS
// ==========================

function addHeaderElements() {
    const header = document.querySelector(".header");

    if (!document.querySelector(".header-right")) {
        const headerRight = document.createElement("div");
        headerRight.className = "header-right";

        const dateSpan = document.createElement("span");
        dateSpan.id = "currentDate";
        dateSpan.className = "date-badge";

        dateSpan.innerText =
            new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        const profileDiv = document.createElement("div");
        profileDiv.className = "profile";
        profileDiv.innerText = "RK";

        headerRight.appendChild(dateSpan);
        headerRight.appendChild(profileDiv);

        header.appendChild(headerRight);
    }
}




// ==========================
// FETCH LEAVES
// ==========================

async function fetchLeaves() {
    try {
        const response = await fetch(
            `${API_URL}/my-leaves/${rmId}`
        );

        const data = await response.json();

        if (data.success) {
            allLeaves = data.leaves;

            renderTable(allLeaves);
            updatePending(allLeaves);

        } else {
            loadDemoData();
        }

    } catch (error) {
        console.log(
            "Error fetching leaves",
            error
        );

        loadDemoData();
    }
}

// ==========================
// DEMO DATA
// ==========================

function loadDemoData() {

    const demoLeaves = [{
            _id: "1",
            leaveType: "Casual Leave",
            leaveCode: "CL",
            fromDate: "2026-05-29",
            toDate: "2026-05-29",
            days: 1,
            status: "Pending"
        },
        {
            _id: "2",
            leaveType: "Loss of Pay",
            leaveCode: "LOP",
            fromDate: "2026-05-28",
            toDate: "2026-05-28",
            days: 1,
            status: "Pending"
        },
        {
            _id: "3",
            leaveType: "Sick Leave",
            leaveCode: "SL",
            fromDate: "2026-05-28",
            toDate: "2026-05-28",
            days: 1,
            status: "Pending"
        }
    ];

    allLeaves = demoLeaves;

    renderTable(allLeaves);
    updatePending(allLeaves);

    updateBalanceUI({
        CL: {
            total: 12,
            used: 1,
            left: 11
        },
        SL: {
            total: 12,
            used: 1,
            left: 11
        }
    });
}

// ==========================
// RENDER TABLE
// ==========================

function renderTable(leaves) {

    leaveTableBody.innerHTML = "";

    if (!leaves.length) {
        leaveTableBody.innerHTML = `
      <tr>
        <td colspan="6"
          style="
            text-align:center;
            padding:40px;
            color:#94a3b8;
          ">
          No leave requests found
        </td>
      </tr>
    `;
        return;
    }

    leaves.forEach((leave) => {

        let actionButton = "-";

        if (
            leave.status === "Pending"
        ) {
            actionButton = `
        <button
          class="cancel-btn"
          onclick="cancelLeave('${leave._id}')"
        >
          Cancel
        </button>
      `;
        }

        const row = `
      <tr>

        <td>
          <div class="leave-type">

            <div class="leave-badge">
              ${leave.leaveCode}
            </div>

            <span>
              ${leave.leaveType}
            </span>

          </div>
        </td>

        <td>
          ${formatDate(
            leave.fromDate
          )}
        </td>

        <td>
          ${formatDate(
            leave.toDate
          )}
        </td>

        <td>
          ${leave.days.toFixed(1)}
        </td>

        <td>
          <span class="status">
            ${leave.status}
          </span>
        </td>

        <td>
          ${actionButton}
        </td>

      </tr>
    `;

        leaveTableBody.innerHTML += row;
    });
}

// ==========================
// UPDATE PENDING
// ==========================

function updatePending(leaves) {
    const pending =
        leaves.filter(
            leave =>
            leave.status === "Pending"
        ).length;

    pendingCount.innerText =
        `${pending} pending`;
}

// ==========================
// BALANCE UI
// ==========================

// function updateBalanceUI(
//     balances
// ) {

//     clTotalEl.innerText =
//         balances.CL ? .total || 12;

//     clUsedEl.innerText =
//         (
//             balances.CL ? .used || 0
//         ).toFixed(1);

//     clLeftEl.innerText =
//         (
//             balances.CL ? .left || 12
//         ).toFixed(1);

//     slTotalEl.innerText =
//         balances.SL ? .total || 12;

//     slUsedEl.innerText =
//         (
//             balances.SL ? .used || 0
//         ).toFixed(1);

//     slLeftEl.innerText =
//         (
//             balances.SL ? .left || 12
//         ).toFixed(1);
// }


function updateBalanceUI(balances) {

    // CL
    if (balances.CL) {
        clTotalEl.innerText = balances.CL.total || 12;
        clUsedEl.innerText = (balances.CL.used || 0).toFixed(1);
        clLeftEl.innerText = (balances.CL.left || 12).toFixed(1);
    } else {
        clTotalEl.innerText = 12;
        clUsedEl.innerText = (0).toFixed(1);
        clLeftEl.innerText = (12).toFixed(1);
    }

    // SL
    if (balances.SL) {
        slTotalEl.innerText = balances.SL.total || 12;
        slUsedEl.innerText = (balances.SL.used || 0).toFixed(1);
        slLeftEl.innerText = (balances.SL.left || 12).toFixed(1);
    } else {
        slTotalEl.innerText = 12;
        slUsedEl.innerText = (0).toFixed(1);
        slLeftEl.innerText = (12).toFixed(1);
    }
}


// ==========================
// FETCH BALANCES
// ==========================

async function fetchBalances() {

    try {

        const response =
            await fetch(
                `${API_URL}/balances/${rmId}`
            );

        const data =
            await response.json();

        if (data.success) {

            updateBalanceUI(
                data.balances
            );

        }

    } catch (error) {

        console.log(error);

    }
}

// ==========================
// APPLY LEAVE
// ==========================

if (leaveForm) {

    leaveForm.addEventListener(
        "submit",
        async(e) => {

            e.preventDefault();

            const leaveCode =
                document.getElementById(
                    "leaveType"
                ).value;

            const fromDate =
                document.getElementById(
                    "fromDate"
                ).value;

            const toDate =
                document.getElementById(
                    "toDate"
                ).value;

            const alternateMobile =
                document.getElementById(
                    "alternateMobile"
                ).value;

            const reason =
                document.getElementById(
                    "reason"
                ).value;

            // VALIDATION

            if (!leaveCode) {
                showFormNotification(
                    "Please select a leave type.",
                    "warning"
                );
                return;
            }

            if (!fromDate ||
                !toDate
            ) {
                showFormNotification(
                    "Please select from and to dates.",
                    "warning"
                );
                return;
            }

            const from =
                new Date(fromDate);

            const to =
                new Date(toDate);

            if (from > to) {
                showFormNotification(
                    "From date cannot be after To date.",
                    "error"
                );
                return;
            }

            // OVERLAP CHECK

            const hasOverlap =
                allLeaves.some(
                    (leave) => {

                        const existingFrom =
                            new Date(
                                leave.fromDate
                            );

                        const existingTo =
                            new Date(
                                leave.toDate
                            );

                        return (
                            from <= existingTo &&
                            to >= existingFrom &&
                            leave.status ===
                            "Pending"
                        );
                    }
                );

            if (hasOverlap) {

                showFormNotification(
                    "You already have a leave request for overlapping dates.",
                    "warning"
                );

                return;
            }

            // LEAVE TYPE

            let leaveType = "";

            if (leaveCode === "CL")
                leaveType =
                "Casual Leave";

            if (leaveCode === "SL")
                leaveType =
                "Sick Leave";

            if (leaveCode === "LOP")
                leaveType =
                "Loss of Pay";

            const days =
                calculateDays(
                    fromDate,
                    toDate
                );

            const leaveData = {
                rmId,
                rmName,
                leaveType,
                leaveCode,
                fromDate,
                toDate,
                days,
                alternateMobile: alternateMobile ||
                    "Not provided",
                reason: reason ||
                    "No reason provided"
            };

            try {

                const response =
                    await fetch(
                        `${API_URL}/apply`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(
                                leaveData
                            )
                        }
                    );

                const data =
                    await response.json();

                if (data.success) {

                    showTopNotification(
                        `Leave request submitted for ${days} day(s) — sent directly to HR for approval.`,
                        "success"
                    );

                    leaveForm.reset();

                    fetchLeaves();
                    fetchBalances();

                } else {

                    showFormNotification(
                        data.message ||
                        "Something went wrong",
                        "error"
                    );
                }

            } catch (error) {

                console.log(error);

                showFormNotification(
                    `Leave request submitted for ${days} day(s) — sent directly to HR for approval.`,
                    "success"
                );

                leaveForm.reset();

                addLocalLeave(
                    leaveData
                );
            }
        }
    );
}

// ==========================
// ADD LOCAL LEAVE
// ==========================

function addLocalLeave(
    leaveData
) {

    const newLeave = {
        _id: Date.now().toString(),
        ...leaveData,
        status: "Pending"
    };

    allLeaves.unshift(
        newLeave
    );

    renderTable(allLeaves);
    updatePending(allLeaves);
}

// ==========================
// CANCEL LEAVE
// ==========================

async function cancelLeave(
    id
) {

    const confirmCancel =
        confirm(
            "Cancel this leave request?"
        );

    if (!confirmCancel)
        return;

    try {

        const response =
            await fetch(
                `${API_URL}/cancel/${id}`, {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (data.success) {

            showFormNotification(
                "Leave cancelled successfully.",
                "success"
            );

            fetchLeaves();
            fetchBalances();

        }

    } catch (error) {

        console.log(error);
    }
}

// ==========================
// FORMAT DATE
// ==========================

function formatDate(date) {

    return new Date(
        date
    ).toLocaleDateString(
        "en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

// ==========================
// DAYS CALCULATION
// ==========================

function calculateDays(
    from,
    to
) {

    const start =
        new Date(from);

    const end =
        new Date(to);

    return (
        (end - start) /
        (1000 *
            60 *
            60 *
            24) +
        1
    );
}

// ==========================
// FORM NOTIFICATION
// ==========================

function showTopNotification(
    message,
    type = "success"
) {
    const notification =
        document.getElementById(
            "topNotification"
        );

    if (!notification) return;

    notification.innerHTML =
        message;

    notification.className =
        `top-notification ${type}`;

    notification.style.display =
        "block";

    clearTimeout(
        notification.timeout
    );

    notification.timeout =
        setTimeout(() => {
            notification.style.display =
                "none";
        }, 4000);
}

function showFormNotification(
    message,
    type = "error"
) {
    const notification =
        document.getElementById(
            "formNotification"
        );

    if (!notification) return;

    notification.innerHTML =
        message;

    notification.className =
        `form-notification ${type}`;

    notification.style.display =
        "block";

    clearTimeout(
        notification.timeout
    );

    notification.timeout =
        setTimeout(() => {
            notification.style.display =
                "none";
        }, 4000);
}
// ==========================
// AUTO REFRESH
// ==========================

setInterval(async() => {
    await fetchLeaves();
    await fetchBalances();
}, 15000);

// ==========================
// GLOBAL ACCESS
// ==========================

window.cancelLeave =
    cancelLeave;
window.formatDate =
    formatDate;
window.showFormNotification =
    showFormNotification;