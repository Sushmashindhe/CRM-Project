
let editManagerId = null
let managers = []

const API = "https://localhost:7192"

const token = localStorage.getItem("token")
const role = localStorage.getItem("role")



/* AUTH CHECK */

if (!token || role !== "SeniorManager") {

    document.getElementById("unauthorizedScreen").style.display = "flex"

    setTimeout(() => {
        localStorage.clear()
        window.location.href = "login.html"
    }, 2500)

    throw new Error("Unauthorized")

}



async function loadRequirements() {

    const res = await fetch(API + "/api/customerrequirements", {
        headers: {
            "Authorization": "Bearer " + token
        }

    });

    const data = await res.json();

    let html = "";

    data.forEach(r => {

        html += `
<tr id="req-${r.id}">
<td>${r.id}</td>
<td>${r.customerId}</td>
<td>${r.title}</td>
<td>${r.description}</td>
<td>${r.category}</td>
<td>${r.status}</td>
<td>

<button id="push-btn-${r.id}"
class="btn btn-success btn-sm me-1"
onclick="pushRequirement(${r.id})">
Push
</button>

<button class="btn btn-danger btn-sm"
onclick="deleteRequirement(${r.id})">
Reject
</button>

</td>
</tr>
`;

    });

    document.getElementById("requirementsTable").innerHTML = html;

}

loadRequirements();

/* TOAST */

function showToast(message, type = "success") {

    const toastElement = document.getElementById("liveToast")
    const toastMessage = document.getElementById("toastMessage")

    toastMessage.innerText = message

    toastElement.className = "toast align-items-center border-0"

    if (type === "success")
        toastElement.classList.add("text-bg-success")

    else if (type === "error")
        toastElement.classList.add("text-bg-danger")

    const toast = new bootstrap.Toast(toastElement)

    toast.show()

}



/* LOAD MANAGERS */

async function loadManagers() {

    try {

        const res = await fetch(API + "/api/managers", {

            headers: {
                "Authorization": "Bearer " + token
            }

        })

        managers = await res.json()

        renderTable(managers)
        updateStats()

    } catch {

        showToast("Failed to load managers", "error")

    }

}



/* RENDER TABLE */
function renderTable(data) {
    let html = "";

    data.forEach(m => {
        let statusBadge = m.status === "Active"
            ? `<span class="badge bg-success">Active</span>`
            : `<span class="badge bg-danger">Inactive</span>`;

        html += `
<tr>
                    <td>${m.name}</td>
                    <td>${m.email}</td>
                    <td>${m.role}</td>
                    <td>${m.managerType}</td>
                    <td>${m.placeOfBirth ?? ""}</td>
                    <td>${m.phone ?? ""}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-1"
                            onclick="editManager(${m.id},'${m.name}','${m.email}',
                            '${m.managerType}','${m.placeOfBirth ?? ''}',
                            '${m.phone ?? ''}','${m.password ?? ''}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteManager(${m.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
</tr>
`;
    });

    document.getElementById("managersTable").innerHTML = html;
}



/* STATS */

function updateStats() {

    document.getElementById("totalManagers").innerText = managers.length

    let it = managers.filter(m => m.managerType === "IT Manager").length
    let nonit = managers.filter(m => m.managerType === "Non IT Manager").length

    document.getElementById("itManagers").innerText = it
    document.getElementById("nonItManagers").innerText = nonit

}

async function deleteRequirement(id) {

    if (!confirm("Reject this requirement?")) return;

    const res = await fetch(API + "/api/customerrequirements/requirement/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (res.ok) {

        document.getElementById("req-" + id).remove();

        showToast("Requirement rejected");

    } else {

        showToast("Failed to reject", "error");

    }

}

async function pushRequirement(id) {

    if (!confirm("Push this requirement to manager?")) return;

    const btn = document.getElementById("push-btn-" + id);

    // 🔒 Disable immediately to prevent double click
    if (btn) btn.disabled = true;

    const res = await fetch(API + "/api/customerrequirements/push/" + id, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (res.ok) {

        showToast("Requirement pushed to manager");

        // Optional: change button text
        if (btn) {
            btn.innerText = "Pushed";
            btn.classList.remove("btn-success");
            btn.classList.add("btn-secondary");
        }

        loadRequirements(); // refresh table

    } else {

        // ❌ If failed, re-enable button
        if (btn) btn.disabled = false;

        showToast("Push failed", "error");

    }
    loadRequirements();
}
/* FILTER */

function applyFilters() {

    let search = document.getElementById("searchInput").value.toLowerCase()
    let type = document.getElementById("filterType").value
    let status = document.getElementById("filterStatus").value

    let filtered = managers.filter(m => {

        let matchesSearch =
            m.name.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)

        let matchesType =
            !type || m.managerType === type

        let matchesStatus =
            !status || m.status === status

        return matchesSearch && matchesType && matchesStatus
    })

    renderTable(filtered)
}



/* CLEAR FILTER */

function clearFilters() {

    document.getElementById("searchInput").value = ""
    document.getElementById("filterType").value = ""

    renderTable(managers)

}



/* SAVE */

async function saveManager() {

    let manager = {}
    let url = API + "/api/managers"
    let method = "POST"

    // 👉 ADD MODE
    if (editManagerId === null) {

        const name = document.getElementById("mname").value.trim()
        const email = document.getElementById("memail").value.trim()
        const password = document.getElementById("mpassword").value.trim()
        const managerType = document.getElementById("mtype").value
        const placeOfBirth = document.getElementById("mpob").value.trim()
        const phone = document.getElementById("mphone").value.trim()

        // ✅ PASSWORD REGEX
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

        // ✅ PHONE REGEX (10 digits)
        const phoneRegex = /^[0-9]{10}$/


        if (!name || !email || !password || !managerType || !phone) {
            showToast("Please fill required fields", "error")
            return
        }

        if (!passwordRegex.test(password)) {
            showToast("Password must be 8+ chars with upper, lower, number & special char", "error")
            return
        }

        // 📱 PHONE VALIDATION
        if (!phoneRegex.test(phone)) {
            showToast("Phone must be exactly 10 digits", "error")
            return
        }

        manager = { name, email, password, managerType, placeOfBirth, phone }
    }

    // 👉 EDIT MODE
    else {

        const name = document.getElementById("edit_name").value.trim()
        const email = document.getElementById("edit_email").value.trim()
        const managerType = document.getElementById("edit_type").value
        const placeOfBirth = document.getElementById("edit_pob").value.trim()
        const phone = document.getElementById("edit_phone").value.trim()

        if (!name || !email || !managerType || !phone) {
            showToast("Please fill required fields", "error")
            return
        }

        manager = {
            Name: name,
            Email: email,
            ManagerType: managerType,
            PlaceOfBirth: placeOfBirth,
            Phone: phone
        }

        url = API + "/api/managers/" + editManagerId
        method = "PUT"
    }

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(manager)
    })

    if (!res.ok) {
        showToast("Operation failed", "error")
        return
    }

    showToast(editManagerId ? "Manager updated" : "Manager added")

    showToast(editManagerId ? "Manager updated" : "Manager added")

    // ✅ CLEAR FORM AFTER ADD
    clearForm()

    cancelEdit()   // switch back to add form
    loadManagers()
}



/* EDIT */

function editManager(id, name, email, type, placeOfBirth = "", phone = "") {
    editManagerId = id;

    // Hide Add form
    document.getElementById("addManagerCard").style.display = "none";

    // Show Edit form
    document.getElementById("editManagerCard").style.display = "block";

    // Fill values
    document.getElementById("edit_name").value = name;
    document.getElementById("edit_email").value = email;
    document.getElementById("edit_type").value = type;
    document.getElementById("edit_pob").value = placeOfBirth;
    document.getElementById("edit_phone").value = phone;

    document.getElementById("editManagerCard").scrollIntoView({ behavior: "smooth" });
}



/* CLEAR FORM */

function clearForm() {
    editManagerId = null;

    document.getElementById("mname").value = "";
    document.getElementById("memail").value = "";
    document.getElementById("mpassword").value = "";
    document.getElementById("mtype").value = "";
    document.getElementById("mpob").value = "";
    document.getElementById("mphone").value = "";

    // Show password field when adding new manager
    document.getElementById("passwordFieldContainer").style.display = "block";
}



/* DELETE */

async function deleteManager(id) {

    showToast("Deleting manager...")

    const res = await fetch(API + "/api/managers/" + id, {

        method: "DELETE",

        headers: {
            "Authorization": "Bearer " + token

        }

    })

    if (res.ok) {

        showToast("Manager deleted")
        loadManagers()

    } else {

        showToast("Delete failed", "error")

    }

}



function cancelEdit() {
    editManagerId = null;

    document.getElementById("editManagerCard").style.display = "none";
    document.getElementById("addManagerCard").style.display = "block";
}



/* LOGOUT */

function logout() {

    localStorage.clear()
    window.location.href = "login.html"

}



loadManagers()
