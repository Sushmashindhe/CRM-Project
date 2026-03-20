let editManagerId = null;
let managers = [];
let selectedRequirementId = null;

const API = "https://localhost:7192";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

/* ================= AUTH CHECK ================= */

if (!token || role !== "SeniorManager") {

    document.getElementById("unauthorizedScreen").style.display = "flex";

    setTimeout(() => {
        localStorage.clear();
        window.location.href = "login.html";
    }, 2500);

    throw new Error("Unauthorized");
}

/* ================= LOAD REQUIREMENTS ================= */

async function loadRequirements() {

    try {
        const res = await fetch(API + "/api/customerrequirements", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch requirements:", res.status);
            return;
        }

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

<button class="btn btn-success btn-sm me-1"
onclick="openAssignPopup(${r.id})"
${r.status !== 'Pending' ? 'disabled' : ''}>
Assign
</button>

<button class="btn btn-danger btn-sm"
onclick="deleteRequirement(${r.id})"
${r.status !== 'Pending' ? 'disabled' : ''}>
Reject
</button>

</td>
</tr>`;
        });

        document.getElementById("requirementsTable").innerHTML = html;

    } catch (err) {
        console.error(err);
    }
}

/* ================= DELETE REQUIREMENT ================= */

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

/* ================= LOAD MANAGERS ================= */

async function loadManagers() {

    try {
        const res = await fetch(API + "/api/managers", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            showToast("Failed to load managers", "error");
            return;
        }

        managers = await res.json();

        renderTable(managers);
        updateStats();

    } catch {
        showToast("Failed to load managers", "error");
    }
}

/* ================= RENDER MANAGERS ================= */

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
'${m.phone ?? ''}')">
<i class="bi bi-pencil"></i>
</button>

<button class="btn btn-danger btn-sm"
onclick="deleteManager(${m.id})">
<i class="bi bi-trash"></i>
</button>
</td>
</tr>`;
    });

    document.getElementById("managersTable").innerHTML = html;
}

/* ================= STATS ================= */

function updateStats() {

    document.getElementById("totalManagers").innerText = managers.length;

    let it = managers.filter(m => m.managerType === "IT Manager").length;
    let nonit = managers.filter(m => m.managerType === "Non IT Manager").length;

    document.getElementById("itManagers").innerText = it;
    document.getElementById("nonItManagers").innerText = nonit;
}

/* ================= ASSIGN POPUP ================= */

async function openAssignPopup(reqId) {

    selectedRequirementId = reqId;

    if (managers.length === 0) {
        await loadManagers();
    }

    let dropdown = document.getElementById("assignManagerSelect");
    dropdown.innerHTML = "";

    managers.forEach(m => {
        dropdown.innerHTML += `
<option value="${m.id}">
${m.name} (${m.managerType})
</option>`;
    });

    document.getElementById("assignPopup").style.display = "flex";
}

function closeAssignPopup() {
    document.getElementById("assignPopup").style.display = "none";
}

/* ================= ASSIGN TO MANAGER ================= */

async function assignToManager() {

    const managerId = document.getElementById("assignManagerSelect").value;

    if (!managerId) {
        showToast("Select a manager", "error");
        return;
    }

    const res = await fetch(API + "/api/customerrequirements/assign", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            requirementId: selectedRequirementId,
            managerId: managerId
        })
    });

    if (res.ok) {

        showToast("Assigned successfully");

        const row = document.getElementById("req-" + selectedRequirementId);
        const btn = row.querySelector(".btn-success");

        btn.disabled = true;
        btn.innerText = "Assigned";

        closeAssignPopup();
        loadRequirements();

    } else {
        showToast("Assignment failed", "error");
    }
}

/* ================= DELETE MANAGER ================= */

async function deleteManager(id) {

    if (!confirm("Delete manager?")) return;

    const res = await fetch(API + "/api/managers/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (res.ok) {
        showToast("Manager deleted");
        loadManagers();
    } else {
        showToast("Delete failed", "error");
    }
}

/* ================= TOAST ================= */

function showToast(message, type = "success") {

    const toastElement = document.getElementById("liveToast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.innerText = message;

    toastElement.className = "toast align-items-center border-0";

    if (type === "success")
        toastElement.classList.add("text-bg-success");
    else
        toastElement.classList.add("text-bg-danger");

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

/* ================= LOGOUT ================= */

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ================= INIT ================= */

loadManagers();
loadRequirements();