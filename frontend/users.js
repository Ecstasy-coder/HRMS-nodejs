/* ═══════════════════════════════════════════════════════════════
   MANAGE USERS  —  users.js
   API base uses a relative path so no port is hard-coded.
═══════════════════════════════════════════════════════════════ */

const API = '/api/users';

let allUsers      = [];   // master list from server
let currentFilter = 'all';
let currentDocUserId = null; // which user's docs are open

/* ════════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadSidebar();
  setCurrentDate();
  loadUsers();
  initSearchListener();
  initDragDrop();
});

/* ════════════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════════════ */
function loadSidebar() {
   fetch('sidebar.html')
    .then(r => r.text())
     .then(html => {
       document.getElementById('sidebar-container').innerHTML = html;

       /* Mark "Manage Users" nav link as active */
       setTimeout(() => {
         document.querySelectorAll('#sidebar-container .nav-item').forEach(el => {
           if (el.textContent.trim().toLowerCase().includes('manage users') ||
               (el.href && el.href.includes('/users'))) {
             el.classList.add('active');
           }
         });
       }, 80);

       /* Delegate active-toggle clicks inside sidebar */
       document.getElementById('sidebar-container').addEventListener('click', e => {
         const link = e.target.closest('.nav-item');
         if (!link) return;
         document.querySelectorAll('#sidebar-container .nav-item')
           .forEach(a => a.classList.remove('active'));
         link.classList.add('active');
       });
     })
     .catch(() => {/* sidebar optional */});
     
 }


/* ════════════════════════════════════════════════════════════════
   DATE
════════════════════════════════════════════════════════════════ */
function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
   const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  document.getElementById('topbarDate').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;



/* ════════════════════════════════════════════════════════════════
   LOAD ALL USERS
════════════════════════════════════════════════════════════════ */
async function loadUsers() {
  try {
    const res = await fetch(API, { credentials: 'include' });
    if (res.status === 401) { window.location.href = '/'; return; }
    if (!res.ok) throw new Error('Failed to fetch users');

    allUsers = await res.json();
    updateStats();
    applyView();
    populateManagerDropdowns();
  } catch (err) {
    showToast(err.message, 'error');
    document.getElementById('usersGrid').innerHTML =
      `<div class="empty-state"><i class="ti ti-wifi-off"></i><p>Could not load users</p></div>`;
  }
}

/* ════════════════════════════════════════════════════════════════
   STATS
════════════════════════════════════════════════════════════════ */
function updateStats() {
  document.getElementById('totalUsers').textContent    = allUsers.length;
  document.getElementById('activeUsers').textContent   = allUsers.filter(u => u.status === 'Active').length;
  document.getElementById('employeeUsers').textContent = allUsers.filter(u => u.role === 'Employee').length;
  document.getElementById('managerUsers').textContent  = allUsers.filter(u => u.role === 'Reporting Manager').length;
}

/* ════════════════════════════════════════════════════════════════
   FILTER + SEARCH → RENDER
════════════════════════════════════════════════════════════════ */
function applyView() {
  const q = (document.getElementById('search').value || '').toLowerCase().trim();

  let list = allUsers;

  if (currentFilter !== 'all') {
    list = list.filter(u => u.role === currentFilter);
  }

  if (q) {
    list = list.filter(u =>
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email    || '').toLowerCase().includes(q)
    );
  }

  renderUsers(list);
}

function filterUsers(role, btn) {
  currentFilter = role;
  document.querySelectorAll('.filter-btn')
    .forEach(b => b.classList.remove('active-filter'));
  btn.classList.add('active-filter');
  applyView();
}

function initSearchListener() {
  document.getElementById('search').addEventListener('input', applyView);
}

/* ════════════════════════════════════════════════════════════════
   RENDER USER CARDS
════════════════════════════════════════════════════════════════ */
function renderUsers(users) {
  const grid = document.getElementById('usersGrid');

  if (!users.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-users-minus"></i>
        <p>No users found</p>
      </div>`;
    return;
  }

  grid.innerHTML = users.map(u => buildCard(u)).join('');
}

function buildCard(u) {
  const initials  = getInitials(u.fullName);
  const isActive  = u.status === 'Active';
  const statusTag = isActive
    ? `<span class="tag tag-active">Active</span>`
    : `<span class="tag tag-inactive">Inactive</span>`;
  const avatarHtml = u.avatar
    ? `<img src="${u.avatar}" alt="${esc(u.fullName)}">`
    : initials;

  const reportsTo = (u.role !== 'Reporting Manager' && u.reportingManager)
    ? `<div class="detail-row">
         <div class="detail-label">Reports To</div>
         <div class="detail-value">${esc(u.reportingManager)}</div>
       </div>`
    : '';

  const toggleBtn = isActive
    ? `<button class="action-btn deact-btn" onclick="toggleStatus('${u._id}')">
         <i class="ti ti-user-off"></i> Deactivate
       </button>`
    : `<button class="action-btn activ-btn" onclick="toggleStatus('${u._id}')">
         <i class="ti ti-user-check"></i> Activate
       </button>`;

  return `
    <div class="user-card" id="card-${u._id}">
      <div class="card-top">
        <div class="card-avatar">${avatarHtml}</div>
        <div class="card-info">
          <h3>${esc(u.fullName || '—')}</h3>
          <p class="card-email">${esc(u.email || '—')}</p>
          <div class="tags">
            <span class="tag tag-role">${esc(u.role || '—')}</span>
            ${statusTag}
          </div>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-row">
          <div class="detail-label">Designation</div>
          <div class="detail-value">${esc(u.designation || '—')}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Department</div>
          <div class="detail-value">${esc(u.department || '—')}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Emp Code</div>
          <div class="detail-value">${esc(u.employeeCode || '—')}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Phone</div>
          <div class="detail-value">${esc(u.phone || '—')}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Gender</div>
          <div class="detail-value">${esc(u.gender || '—')}</div>
        </div>
        <div class="detail-row">
        <div class="detail-label">Date of Birth</div>
       <div class="detail-value">${fmtDate(u.birthday)}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Joined</div>
          <div class="detail-value">${fmtDate(u.joinedDate)}</div>
        </div>
        ${reportsTo}
      </div>

      <div class="card-actions">
        <button class="action-btn edit-btn" onclick="openEditModal('${u._id}')">
          <i class="ti ti-edit"></i> Edit
        </button>
        <button class="action-btn docs-btn" onclick="openDocsModal('${u._id}','${esc(u.fullName)}')">
          <i class="ti ti-file-description"></i> Docs
        </button>
        ${toggleBtn}
        <button class="action-btn del-btn" onclick="deleteUser('${u._id}','${esc(u.fullName)}')">
          <i class="ti ti-trash"></i> Delete
        </button>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════════
   ADD USER FORM
════════════════════════════════════════════════════════════════ */
function openAddForm() {
  document.getElementById('addUserBox').style.display = 'block';
  document.getElementById('addUserBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAddForm() {
  document.getElementById('addUserBox').style.display = 'none';
  document.getElementById('addUserForm').reset();
}

async function submitAddUser() {
  const val = id => document.getElementById(id).value.trim();

  const fullName        = val('addName');
  const email           = val('addEmail');
  const password        = val('addPassword');
  const role            = val('addRole');
  const department      = val('addDepartment');
  const designation     = val('addDesignation');
  const employeeCode    = val('addEmployeeCode');
  const phone           = val('addPhone');
  const birthday        = val('addDob');
  const joinedDate      = val('addJoinedDate');
  const gender          = val('addGender');
  const reportingManager = val('addReportingManager');

  if (!fullName || !email || !password || !role || !department ||
      !designation || !employeeCode || !phone || !joinedDate || !gender) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const btn = document.getElementById('addSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Adding…';

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fullName, email, password, role, department, designation,
        employeeCode, phone, birthday, joinedDate, gender, reportingManager
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add user');

    showToast(`${fullName} added successfully!`, 'success');
    closeAddForm();
    await loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-check"></i> Add User';
  }
}

/* ════════════════════════════════════════════════════════════════
   EDIT USER MODAL
════════════════════════════════════════════════════════════════ */
function openEditModal(id) {
  const u = allUsers.find(u => u._id === id);
  if (!u) return;

  document.getElementById('editId').value            = u._id;
  document.getElementById('editName').value          = u.fullName        || '';
  document.getElementById('editEmail').value         = u.email           || '';
  document.getElementById('editRole').value          = u.role            || '';
  document.getElementById('editDepartment').value    = u.department      || '';
  document.getElementById('editDesignation').value   = u.designation     || '';
  document.getElementById('editEmployeeCode').value  = u.employeeCode    || '';
  document.getElementById('editPhone').value         = u.phone           || '';
  document.getElementById('editGender').value        = u.gender          || '';
  document.getElementById('editDob').value           = u.birthday        || '';
  document.getElementById('editJoinedDate').value    = u.joinedDate      || '';
  document.getElementById('editReportingManager').value = u.reportingManager || '';
  document.getElementById('editPassword').value      = '';

  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
  const val = id => document.getElementById(id).value.trim();

  const id       = val('editId');
  const fullName = val('editName');
  const email    = val('editEmail');

  if (!fullName || !email) {
    showToast('Name and email are required', 'error');
    return;
  }

  const payload = {
    fullName,
    email,
    role:             val('editRole'),
    department:       val('editDepartment'),
    designation:      val('editDesignation'),
    employeeCode:     val('editEmployeeCode'),
    phone:            val('editPhone'),
    gender:           val('editGender'),
    birthday:         val('editDob'),
    joinedDate:       val('editJoinedDate'),
    reportingManager: val('editReportingManager')
  };

  /* Only include password if the HR typed something */
  const pw = val('editPassword');
  if (pw) payload.password = pw;

  const btn = document.getElementById('editSaveBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Saving…';

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');

    showToast('User updated successfully!', 'success');
    closeEditModal();
    await loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-check"></i> Save Changes';
  }
}

/* ════════════════════════════════════════════════════════════════
   TOGGLE STATUS (Activate / Deactivate)
════════════════════════════════════════════════════════════════ */
async function toggleStatus(id) {
  const u = allUsers.find(u => u._id === id);
  const action = u && u.status === 'Active' ? 'deactivate' : 'activate';

  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  try {
    const res = await fetch(`${API}/${id}/status`, {
      method: 'PATCH',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Status update failed');

    showToast(`User ${data.status === 'Active' ? 'activated' : 'deactivated'}!`, 'success');
    await loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════════
   DELETE USER
════════════════════════════════════════════════════════════════ */
async function deleteUser(id, name) {
  if (!confirm(`Delete "${name}"?\n\nThis will permanently remove the user and all their documents. This cannot be undone.`)) return;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete failed');

    showToast(`${name} deleted.`, 'success');
    await loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════════
   DOCS MODAL  — open / close
════════════════════════════════════════════════════════════════ */
function openDocsModal(userId, userName) {
  currentDocUserId = userId;
  document.getElementById('docsUserName').textContent = userName;
  document.getElementById('docsModal').style.display  = 'flex';
  /* reset upload zone */
  document.getElementById('docFileInput').value  = '';
  document.getElementById('chosenFileName').style.display = 'none';
  document.getElementById('docUploadBtn').style.display   = 'none';
  loadDocs();
}

function closeDocsModal() {
  document.getElementById('docsModal').style.display = 'none';
  currentDocUserId = null;
}

/* ════════════════════════════════════════════════════════════════
   DOCS MODAL  — load document list
════════════════════════════════════════════════════════════════ */
async function loadDocs() {
  const list = document.getElementById('docsList');
  list.innerHTML = `<div class="empty-state small"><i class="ti ti-loader-2 spin"></i><p>Loading…</p></div>`;

  try {
    const res  = await fetch(`${API}/${currentDocUserId}/documents`, { credentials: 'include' });
    const docs = await res.json();
    if (!res.ok) throw new Error('Failed to load documents');

    document.getElementById('docsCount').textContent = `${docs.length} file${docs.length !== 1 ? 's' : ''}`;

    if (!docs.length) {
      list.innerHTML = `<div class="empty-state small"><i class="ti ti-file-off"></i><p>No documents yet</p></div>`;
      return;
    }

    list.innerHTML = docs.map(doc => `
      <div class="doc-item" id="docrow-${doc._id}">
        <div class="doc-left">
          <span class="doc-icon">${fileIcon(doc.mimeType)}</span>
          <div>
            <div class="doc-name" title="${esc(doc.originalName)}">${esc(doc.originalName)}</div>
            <div class="doc-meta">${fmtDate(doc.uploadedAt)} · ${fmtSize(doc.size)}</div>
          </div>
        </div>
        <div class="doc-right">
          <a  class="doc-btn doc-download"
              href="${doc.filePath}"
              download="${esc(doc.originalName)}"
              target="_blank">
            <i class="ti ti-download"></i> Download
          </a>
          <button class="doc-btn doc-delete"
                  onclick="deleteDoc('${doc._id}','${esc(doc.originalName)}')">
            <i class="ti ti-trash"></i> Delete
          </button>
        </div>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state small"><i class="ti ti-alert-circle"></i><p>${err.message}</p></div>`;
  }
}

/* ════════════════════════════════════════════════════════════════
   DOCS MODAL  — choose file preview
════════════════════════════════════════════════════════════════ */
function onFileChosen(input) {
  const file    = input.files[0];
  const nameEl  = document.getElementById('chosenFileName');
  const uploadBtn = document.getElementById('docUploadBtn');

  if (!file) {
    nameEl.style.display    = 'none';
    uploadBtn.style.display = 'none';
    return;
  }

  nameEl.innerHTML = `<i class="ti ti-file"></i> ${esc(file.name)} (${fmtSize(file.size)})`;
  nameEl.style.display    = 'flex';
  uploadBtn.style.display = 'flex';
}

/* ════════════════════════════════════════════════════════════════
   DOCS MODAL  — upload
════════════════════════════════════════════════════════════════ */
async function uploadDoc() {
  const input = document.getElementById('docFileInput');
  if (!input.files.length) { showToast('Please choose a file first', 'error'); return; }

  const btn = document.getElementById('docUploadBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Uploading…';

  const formData = new FormData();
  formData.append('document', input.files[0]);

  try {
    const res  = await fetch(`${API}/${currentDocUserId}/documents`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');

    showToast('Document uploaded!', 'success');
    input.value = '';
    document.getElementById('chosenFileName').style.display = 'none';
    btn.style.display = 'none';
    loadDocs();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-upload"></i> Upload Document';
  }
}

/* ════════════════════════════════════════════════════════════════
   DOCS MODAL  — delete a document
════════════════════════════════════════════════════════════════ */
async function deleteDoc(docId, name) {
  if (!confirm(`Delete "${name}"?`)) return;

  try {
    const res  = await fetch(`${API}/${currentDocUserId}/documents/${docId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete failed');

    showToast('Document deleted.', 'success');
    loadDocs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════════
   DRAG & DROP for upload zone
════════════════════════════════════════════════════════════════ */
function initDragDrop() {
  const zone  = document.getElementById('uploadZone');
  const input = document.getElementById('docFileInput');
  if (!zone) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    /* Inject into the hidden file input */
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    onFileChosen(input);
  });
}

/* ════════════════════════════════════════════════════════════════
   OVERLAY CLICK  — close modal when clicking the backdrop
════════════════════════════════════════════════════════════════ */
function overlayClose(event, modalId) {
  if (event.target.id === modalId) {
    if (modalId === 'editModal') closeEditModal();
    if (modalId === 'docsModal') closeDocsModal();
  }
}

/* ════════════════════════════════════════════════════════════════
   REPORTING MANAGER DROPDOWNS
   Populate both the Add-form and Edit-modal selects.
════════════════════════════════════════════════════════════════ */
function populateManagerDropdowns() {
  const managers = allUsers.filter(u => u.role === 'Reporting Manager');
  const opts = managers
    .map(m => `<option value="${esc(m.fullName)}">${esc(m.fullName)}</option>`)
    .join('');

  ['addReportingManager', 'editReportingManager'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const prev = el.value;
    el.innerHTML = `<option value="">— None —</option>${opts}`;
    if (prev) el.value = prev; // restore selection after reload
  });
}

/* ════════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const icons = { success: 'ti-circle-check', error: 'ti-alert-circle', info: 'ti-info-circle' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="ti ${icons[type] || icons.info}"></i> ${esc(msg)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3200);
}

/* ════════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════════ */

/* HTML-escape to prevent XSS when injecting user data into innerHTML */
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* 2-letter initials from a full name */
function getInitials(name) {
  if (!name) return 'U';
  return name.trim().split(/\s+/)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/* Format a date string or ISO date to "20 May 2026" */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

/* Human-readable file size */
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* Emoji icon based on MIME type */
function fileIcon(mime) {
  if (!mime) return '📄';
  if (mime.includes('pdf'))   return '📕';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('excel') || mime.includes('sheet'))   return '📊';
  if (mime.includes('text')) return '📃';
  return '📄';
}
