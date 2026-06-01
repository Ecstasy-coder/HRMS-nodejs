const API_URL = "/api/holiday-calendar";

const uploadBtn = document.getElementById("uploadBtn");
const tableBody = document.getElementById("calendarTableBody");
const countBadge = document.getElementById("calendarCount");

// ========================================
// UPLOAD CALENDAR
// ========================================

uploadBtn.addEventListener("click", async () => {

  const year = document.getElementById("calendarYear").value;

  const file =
    document.getElementById("calendarFile").files[0];

  if (!file) {

    showToast(
      "Please select a file first.",
      "warning"
    );

    return;
  }

  uploadBtn.disabled = true;

  uploadBtn.innerHTML =
    '<i class="ti ti-loader-2 spin"></i> Uploading...';

  const formData = new FormData();

  formData.append("year", year);

  formData.append("calendar", file);

  try {

    const response = await fetch(
      `${API_URL}/upload`,
      {
        method: "POST",
        credentials: "include",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.message || "Upload failed"
      );
    }

    showToast(
      "Calendar uploaded successfully.",
      "success"
    );

    document.getElementById(
      "calendarFile"
    ).value = "";

    const selected =
      document.getElementById(
        "selectedFileName"
      );

    if (selected) {

      selected.classList.remove("visible");
    }

    loadCalendars();

  } catch (error) {

    console.error(error);

    showToast(
      "Upload failed. Please try again.",
      "error"
    );

  } finally {

    uploadBtn.disabled = false;

    uploadBtn.innerHTML =
      '<i class="ti ti-upload"></i> Upload Calendar';
  }

});

// ========================================
// LOAD CALENDARS
// ========================================

async function loadCalendars() {

  try {

    const response = await fetch(
      `${API_URL}/all`,
      {
        credentials: "include"
      }
    );

    const data = await response.json();

    const calendars = data.data || [];

    if (countBadge) {

      countBadge.textContent =
        `${calendars.length} file${calendars.length !== 1 ? "s" : ""}`;
    }

    if (!calendars.length) {

      tableBody.innerHTML = `

<tr>

<td colspan="6" class="no-data">

<i class="ti ti-calendar-off"></i>

No calendars uploaded yet.

</td>

</tr>

`;

      return;
    }

    tableBody.innerHTML = "";

    calendars.forEach((calendar) => {

      const ext =
        (calendar.title || "")
        .split(".")
        .pop()
        .toUpperCase() || "PDF";

      const fileUrl =
        calendar.fileUrl || "";

      tableBody.innerHTML += `

<tr>

<td>

<div class="file-cell">

<div class="pdf-icon">

${ext}

</div>

<div class="file-meta">

<strong>

${calendar.title}

</strong>

</div>

</div>

</td>

<td>

${calendar.year || "-"}

</td>

<td>

<span class="type-badge">

${ext}

</span>

</td>

<td>

${calendar.fileSize || "-"}

</td>

<td>

${calendar.createdAt
? new Date(calendar.createdAt)
.toLocaleDateString("en-GB")
: "-"}

</td>

<td>

<div class="row-actions">

<button
class="btn-view"
onclick="viewFile('${fileUrl}')">

View

</button>

<a
href="${fileUrl}"
download="${calendar.title}">

<button class="btn-dl">

Download

</button>

</a>

<button
class="btn-del"
onclick="deleteCalendar('${calendar._id}')">

Delete

</button>

</div>

</td>

</tr>

`;

    });

  } catch (error) {

    console.error(error);

    tableBody.innerHTML = `

<tr>

<td colspan="6" class="no-data">

<i class="ti ti-alert-circle"></i>

Failed to load calendars.

</td>

</tr>

`;
  }

}

// ========================================
// VIEW FILE
// ========================================

function viewFile(fileUrl) {

  if (!fileUrl) {

    showToast(
      "File URL not found.",
      "error"
    );

    return;
  }

  let modal =
    document.createElement("div");

  modal.innerHTML = `

<div
style="
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:white;
z-index:9999;
">

<div
style="
padding:15px;
background:#fff;
box-shadow:0 2px 10px rgba(0,0,0,.1);
display:flex;
align-items:center;
justify-content:space-between;
">

<button
onclick="this.closest('div').parentElement.remove()"
style="
padding:10px 18px;
border:none;
background:#3b5faf;
color:white;
border-radius:8px;
cursor:pointer;
font-weight:600;
">

← Back

</button>

<a
href="${fileUrl}"
download
style="
padding:10px 18px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:600;
">

Download

</a>

</div>

<iframe
src="${fileUrl}"
style="
width:100%;
height:calc(100% - 70px);
border:none;
">
</iframe>

</div>

`;

  document.body.appendChild(modal);
}

// ========================================
// DELETE CALENDAR
// ========================================

async function deleteCalendar(id) {

  if (!confirm(
    "Are you sure you want to delete this calendar?"
  )) {
    return;
  }

  try {

    const response = await fetch(
      `${API_URL}/delete/${id}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.message || "Delete failed"
      );
    }

    showToast(
      "Calendar deleted successfully.",
      "success"
    );

    loadCalendars();

  } catch (error) {

    console.error(error);

    showToast(
      "Delete failed. Please try again.",
      "error"
    );
  }

}

// ========================================
// TOAST
// ========================================

function showToast(
  msg,
  type = "info"
) {

  const container =
    document.getElementById("toasts");

  if (!container) {

    alert(msg);

    return;
  }

  const icons = {

    success: "ti-circle-check",

    error: "ti-alert-circle",

    warning: "ti-alert-triangle",

    info: "ti-info-circle"
  };

  const colors = {

    success: "#22c55e",

    error: "#ef4444",

    warning: "#f59e0b",

    info: "#3b82f6"
  };

  const toast =
    document.createElement("div");

  toast.className = "toast";

  toast.style.cssText = `
display:flex;
align-items:center;
gap:10px;
background:#fff;
border:1px solid #e2e8f0;
border-left:4px solid ${colors[type]};
border-radius:10px;
padding:14px 18px;
box-shadow:0 4px 16px rgba(0,0,0,0.10);
font-family:'Sora',sans-serif;
font-size:13.5px;
color:#1e293b;
margin-bottom:10px;
`;

  toast.innerHTML = `

<i
class="ti ${icons[type]}"
style="
color:${colors[type]};
font-size:16px;
flex-shrink:0;
">
</i>

${msg}

`;

  container.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = "0";

    toast.style.transform =
      "translateX(30px)";

    toast.style.transition = "0.3s";

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3500);

}

// ========================================
// INITIAL LOAD
// ========================================

loadCalendars();
 // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  }