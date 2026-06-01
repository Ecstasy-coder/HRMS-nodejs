/* ═══════════════════════════════════════════════════════════════
   topbar-utils.js  —  My Ecstasy HR Portal
   Handles:
   • Loading logged-in user's name into topbar avatar + sidebar
   • Notification bell: badge count + dropdown panel
   • Avatar click → profile redirect
   Include this script on every page AFTER the topbar HTML.
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── inject notification-panel styles once ────────────────── */
  if (!document.getElementById('notif-styles')) {
    const s = document.createElement('style');
    s.id = 'notif-styles';
    s.textContent = `
      .notif-panel {
        position: fixed;
        top: 70px;
        right: 20px;
        width: 340px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(15,23,42,.18);
        border: 1px solid #e8eef4;
        z-index: 9000;
        overflow: hidden;
        animation: notif-drop .2s cubic-bezier(.16,1,.3,1) both;
      }
      @keyframes notif-drop {
        from { opacity:0; transform:translateY(-8px) scale(.98); }
        to   { opacity:1; transform:translateY(0)    scale(1);   }
      }
      .notif-panel-head {
        padding: 14px 18px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .notif-panel-head strong { font-size: 14px; color: #1e293b; font-family:'Sora',sans-serif; }
      .notif-mark-read {
        font-size: 12px; color: #4f8ef7; cursor: pointer;
        font-family:'Sora',sans-serif; font-weight:600;
        background:none; border:none; padding:0;
      }
      .notif-mark-read:hover { text-decoration:underline; }
      .notif-list { max-height: 380px; overflow-y: auto; }
      .notif-list::-webkit-scrollbar { width: 4px; }
      .notif-list::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
      .notif-item {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 14px 18px;
        border-bottom: 1px solid #f8fafc;
        cursor: pointer;
        transition: background .15s;
        text-decoration:none;
      }
      .notif-item:hover { background: #f8fafc; }
      .notif-item.unread { background: #f0f7ff; }
      .notif-item.unread:hover { background: #e7f0ff; }
      .notif-dot {
        width: 8px; height: 8px; border-radius:50%;
        background:#4f8ef7; flex-shrink:0; margin-top:5px;
      }
      .notif-item.read .notif-dot { background:transparent; }
      .notif-icon-wrap {
        width:36px; height:36px; border-radius:10px;
        background:#eff6ff; color:#4f8ef7;
        display:flex; align-items:center; justify-content:center;
        font-size:16px; flex-shrink:0;
      }
      .notif-text-title {
        font-size:13px; font-weight:600; color:#1e293b;
        font-family:'Sora',sans-serif; margin-bottom:2px;
      }
      .notif-text-msg {
        font-size:11.5px; color:#64748b;
        font-family:'Sora',sans-serif; line-height:1.5;
      }
      .notif-time {
        font-size:10.5px; color:#94a3b8; white-space:nowrap;
        font-family:'Sora',sans-serif; margin-top:3px;
      }
      .notif-empty {
        text-align:center; padding:40px 20px;
        font-size:13px; color:#94a3b8;
        font-family:'Sora',sans-serif;
      }
      .notif-empty i { font-size:32px; display:block; margin-bottom:10px; }
      .notif-footer {
        padding:10px 18px; border-top:1px solid #f1f5f9; text-align:center;
      }
      .notif-footer a {
        font-size:12.5px; color:#4f8ef7; font-weight:600;
        font-family:'Sora',sans-serif; text-decoration:none;
      }
      .notif-footer a:hover { text-decoration:underline; }
    `;
    document.head.appendChild(s);
  }

  /* ── Icons per notification type ─────────────────────────── */
  const TYPE_ICONS = {
    leave:      'ti ti-leaf',
    helpdesk:   'ti ti-message-circle',
    user:       'ti ti-user-plus',
    attendance: 'ti ti-calendar-check',
    info:       'ti ti-info-circle',
    default:    'ti ti-bell'
  };

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  /* ── Load topbar user info ────────────────────────────────── */
  async function loadTopbarUser() {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (!res.ok) return;
      const user = await res.json();

      // Set topbar avatar initials
      const avatarEl = document.getElementById('topbarAvatar');
      if (avatarEl) {
        const name     = user.fullName || user.name || '';
        const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U';
        // If user has avatar image, show it; otherwise initials
        if (user.avatar) {
          avatarEl.innerHTML = `<img src="${user.avatar}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        } else {
          avatarEl.textContent = initials;
        }
        avatarEl.style.cursor = 'pointer';
        avatarEl.title = 'View Profile';
        avatarEl.onclick = () => { window.location.href = '/profile'; };
      }

      // Also populate sidebar when it appears
      fillSidebar(user);

    } catch (_) {}
  }

  /* ── Fill sidebar user chip ─────────────────────────────── */
  function fillSidebar(user) {
    const tryFill = () => {
      const nameEl   = document.getElementById('sidebarName');
      const roleEl   = document.getElementById('sidebarRole');
      const avatarEl = document.getElementById('sidebarAvatar');
      if (!nameEl) return false;

      nameEl.textContent = user.fullName || user.name || 'User';
      if (roleEl) roleEl.textContent = `${user.role || 'Employee'} · ${user.department || ''}`;
      if (avatarEl) {
        const name     = user.fullName || user.name || '';
        const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U';
        if (user.avatar) {
          avatarEl.innerHTML = `<img src="${user.avatar}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        } else {
          avatarEl.textContent = initials;
        }
      }
      return true;
    };

    if (!tryFill()) {
      // Sidebar not rendered yet — watch for it
      const container = document.getElementById('sidebar-container');
      if (!container) return;
      const obs = new MutationObserver(() => {
        if (tryFill()) obs.disconnect();
      });
      obs.observe(container, { childList: true, subtree: true });
    }
  }

  /* ── Notification badge ───────────────────────────────────── */
  async function loadNotifCount() {
    try {
      const res  = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const cnt  = data.unreadCount || 0;

      const badge = document.getElementById('notifCount');
      if (badge) {
        badge.textContent    = cnt > 9 ? '9+' : String(cnt);
        badge.style.display  = cnt > 0 ? 'flex' : 'none';
      }
    } catch (_) {}
  }

  /* ── Build notification panel HTML ───────────────────────── */
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id        = 'notifPanel';
    panel.className = 'notif-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="notif-panel-head">
        <strong>Notifications</strong>
        <button class="notif-mark-read" id="notifMarkRead">Mark all read</button>
      </div>
      <div class="notif-list" id="notifList">
        <div class="notif-empty"><i class="ti ti-loader-2 spin"></i>Loading…</div>
      </div>
      <div class="notif-footer"><a href="#">View all</a></div>`;
    document.body.appendChild(panel);

    document.getElementById('notifMarkRead').addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await fetch('/api/notifications/mark-read', { method: 'PATCH', credentials: 'include' });
        renderNotifs(panel, []);
        const badge = document.getElementById('notifCount');
        if (badge) badge.style.display = 'none';
        fetchAndRender(panel);
      } catch (_) {}
    });
    return panel;
  }

  async function fetchAndRender(panel) {
    try {
      const res  = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();
      renderNotifs(panel, data.notifications || []);
      const cnt   = data.unreadCount || 0;
      const badge = document.getElementById('notifCount');
      if (badge) {
        badge.textContent   = cnt > 9 ? '9+' : String(cnt);
        badge.style.display = cnt > 0 ? 'flex' : 'none';
      }
    } catch (_) {
      const list = panel.querySelector('#notifList');
      if (list) list.innerHTML = '<div class="notif-empty"><i class="ti ti-wifi-off"></i>Could not load</div>';
    }
  }

  function renderNotifs(panel, items) {
    const list = panel.querySelector('#notifList');
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<div class="notif-empty"><i class="ti ti-bell-off"></i>No notifications</div>';
      return;
    }
    list.innerHTML = items.map(n => {
      const iconCls = TYPE_ICONS[n.type] || TYPE_ICONS.default;
      const cls     = n.isRead ? 'notif-item read' : 'notif-item unread';
      const href    = n.link || '#';
      return `
        <a class="${cls}" href="${href}" data-id="${n._id}">
          <span class="notif-dot"></span>
          <span class="notif-icon-wrap"><i class="${iconCls}"></i></span>
          <div style="flex:1;min-width:0;">
            <div class="notif-text-title">${n.title || ''}</div>
            <div class="notif-text-msg">${n.message || ''}</div>
            <div class="notif-time">${timeAgo(n.createdAt)}</div>
          </div>
        </a>`;
    }).join('');

    // Mark individual as read on click
    list.querySelectorAll('.notif-item[data-id]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id;
        if (id) await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' }).catch(() => {});
      });
    });
  }

  /* ── Wire up notification bell ───────────────────────────── */
  function setupNotifBell() {
    const bell = document.querySelector('.notif-btn');
    if (!bell) return;

    let panel = null;

    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!panel) panel = buildPanel();
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
      if (!open) fetchAndRender(panel);
    });

    document.addEventListener('click', (e) => {
      if (panel && !panel.contains(e.target) && !bell.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    loadTopbarUser();
    loadNotifCount();
    setupNotifBell();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
