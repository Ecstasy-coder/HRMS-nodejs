const API_URL = "http://localhost:5000/api/jobcards/analytics/ratings";

let period = "monthly";
let ratingChart = null;
let employeeChart = null;


function setPeriod(selectedPeriod) {
    period = selectedPeriod;

    document.getElementById("monthlyBtn").classList.remove("active");
    document.getElementById("yearlyBtn").classList.remove("active");

    if (period === "monthly") {
        document.getElementById("monthlyBtn").classList.add("active");
        document.getElementById("monthSelect").disabled = false;
    } else {
        document.getElementById("yearlyBtn").classList.add("active");
        document.getElementById("monthSelect").disabled = true;
    }

    loadAnalytics();
}

async function loadAnalytics() {
    try {
        const month = document.getElementById("monthSelect").value;
        const year = document.getElementById("yearSelect").value;

        let url = `${API_URL}?period=${period}&year=${year}`;

        if (period === "monthly") {
            url += `&month=${month}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
            alert("Failed to load analytics");
            return;
        }

        const data = result.data;

        document.getElementById("avgRating").innerText = data.avgRating;
        document.getElementById("teamMembers").innerText = data.teamMembers;
        document.getElementById("cardsRated").innerText = data.cardsRated;

        document.getElementById("topPerformer").innerText =
            data.topPerformer ? data.topPerformer.employeeName : "No performer";

        renderRatingChart(data);

        renderEmployeeChart(data.cards);

        renderEmployeeRankings(data.cards || []);


    } catch (error) {
        console.log(error);
        alert("Server error");
    }
}

function renderRatingChart(data) {
    const ctx = document.getElementById("ratingChart");

    if (ratingChart) {
        ratingChart.destroy();
    }

    ratingChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [
                "5 Stars Excellent",
                "4 Stars Very Good",
                "3 Stars Good",
                "2 Stars Fair",
                "1 Star Poor"
            ],
            datasets: [{
                data: [
                    data.distribution[5],
                    data.distribution[4],
                    data.distribution[3],
                    data.distribution[2],
                    data.distribution[1]
                ],
                backgroundColor: [
                    "#22c55e",
                    "#84cc16",
                    "#facc15",
                    "#f97316",
                    "#ef4444"
                ],
                borderWidth: 2
            }]
        },
        options: {
            cutout: "65%",
            plugins: {
                legend: {
                    position: "right"
                }
            }
        }
    });
}

function renderEmployeeRankings(jobCards) {
    const tbody = document.getElementById("rankingBody");

    if (!tbody) {
        console.error("rankingBody not found");
        return;
    }

    tbody.innerHTML = "";

    if (!jobCards || jobCards.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:25px;">
                    No employee ranking data found
                </td>
            </tr>
        `;
        return;
    }

    const employees = {};

    jobCards.forEach(card => {
        const name = card.employeeName || "Unknown Employee";
        const department = card.department || "N/A";
        const rating = Number(card.rating || 0);

        if (!employees[name]) {
            employees[name] = {
                name,
                department,
                totalRating: 0,
                cards: 0
            };
        }

        employees[name].totalRating += rating;
        employees[name].cards++;
    });

    const ranking = Object.values(employees)
        .map(emp => ({
            ...emp,
            avgRating: emp.cards ? emp.totalRating / emp.cards : 0
        }))
        .sort((a, b) => b.avgRating - a.avgRating);

    ranking.forEach((emp, index) => {
        const rank =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            index === 2 ? "🥉" :
            index + 1;

        tbody.innerHTML += `
            <tr>
                <td>${rank}</td>
                <td><b>${emp.name}</b></td>
                <td>${emp.department}</td>
                <td>
                    <span class="stars">${getStars(emp.avgRating)}</span>
                    <b>${emp.avgRating.toFixed(2)}/5</b>
                </td>
                <td><b>${emp.cards}</b></td>
                <td>No prev data</td>
                <td><button class="view-btn">View →</button></td>
            </tr>
        `;
    });
}

function getStars(rating) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.round(rating) ?
            `<span class="star-filled">★</span>` :
            `<span class="star-empty">★</span>`;
    }

    return stars;
}

function renderEmployeeChart(cards) {
    const ctx = document.getElementById("employeeChart");

    const ratedCards = cards.filter(item => Number(item.rating) > 0);

    if (employeeChart) {
        employeeChart.destroy();
    }

    employeeChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ratedCards.map(item => item.employeeName),
            datasets: [{
                label: "Rating",
                data: ratedCards.map(item => item.rating),
                borderColor: "#6366f1",
                backgroundColor: "rgba(99,102,241,0.12)",
                fill: true,
                tension: 0.4,
                pointRadius: 6
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

loadAnalytics();