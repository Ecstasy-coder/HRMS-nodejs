const API_URL = "http://localhost:5000/api/profile";


async function loadProfile() {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log("PROFILE DATA:", data);

        if (!data.success) {
            alert(data.message || "Failed to load profile");
            return;
        }

        const user = data.user;

        // ==========================
        // LEFT CARD
        // ==========================

        document.getElementById("userNameDisplay").textContent =
            user.name || "Manager";

        document.getElementById("designationDisplay").textContent =
            user.designation || "Manager";

        document.getElementById("profileEmail").textContent =
            user.email || "-";

        document.getElementById("profileDept").textContent =
            user.department || "-";

        document.getElementById("profilePhone").textContent =
            user.phoneNumber || "-";

        // DATE OF BIRTH
        const dob = user.dateOfBirth ?
            new Date(user.dateOfBirth).toLocaleDateString() :
            "-";

        document.getElementById("profileBirth").textContent = dob;

        // JOIN DATE
        const joining = user.dateOfJoining ?
            new Date(user.dateOfJoining).toLocaleDateString() :
            "-";

        document.getElementById("profileJoin").textContent = joining;

        document.getElementById("profileStatus").textContent = "Active";

        // ==========================
        // PROFILE INITIALS
        // ==========================

        const initials = (user.name || "M")
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        document.getElementById("profileInitial").textContent = initials;

        // ==========================
        // FORM FIELDS
        // ==========================

        document.getElementById("fullNameInput").value =
            user.name || "";

        document.getElementById("designationInput").value =
            user.designation || "";

        document.getElementById("phoneInput").value =
            user.phoneNumber || "";

        document.getElementById("emailInput").value =
            user.email || "";

        document.getElementById("deptInput").value =
            user.department || "";

        // READ ONLY FIELDS
        document.getElementById("emailInput").readOnly = true;
        document.getElementById("deptInput").readOnly = true;

    } catch (error) {

        console.log("PROFILE LOAD ERROR:", error);

        alert("Failed to load profile");

    }
}

// ==========================
// UPDATE PROFILE
// ==========================
async function updateProfile() {

    try {

        const token = localStorage.getItem("token");

        const bodyData = {
            fullName: document.getElementById("fullNameInput").value,

            designation: document.getElementById("designationInput").value,

            phoneNumber: document.getElementById("phoneInput").value
        };

        const response = await fetch(API_URL, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        console.log("UPDATE RESPONSE:", data);

        if (data.success) {

            alert("Profile updated successfully");

            loadProfile();

        } else {

            alert(data.message || "Update failed");

        }

    } catch (error) {

        console.log("UPDATE ERROR:", error);

        alert("Profile update failed");

    }
}

// ==========================
// BUTTON EVENT
// ==========================
document
    .getElementById("saveBtn")
    .addEventListener("click", updateProfile);

// ==========================
// INITIAL LOAD
// ==========================
loadProfile();

const CHANGE_PASSWORD_API =
    "http://localhost:5000/api/profile/change-password";

async function changeManagerPassword() {
    try {
        const token = localStorage.getItem("token");

        const currentPassword =
            document.getElementById("currentPass").value.trim();

        const newPassword =
            document.getElementById("newPass").value.trim();

        const confirmPassword =
            document.getElementById("confirmPass").value.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match");
            return;
        }

        const response = await fetch(CHANGE_PASSWORD_API, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Password updated successfully");

            document.getElementById("currentPass").value = "";
            document.getElementById("newPass").value = "";
            document.getElementById("confirmPass").value = "";
        } else {
            alert(data.message || "Password update failed");
        }

    } catch (error) {
        console.log("CHANGE PASSWORD ERROR:", error);
        alert("Password update failed");
    }
}

document
    .getElementById("changePasswordBtn")
    .addEventListener("click", changeManagerPassword);