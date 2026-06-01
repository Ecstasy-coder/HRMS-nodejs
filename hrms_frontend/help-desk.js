/* ═══════════════════════════════════════════════════════════════
   helpdesk.js  —  My Ecstasy HR Portal · Help Desk
   All ticket data management, rendering, filtering, and UI logic.
   Connects to backend via API_BASE (from api-config.js) or uses
   mock data for local/offline development.
════════════════════════════════════════════════════════════════ */

'use strict';

const HD = (() => {

  /* ── Config ──────────────────────────────────────────────────── */
  const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || window.location.origin;

  /* ── State ───────────────────────────────────────────────────── */
  let allTickets   = [];
  let filtered     = [];
  let activeTicket = null;
  let hrUsers      = [];

  /* ── Category meta ───────────────────────────────────────────── */
  const CATEGORY_META = {
    'Payroll Issue':       { emoji: '🔥', color: '#ef4444' },
    'IT Support':          { emoji: '🖥️',  color: '#3b82f6' },
    'HR Query':            { emoji: '👥', color: '#8b5cf6' },
    'General Complaint':   { emoji: '📋', color: '#f59e0b' },
    'Leave & Attendance':  { emoji: '🗓️', color: '#10b981' },
  };

  /* ── Seed / Mock data (used when backend is unreachable) ────── */
  const MOCK_TICKETS = [
    { ticketId: 'TKT-00001', subject: 'poiughfc',  employee: 'Deepthi Sannayila', department: 'Engineering', category: 'Payroll Issue',     priority: 'High',   status: 'Open',        assignedTo: '',           date: '2026-05-12', description: 'There is a discrepancy in my last salary credit. The amount is lower than the expected CTC breakup.' },
    { ticketId: 'TKT-00012', subject: 'liuytgf',   employee: 'Mallempudi Leela Saranya', department: 'Engineering', category: 'IT Support',        priority: 'Medium', status: 'Open',        assignedTo: '',           date: '2026-05-21', description: 'My laptop is running very slow after the last Windows update and I cannot open VS Code.' },
    { ticketId: 'TKT-00011', subject: 'fghjm,',    employee: 'Rakesh',           department: 'Management', category: 'HR Query',          priority: 'Medium', status: 'Open',        assignedTo: '',           date: '2026-05-20', description: 'I need clarification on the updated leave encashment policy for the current fiscal year.' },
    { ticketId: 'TKT-00010', subject: 'Attendance Mismatch', employee: 'Priya Sharma',  department: 'Finance',    category: 'Leave & Attendance', priority: 'Low',    status: 'Resolved',    assignedTo: 'Meera V',    date: '2026-05-18', description: 'My attendance for 16th May is showing absent despite being present. Biometric might not have captured my entry.' },
    { ticketId: 'TKT-00009', subject: 'Office AC not working', employee: 'Suresh K',     department: 'Operations', category: 'General Complaint',  priority: 'Medium', status: 'In Progress', assignedTo: 'Admin Team', date: '2026-05-17', description: 'The air conditioning in Block B has not been working for three days. It is affecting productivity.' },
    { ticketId: 'TKT-00008', subject: 'VPN Access Issue', employee: 'Kavitha R',      department: 'Engineering', category: 'IT Support',        priority: 'High',   status: 'Resolved',    assignedTo: 'IT Desk',    date: '2026-05-15', description: 'Cannot connect to office VPN from home since yesterday. Getting authentication error 403.' },
    { ticketId: 'TKT-00007', subject: 'Payslip not generated', employee: 'Arun Prasad',   department: 'Sales',      category: 'Payroll Issue',     priority: 'High',   status: 'Open',        assignedTo: '',           date: '2026-05-14', description: 'April payslip has not been generated in the portal. All colleagues have received it except me.' },
    { ticketId: 'TKT-00006', subject: 'Promotion Letter Request', employee: 'Nandini G',     department: 'HR',         category: 'HR Query',          priority: 'Low',    status: 'Closed',      assignedTo: 'HR Admin',   date: '2026-05-10', description: 'Requesting an official promotion letter for my records. Promotion was effective from 1st April 2026.' },
    { ticketId: 'TKT-00005', subject: 'Monitor not detected', employee: 'Tarun M',       department: 'Engineering', category: 'IT Support',        priority: 'Medium', status: 'Resolved',    assignedTo: 'IT Desk',    date: '2026-05-09', description: 'External monitor is not being detected by my workstation. Tried all HDMI ports.' },
    { ticketId: 'TKT-00004', subject: 'Cafeteria Complaint', employee: 'Divya B',       department: 'Marketing',  category: 'General Complaint',  priority: 'Low',    status: 'Closed',      assignedTo: 'Admin Team', date: '2026-05-07', description: 'Food quality in the cafeteria has deteriorated significantly over the past two weeks.' },
    { ticketId: 'TKT-00003', subject: 'Leave Balance Error', employee: 'Ramesh T',      department: 'Finance',    category: 'Leave & Attendance', priority: 'Medium', status: 'Open',        assignedTo: '',           date: '2026-05-05', description: 'My casual leave balance shows -1 even though I have not exhausted my leave quota this year.' },
    { ticketId: 'TKT-00002', subject: 'TDS Certificate Request', employee: 'Sneha P',      department: 'Engineering', category: 'Payroll Issue',     priority: 'Low',    status: 'Open',        assignedTo: '',           date: '2026-05-03', description: 'Requesting Form 16 / TDS certificate for FY 2025-26 for filing my income tax return.' },
  ];

  const MOCK_HR_USERS = [
    'Meera V', 'Anusha HR', 'Rajesh Admin', 'IT Desk', 'Admin Team', 'HR Admin'
  ];

  /* ═══════════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════════════ */
  async function init() {
    await Promise.all([loadTickets(), loadHrUsers()]);
    renderStats();
    renderCategoryChart();
    renderTable(allTickets);
    bindSearchAndFilters();
  }

  /* ── Data fetching ───────────────────────────────────────────── */
  async function loadTickets() {
    try {
      const res = await fetch(`${API_BASE}/api/helpdesk/tickets`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('non-2xx');
      const data = await res.json();
      allTickets = Array.isArray(data.tickets) ? data.tickets : (Array.isArray(data) ? data : MOCK_TICKETS);
    } catch {
      allTickets = MOCK_TICKETS;
    }
    filtered = [...allTickets];
  }

  async function loadHrUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/helpdesk/assignees`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('non-2xx');
      const data = await res.json();
      hrUsers = Array.isArray(data) ? data.map(u => u.name || u) : MOCK_HR_USERS;
    } catch {
      hrUsers = MOCK_HR_USERS;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     STATS
  ════════════════════════════════════════════════════════════════ */
  function renderStats() {
    const total      = allTickets.length;
    const open       = allTickets.filter(t => t.status === 'Open').length;
    const inProgress = allTickets.filter(t => t.status === 'In Progress').length;
    const resolved   = allTickets.filter(t => t.status === 'Resolved').length;

    animCount('statTotal',      total);
    animCount('statOpen',       open);
    animCount('statInProgress', inProgress);
    animCount('statResolved',   resolved);

    // Avg resolution time mock (would come from backend in production)
    const el = document.getElementById('statAvgTime');
    if (el) el.textContent = '1h';
  }

  function animCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const step = Math.ceil(target / 20) || 1;
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = start;
      if (start >= target) clearInterval(timer);
    }, 40);
  }

  /* ═══════════════════════════════════════════════════════════════
     CATEGORY CHART
  ════════════════════════════════════════════════════════════════ */
  function renderCategoryChart() {
    const container = document.getElementById('categoryChart');
    if (!container) return;

    // Count per category
    const counts = {};
    allTickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const max = Math.max(...Object.values(counts), 1);

    // Sort descending
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted.map(([cat, count]) => {
      const meta  = CATEGORY_META[cat] || { emoji: '📌', color: '#64748b' };
      const pct   = Math.round((count / max) * 100);
      return `
        <div class="cat-row">
          <div class="cat-label">
            <span>${meta.emoji}</span>
            ${escHtml(cat)}
          </div>
          <div class="cat-bar-wrap">
            <div class="cat-bar" style="width:0%" data-w="${pct}%"></div>
          </div>
          <div class="cat-count">${count}</div>
        </div>`;
    }).join('');

    // Animate bars after paint
    requestAnimationFrame(() => {
      container.querySelectorAll('.cat-bar').forEach(bar => {
        bar.style.width = bar.dataset.w;
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     TABLE RENDERING
  ════════════════════════════════════════════════════════════════ */
  function renderTable(tickets) {
    const tbody = document.getElementById('ticketsBody');
    const badge = document.getElementById('ticketCountBadge');
    if (!tbody) return;
    if (badge) badge.textContent = tickets.length;

    if (!tickets.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <i class="ti ti-ticket-off"></i>
          <p>No tickets match your filters.</p>
        </div></td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map((t, i) => `
      <tr style="animation: fade-up 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.03}s both;">
        <td><span class="ticket-id">${escHtml(t.ticketId)}</span></td>
        <td>
          <div class="ticket-subject">${escHtml(t.subject)}</div>
          <div class="ticket-employee">
            <i class="ti ti-user-circle"></i>
            ${escHtml(t.employee)} &middot; ${escHtml(t.department)}
          </div>
        </td>
        <td>${t.assignedTo ? `<span style="font-size:13px;font-weight:600;color:#374151;">${escHtml(t.assignedTo)}</span>` : '<span class="assign-dash">—</span>'}</td>
        <td><span class="cat-icon" title="${escHtml(t.category)}">${(CATEGORY_META[t.category] || {}).emoji || '📌'}</span></td>
        <td>${priorityBadge(t.priority)}</td>
        <td>${statusBadge(t.status)}</td>
        <td style="font-size:13px;color:#64748b;white-space:nowrap;">${formatDate(t.date)}</td>
        <td>
          <button class="row-action-btn view" onclick="HD.openModal('${escHtml(t.ticketId)}')">
            <i class="ti ti-eye"></i> View
          </button>
        </td>
      </tr>`).join('');
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  function priorityBadge(p) {
    const map = { High: 'high', Medium: 'medium', Low: 'low' };
    return `<span class="badge badge-${map[p] || 'medium'}">${escHtml(p)}</span>`;
  }

  function statusBadge(s) {
    const map = { Open: 'open', 'In Progress': 'inprogress', Resolved: 'resolved', Closed: 'closed' };
    return `<span class="badge badge-${map[s] || 'open'}">${escHtml(s)}</span>`;
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  }

  function escHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  /* ═══════════════════════════════════════════════════════════════
     FILTERING
  ════════════════════════════════════════════════════════════════ */
  function bindSearchAndFilters() {
    const search = document.getElementById('hdSearch');
    if (search) {
      search.addEventListener('input', () => applyFilters());
    }
  }

  function applyFilters() {
    const q        = (document.getElementById('hdSearch')?.value     || '').toLowerCase().trim();
    const status   = document.getElementById('filterStatus')?.value   || '';
    const category = document.getElementById('filterCategory')?.value || '';
    const priority = document.getElementById('filterPriority')?.value || '';

    filtered = allTickets.filter(t => {
      const matchQ = !q || [t.ticketId, t.subject, t.employee, t.department].some(f => f.toLowerCase().includes(q));
      const matchS = !status   || t.status   === status;
      const matchC = !category || t.category === category;
      const matchP = !priority || t.priority === priority;
      return matchQ && matchS && matchC && matchP;
    });

    renderTable(filtered);
  }

  function clearFilters() {
    ['hdSearch', 'filterStatus', 'filterCategory', 'filterPriority'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    filtered = [...allTickets];
    renderTable(filtered);
  }

  /* ═══════════════════════════════════════════════════════════════
     MODAL
  ════════════════════════════════════════════════════════════════ */
  function openModal(ticketId) {
    const ticket = allTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;
    activeTicket = ticket;

    // Populate fields
    set('mTicketId',  ticket.ticketId);
    set('mEmployee',  ticket.employee);
    set('mDept',      ticket.department);
    set('mCategory',  `${(CATEGORY_META[ticket.category] || {}).emoji || ''} ${ticket.category}`);
    set('mDate',      formatDate(ticket.date));
    set('mDesc',      ticket.description || '—');

    // Badges in modal
    const statusEl = document.getElementById('mStatus');
    if (statusEl) statusEl.innerHTML = statusBadge(ticket.status);
    const priEl = document.getElementById('mPriority');
    if (priEl) priEl.innerHTML = priorityBadge(ticket.priority);

    // Populate assign dropdown
    const sel = document.getElementById('mAssignTo');
    if (sel) {
      sel.innerHTML = '<option value="">— Unassigned —</option>' +
        hrUsers.map(u => `<option value="${escHtml(u)}" ${ticket.assignedTo === u ? 'selected' : ''}>${escHtml(u)}</option>`).join('');
    }

    const modal = document.getElementById('ticketModal');
    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  }

  function closeModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
    activeTicket = null;
  }

  function overlayClose(e) {
    if (e.target === document.getElementById('ticketModal')) closeModal();
  }

  function set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ── Save / Resolve ──────────────────────────────────────────── */
  async function saveTicket() {
    if (!activeTicket) return;
    const assignTo = document.getElementById('mAssignTo')?.value || '';
    activeTicket.assignedTo = assignTo;

    try {
      await fetch(`${API_BASE}/api/helpdesk/tickets/${activeTicket.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignTo })
      });
    } catch { /* offline — update local only */ }

    closeModal();
    renderTable(filtered);
    toast('Ticket updated successfully!', 'success');
  }

  async function resolveTicket() {
    if (!activeTicket) return;
    activeTicket.status = 'Resolved';

    try {
      await fetch(`${API_BASE}/api/helpdesk/tickets/${activeTicket.ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
    } catch { /* offline */ }

    closeModal();
    renderStats();
    renderCategoryChart();
    renderTable(filtered);
    toast('Ticket marked as resolved!', 'success');
  }

  /* ═══════════════════════════════════════════════════════════════
     TOAST
  ════════════════════════════════════════════════════════════════ */
  function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icon = type === 'success' ? 'ti-circle-check' : 'ti-alert-circle';
    const div  = document.createElement('div');
    div.className = `toast ${type}`;
    div.innerHTML = `<i class="ti ${icon}"></i> ${escHtml(msg)}`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  }

  /* ── Expose public API ───────────────────────────────────────── */
  return { init, applyFilters, clearFilters, openModal, closeModal, overlayClose, saveTicket, resolveTicket };

})(); // end HD
 // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  }

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => HD.init());
