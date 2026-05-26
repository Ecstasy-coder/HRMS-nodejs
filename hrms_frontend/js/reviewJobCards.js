// const container =
//     document.getElementById(
//         "jobCards"
//     );

// let allJobs = [];

// let currentTab =
//     "Pending";

fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar').innerHTML = data;
    })
    .catch(error => {
        console.log("Sidebar Error:", error);
    });



// async function loadJobs() {

//     try {

//         const response =
//             await fetch(
//                 "http://localhost:5000/api/jobcards"
//             );

//         const result =
//             await response.json();

//         allJobs =
//             result.data || [];

//         filterJobs(
//             currentTab
//         );

//     } catch (error) {

//         console.log(
//             "Error Loading Jobs",
//             error
//         );

//     }

// }




// function displayJobs(jobs) {

//     container.innerHTML = "";

//     jobs.forEach((job) => {

//                 const initials = job.employeeName ?
//                     job.employeeName
//                     .split(" ")
//                     .map((word) => word[0])
//                     .join("")
//                     .toUpperCase() :
//                     "";

//                 container.innerHTML += `

//     <div class="card ${job.status.toLowerCase()}-card">

//       <div class="card-header">

//         <div class="employee-info">

//           <div class="profile-circle-card">
//             ${initials}
//           </div>

//           <div>

//             <div class="employee-name">
//               ${job.employeeName}
//             </div>

//             <div class="department">
//               ${job.department}
//             </div>

//             <div class="rating-badge">
//               ⭐ ${job.rating || 4.4}
//               avg (7 cards)
//             </div>

//           </div>

//         </div>

//         <div class="status-right">

//           <div class="status ${job.status.toLowerCase()}">
//             ${job.status}
//           </div>

//           <div class="job-date">
//             ${formatDate(job.date)}
//           </div>

//         </div>

//       </div>

//       <div class="job-grid">

//         <div>
//           <div class="section-title">
//             PROJECT
//           </div>

//           <div class="section-value">
//             ${job.projectName}
//           </div>
//         </div>

//         <div>
//           <div class="section-title">
//             HOURS
//           </div>

//           <div class="section-value">
//             ${job.hoursWorked}.0 hours
//           </div>
//         </div>

//       </div>

//       <div class="section-title">
//         WORK DESCRIPTION
//       </div>

//       <div class="description-box">
//         ${job.workDescription}
//       </div>

//       <div class="rating-section">

//         <div class="rating-title">
//           Rate this work:
//         </div>

//         <div class="rating-wrapper">

//           <div
//           class="star-rating"
//           data-id="${job._id}">

//             ${[1,2,3,4,5]
//             .map(num => `

//             <span
//             class="star
//             ${job.rating >= num
//               ? "selected"
//               : ""}"

//             data-value="${num}">
//               ★
//             </span>

//             `).join("")}

//           </div>

//           <span
//           class="rating-text"
//           id="rating-text-${job._id}">

//           ${job.rating
//             ? getRatingText(job.rating)
//             : "Required to approve"}

//           </span>

//         </div>

//         <div
//         id="rating-error-${job._id}"
//         class="rating-error">

//         </div>

//         <input
//         type="hidden"
//         id="rating-${job._id}"
//         value="${job.rating || 0}">

//       </div>

//       <div class="comment-label">
//         Comment
//         <span>(optional)</span>
//       </div>

//       <textarea
//       class="comment-box"
//       id="comment-${job._id}"
//       placeholder=
//       "Add feedback or reason for rejection...">${job.managerComment || ""}</textarea>

//       <div class="actions">

//         <button
//         class="approve-btn"
//         onclick="approveJob('${job._id}')">

//           ✓ Approve & Rate

//         </button>

//         <button
//         class="reject-btn"
//         onclick="rejectJob('${job._id}')">

//           ✕ Reject

//         </button>

//       </div>

//     </div>

//     `;
//   });
// }




// function filterJobs(status) {

//   currentTab =
//   status;

//   document
//   .querySelectorAll(
//     ".tabs button"
//   )
//   .forEach(btn => {

//     btn.classList.remove(
//       "active-tab"
//     );

//     if(
//       btn.innerText.trim() ===
//       status
//     ){
//       btn.classList.add(
//         "active-tab"
//       );
//     }

//   });

//   let filteredJobs;

//   if(status === "All") {

//     filteredJobs =
//     allJobs;

//   }

//   else {

//     filteredJobs =
//     allJobs.filter(job =>

//       (job.status || "Pending")
//       === status

//     );

//   }

//   if(filteredJobs.length === 0) {

//     container.innerHTML = `

//       <div class="empty-card">

//         <h2>
//           No job cards found
//         </h2>

//         <p>
//           No
//           ${status.toLowerCase()}
//           job cards from employees.
//         </p>

//       </div>

//     `;

//     return;
//   }

//   displayJobs(
//     filteredJobs
//   );
// }




// async function approveJob(id) {

//   const rating =
//   document.getElementById(
//     `rating-${id}`
//   ).value;

//   const comment =
//   document.getElementById(
//     `comment-${id}`
//   ).value;

//   const errorDiv =
//   document.getElementById(
//     `rating-error-${id}`
//   );

//   errorDiv.innerHTML = "";

//   if(Number(rating) === 0) {

//     errorDiv.innerHTML =`
//    <div class="rating-warning">
// ⚠ Please give a rating before approving.
// </div>
// `;
//     return;
//   }

//   try {

//     await fetch(

//       `http://localhost:5000/api/jobcards/${id}`,

//       {
//         method: "PUT",

//         headers: {
//           "Content-Type":
//           "application/json"
//         },

//         body:
//         JSON.stringify({

//           status:
//           "Approved",

//           rating:
//           Number(rating),

//           managerComment:
//           comment

//         })

//       }

//     );

//     await loadJobs();

//     filterJobs(
//       "Approved"
//     );

//   }

//   catch(error) {

//     console.log(error);

//   }

// }



// async function rejectJob(id) {

//   const rating =
//   document.getElementById(
//     `rating-${id}`
//   ).value;

//   const comment =
//   document.getElementById(
//     `comment-${id}`
//   ).value;

//   try {

//     await fetch(

//       `http://localhost:5000/api/jobcards/${id}`,

//       {

//         method: "PUT",

//         headers: {
//           "Content-Type":
//           "application/json"
//         },

//         body:
//         JSON.stringify({

//           status:
//           "Rejected",

//           rating:
//           Number(rating),

//           managerComment:
//           comment

//         })

//       }

//     );

//     await loadJobs();

//     filterJobs(
//       "Rejected"
//     );

//   }

//   catch(error) {

//     console.log(error);

//   }

// }




// document.addEventListener(
//   "mouseover",

//   function(e){

//     if(
//       e.target.classList
//       .contains("star")
//     ){

//       const star =
//       e.target;

//       const rating =
//       Number(
//         star.dataset.value
//       );

//       const wrapper =
//       star.parentElement;

//       const stars =
//       wrapper.querySelectorAll(
//         ".star"
//       );

//       stars.forEach(
//         (s,index)=>{

//           s.classList.toggle(
//             "active",
//             index < rating
//           );

//         }
//       );
//     }
//   }
// );


// document.addEventListener(
//   "click",

//   function(e){

//     if(
//       e.target.classList
//       .contains("star")
//     ){

//       const star =
//       e.target;

//       const rating =
//       Number(
//         star.dataset.value
//       );

//       const wrapper =
//       star.parentElement;

//       const jobId =
//       wrapper.dataset.id;

//       wrapper
//       .querySelectorAll(
//         ".star"
//       )
//       .forEach((s,index)=>{

//         s.classList.toggle(
//           "selected",
//           index < rating
//         );

//       });

//       document
//       .getElementById(
//         `rating-${jobId}`
//       ).value = rating;

//       document
//       .getElementById(
//         `rating-text-${jobId}`
//       ).innerText =
//       getRatingText(
//         rating
//       );
//     }
//   }
// );




// function getRatingText(rating){

//   const messages = {

//     1:"Poor",
//     2:"Fair",
//     3:"Good",
//     4:"Very Good",
//     5:"Excellent"

//   };

//   return messages[rating];
// }




// function formatDate(date){

//   return new Date(date)
//   .toLocaleDateString(
//     "en-GB",
//     {

//       weekday:"long",
//       day:"numeric",
//       month:"short",
//       year:"numeric"

//     }
//   );
// }
// window.onload =
// loadJobs;







const container = document.getElementById("jobCards");
let allJobs = [];
let currentTab = "Pending";

// ======================
// LOAD JOBS
// ======================

async function loadJobs() {
    try {
        const response = await fetch("http://localhost:5000/api/jobcards");
        const result = await response.json();
        allJobs = result.data || [];
        filterJobs(currentTab);
    } catch (error) {
        console.log("Error Loading Jobs", error);
    }
}

// ======================
// DISPLAY JOBS
// ======================

function displayJobs(jobs) {
    container.innerHTML = "";

    jobs.forEach((job) => {
                const initials =
                    job &&
                    job.employeeName ?
                    job.employeeName
                    .split(" ")
                    .map(function(word) {
                        return word.charAt(0);
                    })
                    .join("")
                    .toUpperCase() :
                    "";
                // Build rating stars for approved cards - YELLOW color
                let ratingStarsDisplay = "";
                let ratingNumberDisplay = "";
                if (job.status === "Approved" && job.rating > 0) {
                    const fullStars = "★".repeat(job.rating);
                    const emptyStars = "☆".repeat(5 - job.rating);
                    ratingStarsDisplay = `${fullStars}${emptyStars}`;
                    ratingNumberDisplay = `${job.rating}/5`;
                }

                let cardHtml = `
      <div class="card ${job.status.toLowerCase()}-card">
        <div class="card-header">
          <div class="employee-info">
            <div class="profile-circle-card">
              ${initials}
            </div>
            <div>
              <div class="employee-name">
                ${escapeHtml(job.employeeName)}
              </div>
              <div class="department">
                ${escapeHtml(job.department)}
              </div>
              <div class="rating-badge">
                ⭐ ${job.averageRating || 4.4} avg (${job.totalCards || 7} cards)
              </div>
            </div>
          </div>
          <div class="status-right">
            <div class="status ${job.status.toLowerCase()}">
              ${job.status}
            </div>
            ${job.status === "Approved" && job.rating > 0 ? `
              <div class="rating-chip">
                <span class="rating-stars-yellow">${ratingStarsDisplay}</span>
                <span class="rating-number">${ratingNumberDisplay}</span>
              </div>
            ` : ''}
            <div class="job-date">
              ${formatDateOnly(job.date)}
            </div>
          </div>
        </div>
        
        <div class="job-grid">
          <div class="project-section">
            <div class="section-title">PROJECT</div>
            <div class="section-value">${escapeHtml(job.projectName)}</div>
          </div>
          <div class="hours-section">
            <div class="section-title">HOURS</div>
            <div class="section-value hours-value">${job.hoursWorked}.0 hours</div>
          </div>
        </div>
        
        <div class="section-title">WORK DESCRIPTION</div>
        <div class="description-box">${escapeHtml(job.workDescription)}</div>
    `;

    // For PENDING cards
    if (job.status === "Pending") {
      cardHtml += `
        <div class="rating-section">
          <div class="rating-title">Rate this work:</div>
          <div class="rating-wrapper">
            <div class="star-rating" data-id="${job._id}">
              ${[1, 2, 3, 4, 5].map(num => `
                <span class="star" data-value="${num}" data-card-id="${job._id}">★</span>
              `).join("")}
            </div>
            <span class="rating-text" id="rating-text-${job._id}">Required to approve</span>
          </div>
          <div id="rating-error-${job._id}" class="rating-error"></div>
          <input type="hidden" id="rating-${job._id}" value="0">
        </div>
        
        <div class="comment-label">Comment <span>(optional)</span></div>
        <textarea class="comment-box" id="comment-${job._id}" placeholder="Add feedback or reason for rejection...">${escapeHtml(job.managerComment || "")}</textarea>
        
        <div class="actions">
          <button class="approve-btn" onclick="approveJob('${job._id}')">✓ Approve & Rate</button>
          <button class="reject-btn" onclick="rejectJob('${job._id}')">✕ Reject</button>
        </div>
      `;
    } 
    // For APPROVED or REJECTED cards
    else {
      cardHtml += `<div class="reviewed-section">`;
      
      if (job.managerComment && job.managerComment.trim() !== "") {
        cardHtml += `
          <div class="manager-comment-box">
            <div class="comment-heading">Your Previous Comment</div>
            <div class="comment-text">${escapeHtml(job.managerComment)}</div>
          </div>
        `;
      }
      
      cardHtml += `
          <div class="review-date-box">
            <span class="review-label">Reviewed on</span>
            <span class="review-date">${formatDateTime(job.updatedAt || job.createdAt)}</span>
          </div>
        </div>
      `;
    }

    cardHtml += `</div>`;
    container.innerHTML += cardHtml;
  });
}

// ======================
// ESCAPE HTML
// ======================

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ======================
// FILTER JOBS
// ======================

function filterJobs(status) {
  currentTab = status;
  
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.classList.remove("active-tab");
    if (btn.innerText.trim() === status) {
      btn.classList.add("active-tab");
    }
  });
  
  let filteredJobs;
  
  if (status === "All") {
    filteredJobs = allJobs;
  } else {
    filteredJobs = allJobs.filter(job => {
      const jobStatus = job.status || "Pending";
      return jobStatus === status;
    });
  }
  
  if (filteredJobs.length === 0) {
    container.innerHTML = `
      <div class="empty-card">
        <h2>No job cards found</h2>
        <p>No ${status.toLowerCase()} job cards from employees.</p>
      </div>
    `;
    return;
  }
  
  displayJobs(filteredJobs);
}

// ======================
// APPROVE JOB
// ======================

async function approveJob(id) {
    const rating = document.getElementById(`rating-${id}`).value;
    const comment = document.getElementById(`comment-${id}`).value;
    const errorDiv = document.getElementById(`rating-error-${id}`);

    errorDiv.innerHTML = "";

    if (Number(rating) === 0) {
        errorDiv.innerHTML = `
            <div class="rating-warning">⚠ Please give a rating before approving.</div>
        `;
        return;
    }

    const approveBtn = document.querySelector(
        `.approve-btn[onclick="approveJob('${id}')"]`
    );

    const originalText = approveBtn.innerText;
    approveBtn.innerText = "Processing...";
    approveBtn.disabled = true;

    try {
        const response = await fetch(`http://localhost:5000/api/jobcards/${id}/approve`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                managerComment: comment,
                rating: Number(rating)
            })
        });

        const result = await response.json();

        console.log("APPROVE RESPONSE:", result);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Approval failed");
        }

        alert("✅ Job card approved successfully!");
        await loadJobs();
        filterJobs("Approved");

    } catch (error) {
        console.error("APPROVE ERROR:", error);
        alert("Error approving job card: " + error.message);

        approveBtn.innerText = originalText;
        approveBtn.disabled = false;
    }
}
// ======================
// REJECT JOB
// ======================

async function rejectJob(id) {
  const comment = document.getElementById(`comment-${id}`).value;
  
  if (!comment.trim()) {
    alert("Please provide a reason for rejection");
    return;
  }
  
  const rejectBtn = event.target;
  const originalText = rejectBtn.textContent;
  rejectBtn.textContent = "Processing...";
  rejectBtn.disabled = true;
  
  try {
    const response = await fetch(`http://localhost:5000/api/jobcards/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerComment: comment })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      alert("❌ Job card rejected successfully!");
      await loadJobs();
      filterJobs("Rejected");
    } else {
      alert("Failed to reject: " + (result.message || "Unknown error"));
      rejectBtn.textContent = originalText;
      rejectBtn.disabled = false;
    }
  } catch (error) {
    console.log(error);
    alert("Error rejecting job card");
    rejectBtn.textContent = originalText;
    rejectBtn.disabled = false;
  }
}

// ======================
// STAR RATING - MOUSEOVER
// ======================

document.addEventListener("mouseover", function(e) {
  if (e.target.classList && e.target.classList.contains("star")) {
    const star = e.target;
    const rating = Number(star.dataset.value);
    const wrapper = star.parentElement;
    const stars = wrapper.querySelectorAll(".star");
    stars.forEach((s, index) => {
      if (index < rating) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  }
});

// ======================
// STAR RATING - MOUSEOUT
// ======================

document.addEventListener("mouseout", function(e) {
  if (e.target.classList && e.target.classList.contains("star")) {
    const wrapper = e.target.parentElement;
    const stars = wrapper.querySelectorAll(".star");
    stars.forEach((s) => {
      s.classList.remove("active");
    });
  }
});

// ======================
// STAR RATING - CLICK
// ======================

document.addEventListener("click", function(e) {
  if (e.target.classList && e.target.classList.contains("star")) {
    const star = e.target;
    const rating = Number(star.dataset.value);
    const wrapper = star.parentElement;
    const cardId = star.getAttribute("data-card-id");
    
    wrapper.querySelectorAll(".star").forEach((s, index) => {
      if (index < rating) {
        s.classList.add("selected");
        s.style.color = "#f59e0b";
      } else {
        s.classList.remove("selected");
        s.style.color = "#d1d5db";
      }
    });
    
    document.getElementById(`rating-${cardId}`).value = rating;
    document.getElementById(`rating-text-${cardId}`).innerText = getRatingText(rating);
    
    const errorDiv = document.getElementById(`rating-error-${cardId}`);
    if (errorDiv) errorDiv.innerHTML = "";
  }
});

// ======================
// RATING TEXT
// ======================

function getRatingText(rating) {
  const messages = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };
  return messages[rating] || "Required to approve";
}

// ======================
// DATE FORMAT - ONLY DAY, MONTH, YEAR
// ======================

function formatDateOnly(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ======================
// DATE TIME FORMAT - FOR REVIEWED ON
// ======================

function formatDateTime(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) + " " + d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ======================
// LOAD PAGE
// ======================

window.onload = loadJobs;