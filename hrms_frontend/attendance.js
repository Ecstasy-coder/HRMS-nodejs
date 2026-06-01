/* ═══════════════════════════════════════════════════════════════
   attendance.js  —  My Ecstasy HR Portal
   Handles: stat cards, daily view, monthly summary,
            upload history, biometric file upload, CSV export
═══════════════════════════════════════════════════════════════ */

const API = window.location.origin;

// ── Office schedule constants ────────────────────────────────
// Office: 10:00 AM – 6:30 PM  →  8.5 working hours
const OFFICE_START_MINUTES = 10 * 60;        // 600  (10:00 AM)
const OFFICE_END_MINUTES   = 18 * 60 + 30;  // 1110 (6:30 PM)
const FULL_DAY_HOURS       = (OFFICE_END_MINUTES - OFFICE_START_MINUTES) / 60; // 8.5
const HALF_DAY_HOURS       = FULL_DAY_HOURS / 2;  // 4.25

// Cache for current data (used by CSV export)
let _dailyRecords   = [];
let _monthlyRecords = [];

/* ── Utility ────────────────────────────────────────────────── */
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function showFlash(msg, type = 'success') {
  const c = document.getElementById('flashContainer');
  if (!c) return;
  c.innerHTML = `
    <div class="flash-message flash-${escHtml(type)}">
      <span>${type === 'success' ? '✅' : '⚠️'}</span>
      <span>${escHtml(msg)}</span>
    </div>`;
  setTimeout(() => { c.innerHTML = ''; }, 4500);
}

// ── Logout ────────────────────────────────────────────────────
async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
}

/* ── Time Helpers ───────────────────────────────────────────── */

/**
 * parseTimeToMinutes()
 * Accepts:
 *   • Excel decimal fraction  e.g. 0.4166666666666667  (10:00 AM)
 *   • "HH:MM" or "HH:MM:SS"  e.g. "10:00", "18:30:00"
 *   • "H:MM AM/PM"            e.g. "10:00 AM"
 * Returns total minutes since midnight, or null if unparseable.
 */
function parseTimeToMinutes(raw) {
  if (raw === null || raw === undefined || raw === '' || raw === '—') return null;

  const s = String(raw).trim();

  // ── Excel serial fraction (pure number, 0 < n < 1)
  const num = Number(s);
  if (!isNaN(num) && num > 0 && num < 1) {
    return Math.round(num * 24 * 60);
  }

  // ── "HH:MM" or "HH:MM:SS"  (24-hour, no AM/PM)
  const hm24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hm24) {
    return parseInt(hm24[1]) * 60 + parseInt(hm24[2]);
  }

  // ── "H:MM AM" / "H:MM PM"
  const hm12 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (hm12) {
    let h = parseInt(hm12[1]);
    const m = parseInt(hm12[2]);
    const meridiem = hm12[3].toUpperCase();
    if (meridiem === 'AM' && h === 12) h = 0;
    if (meridiem === 'PM' && h !== 12) h += 12;
    return h * 60 + m;
  }

  return null; // unparseable
}

/**
 * minutesTo12hr()
 * Converts total minutes since midnight → "10:00 AM" / "6:30 PM"
 */
function minutesTo12hr(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined) return '—';
  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const meridiem = h < 12 ? 'AM' : 'PM';
  if (h === 0)  h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, '0')} ${meridiem}`;
}

/**
 * formatRawTime()
 * Converts any raw time value (decimal or string) to "H:MM AM/PM".
 * Returns '—' if the value is empty / unparseable.
 */
function formatRawTime(raw) {
  const mins = parseTimeToMinutes(raw);
  return mins !== null ? minutesTo12hr(mins) : '—';
}

/**
 * calcWorkingHours()
 * Given raw in-time and out-time, returns worked hours as a decimal
 * (e.g. 8.5) or null if either value is missing/unparseable.
 */
function calcWorkingHours(rawIn, rawOut) {
  const inMins  = parseTimeToMinutes(rawIn);
  const outMins = parseTimeToMinutes(rawOut);
  if (inMins === null || outMins === null) return null;

  let diff = outMins - inMins;
  if (diff < 0) diff += 24 * 60; // overnight shift guard
  return parseFloat((diff / 60).toFixed(2));
}

/**
 * deriveStatus()
 * Business rules (office 10 AM – 6:30 PM, full day = 8.5 hrs):
 *   • workedHours === 0 (or null)      → Absent
 *   • 0 < workedHours < HALF_DAY_HOURS → Late
 *   • HALF_DAY_HOURS ≤ workedHours < FULL_DAY_HOURS → Half Day
 *   • workedHours ≥ FULL_DAY_HOURS                  → Present
 *
 * If the server already computed a status we ONLY override when we
 * have enough punch data to recalculate it ourselves.
 */
function deriveStatus(rawIn, rawOut, serverStatus) {
  const hours = calcWorkingHours(rawIn, rawOut);

  // No punch data at all → fall back to server status (may be 'Absent')
  if (hours === null) {
    return serverStatus || 'absent';
  }

  if (hours === 0)                   return 'absent';
  if (hours < HALF_DAY_HOURS)        return 'late';
  if (hours < FULL_DAY_HOURS)        return 'half';
  return 'present';
}

/**
 * formatWorkingHours()
 * Returns a human-readable string like "8h 30m" or "—".
 */
function formatWorkingHours(rawIn, rawOut) {
  const hours = calcWorkingHours(rawIn, rawOut);
  if (hours === null) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/* ── Status Badge ───────────────────────────────────────────── */
function statusBadge(status) {
  const map = {
    present:   'badge-present',
    absent:    'badge-absent',
    late:      'badge-late',
    half:      'badge-half',
    'half day':'badge-half'
  };
  const key   = (status || '').toLowerCase();
  const cls   = map[key] || 'badge-present';
  const label = key === 'half' || key === 'half day' ? 'Half Day'
              : key.charAt(0).toUpperCase() + key.slice(1);
  const icon  = key === 'present'  ? 'ti-circle-check'
              : key === 'absent'   ? 'ti-circle-x'
              : key === 'late'     ? 'ti-clock'
              : 'ti-circle-half';
  return `<span class="badge ${cls}"><i class="ti ${icon}"></i>${label}</span>`;
}

function pct(val, total) {
  if (!total) return '0%';
  return Math.round((val / total) * 100) + '%';
}

/* ── CSV Export ─────────────────────────────────────────────── */
function downloadCSV(rows, filename) {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportDailyCSV() {
  if (!_dailyRecords.length) { showFlash('No data to export.', 'error'); return; }
  const date   = document.getElementById('dailyDate').value || 'attendance';
  const header = ['#', 'Employee Name', 'Emp Code', 'Department', 'Punch In', 'Punch Out', 'Working Hours', 'Status'];
  const rows   = _dailyRecords.map((r, i) => {
    const rawIn  = r.inTime  || r.punchIn  || '';
    const rawOut = r.outTime || r.punchOut || '';
    const status = deriveStatus(rawIn, rawOut, r.status);
    return [
      i + 1,
      `"${(r.employeeName || r.name || '—').replace(/"/g, '""')}"`,
      r.empCode || '',
      `"${(r.department || '—').replace(/"/g, '""')}"`,
      formatRawTime(rawIn),
      formatRawTime(rawOut),
      formatWorkingHours(rawIn, rawOut),
      status.charAt(0).toUpperCase() + status.slice(1)
    ].join(',');
  });
  downloadCSV([header.join(','), ...rows], `attendance_daily_${date}.csv`);
}

function exportMonthlyCSV() {
  if (!_monthlyRecords.length) { showFlash('No data to export.', 'error'); return; }
  const month  = document.getElementById('monthSelect').value;
  const year   = document.getElementById('yearSelect').value;
  const header = ['#', 'Employee Name', 'Emp Code', 'Department', 'Present', 'Absent', 'Late', 'Half Day', 'Working Days', 'Attendance %'];
  const rows   = _monthlyRecords.map((r, i) => [
    i + 1,
    `"${(r.employeeName || '—').replace(/"/g, '""')}"`,
    r.empCode || '',
    `"${(r.department || '—').replace(/"/g, '""')}"`,
    r.presentDays ?? 0,
    r.absentDays  ?? 0,
    r.lateDays    ?? 0,
    r.halfDays    ?? 0,
    r.workingDays ?? 0,
    pct(r.presentDays || 0, r.workingDays || 0)
  ].join(','));
  downloadCSV([header.join(','), ...rows], `attendance_monthly_${year}_${month}.csv`);
}

document.getElementById('exportDailyCSV').addEventListener('click', exportDailyCSV);
document.getElementById('exportMonthlyCSV').addEventListener('click', exportMonthlyCSV);

/* ── Stat Cards ─────────────────────────────────────────────── */
async function loadStats(dateStr) {
  try {
    const date = dateStr || document.getElementById('dailyDate').value || '';
    const url  = date
      ? `${API}/api/attendance/stats?date=${date}`
      : `${API}/api/attendance/stats`;
    const res  = await fetch(url, { credentials: 'include' });
    const data = await res.json();

    const displayDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
      : new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

    document.getElementById('statPresent').textContent    = data.presentToday   ?? 0;
    document.getElementById('statAbsent').textContent     = data.absentToday    ?? 0;
    document.getElementById('statLate').textContent       = data.lateToday      ?? 0;
    document.getElementById('statTotal').textContent      = data.totalEmployees  ?? 0;
    document.getElementById('statPresentSub').textContent = `of ${data.totalEmployees ?? 0} employees`;
    document.getElementById('statAbsentDate').textContent  = displayDate;
  } catch (err) {
    console.warn('Stats error:', err);
  }
}

/* ── Row builder (shared by loadDailyView & _silentRefreshDailyView) ── */
function buildDailyRow(r, i) {
  const rawIn  = r.inTime  || r.punchIn  || '';
  const rawOut = r.outTime || r.punchOut || '';

  const displayIn    = formatRawTime(rawIn);
  const displayOut   = formatRawTime(rawOut);
  const displayHours = formatWorkingHours(rawIn, rawOut);
  const status       = deriveStatus(rawIn, rawOut, r.status);

  return `
    <tr>
      <td style="color:#94a3b8;font-size:12px;">${i + 1}</td>
      <td>
        <div class="emp-name">${escHtml(r.employeeName || r.name || '—')}</div>
        <div class="emp-code">${escHtml(r.empCode || '')}</div>
      </td>
      <td>${escHtml(r.department || '—')}</td>
      <td>${escHtml(displayIn)}</td>
      <td>${escHtml(displayOut)}</td>
      <td>${escHtml(displayHours)}</td>
      <td>${statusBadge(status)}</td>
    </tr>`;
}

/* ── DAILY VIEW ─────────────────────────────────────────────── */
async function loadDailyView(dateStr) {
  const tbody = document.getElementById('dailyTbody');
  const empty = document.getElementById('dailyEmpty');
  const count = document.getElementById('dailyCount');
  const title = document.getElementById('dailyEmptyTitle');

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#94a3b8;">Loading…</td></tr>';
  empty.style.display = 'none';
  _dailyRecords = [];

  try {
    const res  = await fetch(`${API}/api/attendance/daily?date=${dateStr}`, { credentials: 'include' });
    const data = await res.json();

    const records = Array.isArray(data) ? data : (data.records || []);
    _dailyRecords = records;

    tbody.innerHTML = '';
    count.textContent = `${records.length} record${records.length !== 1 ? 's' : ''}`;

    if (!records.length) {
      const d = new Date(dateStr);
      title.textContent = `No attendance data for ${d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`;
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = records.map((r, i) => buildDailyRow(r, i)).join('');
  } catch (err) {
    console.error('Daily view error:', err);
    tbody.innerHTML = '';
    empty.style.display = 'block';
    title.textContent = 'Failed to load attendance data';
  }
}

document.getElementById('dailyDate').addEventListener('change', function () {
  loadDailyView(this.value);
  loadStats(this.value);
});

/* ── MONTHLY SUMMARY ────────────────────────────────────────── */
async function loadMonthlySummary() {
  const month  = document.getElementById('monthSelect').value;
  const year   = document.getElementById('yearSelect').value;
  const tbody  = document.getElementById('monthlyTbody');
  const empty  = document.getElementById('monthlyEmpty');
  const legend = document.getElementById('monthlyLegend');

  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#94a3b8;">Loading…</td></tr>';
  empty.style.display = 'none';
  legend.style.display = 'none';
  _monthlyRecords = [];

  try {
    const res  = await fetch(`${API}/api/attendance/monthly?month=${month}&year=${year}`, { credentials: 'include' });
    const data = await res.json();

    const records = Array.isArray(data) ? data : (data.records || []);
    _monthlyRecords = records;
    tbody.innerHTML = '';

    if (!records.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    legend.style.display = 'flex';

    records.forEach((r, i) => {
      const attendance = pct(r.presentDays || 0, r.workingDays || 0);
      const pctNum     = parseInt(attendance);
      const pctColor   = pctNum >= 90 ? '#10b981' : pctNum >= 75 ? '#f97316' : '#ef4444';

      tbody.innerHTML += `
        <tr>
          <td style="color:#94a3b8;font-size:12px;">${i + 1}</td>
          <td>
            <div class="emp-name">${escHtml(r.employeeName || r.name || '—')}</div>
            <div class="emp-code">${escHtml(r.empCode || '')}</div>
          </td>
          <td>${escHtml(r.department || '—')}</td>
          <td><span style="color:#10b981;font-weight:600;">${r.presentDays ?? 0}</span></td>
          <td><span style="color:#ef4444;font-weight:600;">${r.absentDays  ?? 0}</span></td>
          <td><span style="color:#f97316;font-weight:600;">${r.lateDays    ?? 0}</span></td>
          <td><span style="color:#ca8a04;font-weight:600;">${r.halfDays    ?? 0}</span></td>
          <td>${r.workingDays ?? 0}</td>
          <td><span style="font-weight:700;color:${pctColor};">${attendance}</span></td>
        </tr>`;
    });
  } catch (err) {
    console.error('Monthly error:', err);
    tbody.innerHTML = '';
    empty.style.display = 'block';
  }
}

document.getElementById('loadMonthlyBtn').addEventListener('click', loadMonthlySummary);

/* ── UPLOAD HISTORY ─────────────────────────────────────────── */
async function loadHistory() {
  const list  = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');

  list.innerHTML = '<div style="padding:32px;text-align:center;color:#94a3b8;">Loading…</div>';
  empty.style.display = 'none';

  try {
    const res  = await fetch(`${API}/api/attendance/uploads`, { credentials: 'include' });
    const data = await res.json();

    const records = Array.isArray(data) ? data : (data.uploads || []);
    list.innerHTML = '';

    if (!records.length) {
      empty.style.display = 'block';
      return;
    }

    list.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:10px 20px;background:#f8fafc;border-bottom:1px solid #eef2f6;">
        <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;
                     letter-spacing:0.5px;color:#94a3b8;">
          File &nbsp;·&nbsp; Attendance Date &nbsp;·&nbsp; Uploaded By &nbsp;·&nbsp; Records
        </span>
        <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;
                     letter-spacing:0.5px;color:#94a3b8;">Status</span>
      </div>`;

    records.forEach(u => {
      const uploadedAt = (u.createdAt || u.uploadedAt)
        ? new Date(u.createdAt || u.uploadedAt).toLocaleString('en-IN', {
            day:'numeric', month:'short', year:'numeric',
            hour:'2-digit', minute:'2-digit'
          })
        : '—';

      list.innerHTML += `
        <div class="history-item">
          <div class="history-left">
            <div class="history-icon"><i class="ti ti-file-spreadsheet"></i></div>
            <div>
              <div class="history-name">${escHtml(u.originalName || u.fileName || 'Biometric File')}</div>
              <div class="history-meta">
                Date: ${escHtml(u.date || '—')}
                &nbsp;·&nbsp; Uploaded by ${escHtml(u.uploadedBy || 'HR Admin')}
                &nbsp;·&nbsp; ${uploadedAt}
                ${u.recordsProcessed ? `&nbsp;·&nbsp; <strong>${u.recordsProcessed}</strong> records` : ''}
              </div>
            </div>
          </div>
          <span class="history-badge"><i class="ti ti-circle-check"></i> ${escHtml(u.status || 'Processed')}</span>
        </div>`;
    });
  } catch (err) {
    console.error('History error:', err);
    list.innerHTML = '';
    empty.style.display = 'block';
  }
}

/* ── TABS ───────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');

    if (this.dataset.tab === 'history') loadHistory();
    if (this.dataset.tab === 'monthly') loadMonthlySummary();
  });
});

/* ── UPLOAD MODAL ───────────────────────────────────────────── */
const modal    = document.getElementById('uploadModal');
const dropZone = document.getElementById('dropZone');
const fileInput= document.getElementById('fileInput');
const fileInfo = document.getElementById('selectedFileInfo');
const fileName = document.getElementById('selectedFileName');
let   chosenFile = null;

function openModal()  { modal.classList.add('open'); }
function closeModal() {
  modal.classList.remove('open');
  chosenFile = null;
  fileInfo.classList.remove('show');
  fileInput.value = '';
  fileName.textContent = 'No file selected';
}

document.getElementById('openUploadModal').addEventListener('click', openModal);
document.getElementById('emptyUploadBtn').addEventListener('click',  openModal);
document.getElementById('closeModal').addEventListener('click',      closeModal);
document.getElementById('cancelUpload').addEventListener('click',    closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) setFile(f);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

function setFile(f) {
  if (f.size > 20 * 1024 * 1024) {
    showFlash('File size exceeds 20 MB limit.', 'error');
    return;
  }
  chosenFile = f;
  fileName.textContent = `${f.name}  (${(f.size / 1024).toFixed(1)} KB)`;
  fileInfo.classList.add('show');
}

/* ── Upload Submit ──────────────────────────────────────────── */
document.getElementById('submitUpload').addEventListener('click', async () => {
  if (!chosenFile) { showFlash('Please select a file first.', 'error'); return; }

  const dateVal = document.getElementById('uploadDate').value;
  if (!dateVal) { showFlash('Please select the attendance date.', 'error'); return; }

  const btn = document.getElementById('submitUpload');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-overlay"></span> Uploading…';

  const formData = new FormData();
  formData.append('file', chosenFile);
  formData.append('date', dateVal);

  try {
    const res  = await fetch(`${API}/api/attendance/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();

    if (res.ok && data.success !== false) {
      showFlash(
        `File uploaded! ${data.recordsProcessed ? data.recordsProcessed + ' records processed.' : 'Stored successfully.'}`,
        'success'
      );
      closeModal();

      const uploadedDate = dateVal;
      document.getElementById('dailyDate').value = uploadedDate;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const dailyBtn = document.querySelector('.tab-btn[data-tab="daily"]');
      if (dailyBtn) dailyBtn.classList.add('active');
      const dailyPanel = document.getElementById('tab-daily');
      if (dailyPanel) dailyPanel.classList.add('active');

      loadStats(uploadedDate);
      loadDailyView(uploadedDate);
    } else {
      showFlash(data.message || 'Upload failed. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Upload error:', err);
    showFlash('Network error: Could not reach server.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-upload"></i> Upload & Process';
  }
});

/* ── INIT ───────────────────────────────────────────────────── */
loadStats();
loadDailyView(document.getElementById('dailyDate').value);

/* ── REAL-TIME AUTO-REFRESH ─────────────────────────────────
   Polls the daily view every 30 seconds.
   Also refreshes stats every 60 seconds.
   Only refreshes the ACTIVE tab to avoid unnecessary requests.
─────────────────────────────────────────────────────────── */
let _realtimeInterval = null;
let _statsInterval    = null;

function startRealTimeRefresh() {
  stopRealTimeRefresh();

  _realtimeInterval = setInterval(() => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    const tab = activeTab.getAttribute('data-tab');
    const dateVal = document.getElementById('dailyDate').value;
    if (tab === 'daily' && dateVal) {
      _silentRefreshDailyView(dateVal);
    }
  }, 30000);

  _statsInterval = setInterval(() => {
    const dateVal = document.getElementById('dailyDate').value;
    loadStats(dateVal);
  }, 60000);
}

function stopRealTimeRefresh() {
  if (_realtimeInterval) { clearInterval(_realtimeInterval); _realtimeInterval = null; }
  if (_statsInterval)    { clearInterval(_statsInterval);    _statsInterval    = null; }
}

// Silent refresh — updates rows in-place without clearing the table
async function _silentRefreshDailyView(dateStr) {
  try {
    const res = await fetch(`${API}/api/attendance/daily?date=${dateStr}`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const records = Array.isArray(data) ? data : (data.records || []);

    if (!records.length) return;

    _dailyRecords = records;

    const tbody = document.getElementById('dailyTbody');
    const count = document.getElementById('dailyCount');
    count.textContent = `${records.length} record${records.length !== 1 ? 's' : ''}`;
    tbody.innerHTML = records.map((r, i) => buildDailyRow(r, i)).join('');
  } catch (_) {
    // Silent failure — don't disturb the UI
  }
}

startRealTimeRefresh();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopRealTimeRefresh();
  } else {
    startRealTimeRefresh();
    const dateVal = document.getElementById('dailyDate').value;
    if (dateVal) { loadStats(dateVal); loadDailyView(dateVal); }
  }
});