const API_URL = "http://localhost:5000/api/holiday-calendar";

const uploadBtn  = document.getElementById("uploadBtn");
const tableBody  = document.getElementById("calendarTableBody");
const countBadge = document.getElementById("calendarCount");

// ========================================
// UPLOAD CALENDAR
// ========================================

uploadBtn.addEventListener("click", async () => {

  const year = document.getElementById("calendarYear").value;
  const file = document.getElementById("calendarFile").files[0];

  if (!file) {
    showToast("Please select a file first.", "warning");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<i class="ti ti-loader-2 spin"></i> Uploading…';

  const formData = new FormData();
  formData.append("year", year);
  formData.append("calendar", file);
 

  try {

    await axios.post(`${API_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    showToast("Calendar uploaded successfully.", "success");

    // Reset file input & name display
    document.getElementById("calendarFile").value = "";
    const sfn = document.getElementById("selectedFileName");
    if (sfn) sfn.classList.remove("visible");

    loadCalendars();

  } catch (error) {
    console.error(error);
    showToast("Upload failed. Please try again.", "error");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<i class="ti ti-upload"></i> Upload Calendar';
  }

});

// ========================================
// LOAD CALENDARS
// ========================================

async function loadCalendars() {

  try {

    const response  = await axios.get(`${API_URL}/all`);
    const calendars = response.data.data;

    // Update badge
    if (countBadge) {
      countBadge.textContent = `${calendars.length} file${calendars.length !== 1 ? "s" : ""}`;
    }

    if (!calendars.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">
            <i class="ti ti-calendar-off"></i>
            No calendars uploaded yet.
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = "";

    calendars.forEach((calendar) => {

      const ext = (calendar.title || "").split(".").pop().toUpperCase() || "PDF";

      tableBody.innerHTML += `
<tr>
  <td>
    <div class="file-cell">
      <div class="pdf-icon">${ext}</div>
      <div class="file-meta">
        <strong>${calendar.title}</strong>
      </div>
    </div>
  </td>
  <td>${calendar.year}</td>
  <td><span class="type-badge">${ext}</span></td>
  <td>${calendar.fileSize}</td>
  <td>${new Date(calendar.createdAt).toLocaleDateString("en-GB")}</td>
  <td>
    <div class="row-actions">
     <button 
class="btn-view"
onclick="viewFile('http://localhost:5000${calendar.filePath}')">

View

</button>
      <a href="http://localhost:5000${calendar.filePath}" download>
        <button class="btn-dl">Download</button>
      </a>
      <button class="btn-del" onclick="deleteCalendar('${calendar._id}')">Delete</button>
    </div>
  </td>
</tr>`;

    });

  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">
          <i class="ti ti-alert-circle"></i>
          Failed to load calendars.
        </td>
      </tr>`;
  }

}

// ========================================
// DELETE CALENDAR
// ========================================

async function deleteCalendar(id) {

  if (!confirm("Are you sure you want to delete this calendar?")) return;

  try {

    await axios.delete(`${API_URL}/delete/${id}`);
    showToast("Calendar deleted successfully.", "success");
    loadCalendars();

  } catch (error) {
    console.error(error);
    showToast("Delete failed. Please try again.", "error");
  }

}

// ========================================
// TOAST HELPER
// (uses portal toast system if present,
//  falls back to native alert)
// ========================================

function showToast(msg, type = "info") {
  const container = document.getElementById("toasts");
  if (!container) { alert(msg); return; }

  const icons = { success: "ti-circle-check", error: "ti-alert-circle", warning: "ti-alert-triangle", info: "ti-info-circle" };
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.cssText = `
    display:flex;align-items:center;gap:10px;
    background:#fff;border:1px solid #e2e8f0;
    border-left:4px solid ${colors[type]};
    border-radius:10px;padding:14px 18px;
    box-shadow:0 4px 16px rgba(0,0,0,0.10);
    font-family:'Sora',sans-serif;font-size:13.5px;color:#1e293b;
    margin-bottom:10px;
    animation:toast-in 0.3s cubic-bezier(0.16,1,0.3,1) both;
  `;
  toast.innerHTML = `<i class="ti ${icons[type]}" style="color:${colors[type]};font-size:16px;flex-shrink:0"></i>${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(30px)";
    toast.style.transition = "0.3s";
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}



// ========================================
// INITIAL LOAD
// ========================================

loadCalendars();

function viewFile(fileUrl){

let modal=document.createElement("div");

modal.innerHTML=`

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
">

← Back

</button>

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