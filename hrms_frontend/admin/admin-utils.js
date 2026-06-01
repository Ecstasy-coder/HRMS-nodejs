// admin-utils.js — Shared utilities for all admin pages

// ── Auth guard ─────────────────────────────────────────────────
async function adminAuthGuard() {
  try {
    const r = await fetch('/api/profile', { credentials: 'include' });
    if (!r.ok) { window.location.href = '/login.html'; return null; }
    const user = await r.json();
    if (user.role !== 'Admin') { window.location.href = '/login.html'; return null; }
    return user;
  } catch(e) {
    window.location.href = '/login.html';
    return null;
  }
}

// ── Render sidebar ─────────────────────────────────────────────
function renderAdminSidebar(activePage, user) {
  const pages = [
    { id: 'dashboard',       icon: 'fa-table-columns',      label: 'Dashboard',           href: 'dashboard.html' },
    { id: 'review-jobcards', icon: 'fa-clipboard-check',  label: 'Review HR Job Cards', href: 'review-jobcards.html' },
    { id: 'holiday-calendar',icon: 'fa-calendar',    label: 'Holiday Calendar',    href: 'holiday-calendar.html' },
    { id: 'users',           icon: 'fa-users',       label: 'Manage Users',        href: 'users.html' },
    { id: 'hr-leaves',       icon: 'fa-calendar-xmark',  label: 'HR Leave Requests',   href: 'hr-leaves.html' },
    { id: 'events',          icon: 'fa-star',        label: 'Important Events',    href: 'events.html' },
    { id: 'birthdays',       icon: 'fa-cake-candles', label: 'Birthdays',          href: 'birthdays.html' },
    { id: 'analysis',        icon: 'fa-chart-line',  label: 'Analysis',            href: 'analysis.html' },
    { id: 'about',           icon: 'fa-circle-info', label: 'About Us',            href: 'about.html' },
  ];
  // Note: Gallery is managed directly from the Dashboard page (not a separate sidebar item)

  const initials = (user?.fullName || 'A').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const avatarHtml = user?.avatar
    ? `<img src="${user.avatar}" alt="avatar"/>`
    : initials;

  const navHtml = pages.map(p => `
    <a href="${p.href}" class="nav-item ${activePage === p.id ? 'active' : ''}">
      <i class="fa-solid ${p.icon}"></i> ${p.label}
    </a>`).join('');

  return `
    <div class="sidebar-brand">
      <div class="brand-icon">M</div>
      <div>
        <div class="brand-name">My Ecstasy</div>
        <div class="brand-sub">Admin Portal</div>
      </div>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-user">
      <div class="user-card">
        <div class="user-avatar">${avatarHtml}</div>
        <div>
          <div class="user-name">${user?.fullName || 'Admin'}</div>
          <div class="user-role">${user?.role || 'Administrator'} · ${user?.department || ''}</div>
        </div>
      </div>
      <button class="btn-signout" onclick="adminSignOut()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
    </div>`;
}

// ── Sign out ───────────────────────────────────────────────────
async function adminSignOut() {
  try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch(_) {}
  window.location.href = '/login.html';
}

// ── Date display ───────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getLiveDate() {
  const now = new Date();
  return now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Toast notification ─────────────────────────────────────────
function showToast(msg, type = 'default') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t);
  }
  t.className = `show ${type}`;
  t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-xmark-circle' : 'fa-bell'}"></i> ${msg}`;
  setTimeout(() => { t.className = ''; }, 3500);
}

// ── Avatar initials ────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
}

// ── Avatar color ───────────────────────────────────────────────
const AV_COLORS = ['#4f8ef7','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
function avatarColor(name) {
  let h = 0; for (let c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % AV_COLORS.length;
  return AV_COLORS[h];
}

// ── Real-time polling helper ───────────────────────────────────
function startPolling(fn, intervalMs = 30000) {
  fn();
  return setInterval(fn, intervalMs);
}
