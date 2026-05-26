/* ═══════════════════════════════════════════════════════════════
   birthdays.js  —  My Ecstasy HR Portal
   Logic for the Birthday Management page.
   HTML is in birthdays.html, shared styles in common.css.
═══════════════════════════════════════════════════════════════ */

const API = "http://localhost:5000/api/birthdays";

let employees = [];

/* ════════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    setTopbarDate();
    loadBirthdays();
    initSearch();
});

/* ════════════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════════════ */
function loadSidebar() {
    fetch("sidebar.html")
        .then(r => r.text())
        .then(html => {
            document.getElementById("sidebar-container").innerHTML = html;

            const currentPage = decodeURIComponent(
                window.location.pathname.split("/").pop()
            ).toLowerCase();

            document.querySelectorAll("#sidebar-container .nav-link").forEach(link => {
                const linkPage = decodeURIComponent(
                    link.getAttribute("href").split("/").pop()
                ).toLowerCase();

                link.classList.remove("active");

                if (linkPage === currentPage) {
                    link.classList.add("active");
                }
            });
        })
        .catch(err => console.error("Sidebar load error:", err));
}
/* ════════════════════════════════════════════════════════════════
   TOPBAR DATE
════════════════════════════════════════════════════════════════ */
function setTopbarDate() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const el = document.getElementById('todayDate');
    if (el) el.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ════════════════════════════════════════════════════════════════
   LOAD DATA
════════════════════════════════════════════════════════════════ */
async function loadBirthdays() {
    try {
        const res = await fetch(API);

        const data = await res.json();

        console.log("BIRTHDAY API RESPONSE:", data);

        const apiEmployees = data.employees || data.data || [];

        employees = apiEmployees
            .filter(emp => emp.birthday && emp.birthday !== "")
            .map(emp => ({
                ...emp,
                name: emp.fullName || emp.name || "Unknown",
                daysUntil: getDaysUntilBirthday(emp.birthday),
                age: getAge(emp.birthday)
            }))
            .sort((a, b) => a.daysUntil - b.daysUntil);

        updateStats();
        renderUpcoming();
        renderMonth();
        renderTable(employees);

    } catch (err) {
        console.error("Failed to load birthdays:", err);
    }
}

/* ════════════════════════════════════════════════════════════════
   DATE HELPERS
════════════════════════════════════════════════════════════════ */
function getDaysUntilBirthday(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    const next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    today.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    if (next < today) next.setFullYear(today.getFullYear() + 1);

    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

function getAge(dob) {
    return new Date().getFullYear() - new Date(dob).getFullYear();
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

/* ════════════════════════════════════════════════════════════════
   UPDATE STATS CARDS
════════════════════════════════════════════════════════════════ */
function updateStats() {
    const today = new Date();
    let todayCount = 0;
    let monthCount = 0;

    employees.forEach(emp => {
        const dob = new Date(emp.birthday);
        if (dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()) todayCount++;
        if (dob.getMonth() === today.getMonth()) monthCount++;
    });

    setEl('todayCount', todayCount);
    setEl('monthCount', monthCount);
    setEl('totalEmployees', employees.length);
    setEl('upcomingTotal', employees.length + ' total');
    setEl('monthTotal', employees.length + ' birthdays');

    if (employees.length > 0) {
        const next = employees[0];
        setEl('nextBirthday', next.daysUntil === 0 ? next.name : `${next.name} (${next.daysUntil}d)`);
    }
}

/* ════════════════════════════════════════════════════════════════
   RENDER — UPCOMING LIST
════════════════════════════════════════════════════════════════ */
function renderUpcoming() {
    const container = document.getElementById('upcomingList');
    if (!container) return;

    if (employees.length === 0) {
        container.innerHTML = '<div class="empty-state small"><p>No birthdays found</p></div>';
        return;
    }

    container.innerHTML = employees.map(emp => `
    <div class="birthday-item">
      <div class="bday-left">
        <div class="bday-avatar">${getInitials(emp.name)}</div>
        <div class="bday-info">
          <strong>${emp.name}</strong>
          <p>${emp.department || '—'} · ${new Date(emp.birthday).toLocaleString('default', { day: '2-digit', month: 'long' })}</p>
        </div>
      </div>
      <div class="days-pill ${emp.daysUntil === 0 ? 'today' : ''}">
        ${emp.daysUntil === 0 ? '🎉 Today!' : `In ${emp.daysUntil} days`}
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════════
   RENDER — BY MONTH
════════════════════════════════════════════════════════════════ */
function renderMonth() {
  const container = document.getElementById('monthList');
  if (!container) return;

  const grouped = {};
  employees.forEach(emp => {
    const month = new Date(emp.birthday).toLocaleString('default', { month: 'long' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(emp);
  });

  if (Object.keys(grouped).length === 0) {
    container.innerHTML = '<div class="empty-state small"><p>No data</p></div>';
    return;
  }

  container.innerHTML = Object.entries(grouped).map(([month, list]) => `
    <div class="month-block">
      <div class="month-header">
        <h4>${month}</h4>
        <div class="month-count">${list.length}</div>
      </div>
      <div class="month-users">
        ${list.map(emp => `
          <div class="month-user">
            ${emp.name} (${new Date(emp.birthday).getDate()})
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════════
   RENDER — TABLE
════════════════════════════════════════════════════════════════ */
function renderTable(list) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">No birthday records found</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(emp => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="table-avatar">${getInitials(emp.name)}</div>
          <div class="user-text">
            <strong>${emp.name}</strong>
          </div>
        </div>
      </td>
      <td>${emp.department || '—'}</td>
      <td>${new Date(emp.birthday).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td>${new Date(emp.birthday).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</td>
      <td>
        <span class="days-pill ${emp.daysUntil === 0 ? 'today' : ''}">
          ${emp.daysUntil === 0 ? '🎉 Today!' : emp.daysUntil + ' days'}
        </span>
      </td>
      <td class="age-text">${emp.age} yrs</td>
    </tr>
  `).join('');
}

/* ════════════════════════════════════════════════════════════════
   SEARCH
════════════════════════════════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById('search');
  if (!input) return;
  input.addEventListener('keyup', () => {
    const q = input.value.toLowerCase().trim();
    const filtered = employees.filter(emp =>
      (emp.name       || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q)
    );
    renderTable(filtered);
  });
}

/* ════════════════════════════════════════════════════════════════
   EXPORT CSV
════════════════════════════════════════════════════════════════ */
function exportCSV() {
  const rows = [['Name','Department','Date of Birth','Birthday','Days Until','Age']];

  employees.forEach(emp => {
    rows.push([
      emp.name,
      emp.department || '',
      new Date(emp.birthday).toLocaleDateString('en-GB'),
      new Date(emp.birthday).toLocaleString('default', { day: 'numeric', month: 'long' }),
      emp.daysUntil,
      emp.age,
    ]);
  });

  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'birthdays.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ════════════════════════════════════════════════════════════════
   LOGOUT (shared with sidebar)
════════════════════════════════════════════════════════════════ */
async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
}

/* ════════════════════════════════════════════════════════════════
   UTILITY
════════════════════════════════════════════════════════════════ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}