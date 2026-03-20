const API = "https://localhost:7192"

const token = localStorage.getItem("token")
const role = localStorage.getItem("role")

if (!token || role !== "Manager") {

    document.getElementById("unauthorizedScreen").style.display = "flex"

    setTimeout(() => {
        localStorage.clear()
        window.location.href = "login.html"
    }, 2500)

    throw new Error("Unauthorized")

}


/* LOAD MANAGER */

function loadManager() {

    const user = JSON.parse(localStorage.getItem("user"))

    if (!user) return

    document.getElementById("mName").innerText = user.name || ""
    document.getElementById("mEmail").innerText = user.email || ""
    document.getElementById("mPhone").innerText = user.phone || ""
    document.getElementById("mType").innerText = user.managerType || ""

}

function fillManagerEdit() {

    const user = JSON.parse(localStorage.getItem("user")) || {}

    document.getElementById("editName").value = user.name || ""
    document.getElementById("editEmail").value = user.email || ""
    document.getElementById("editPhone").value = user.phone ? user.phone : ""

}

/* PASSWORD VALIDATION */

function checkPasswordStrength() {

    const password = document.getElementById("epassword").value
    const error = document.getElementById("passwordError")

    const strongPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

    if (password === "") {
        error.style.display = "none"
        return
    }

    if (!strongPattern.test(password)) {
        error.style.display = "block"
    } else {
        error.style.display = "none"
    }

}

function updateStatusButton(isActive) {

    const btn = document.getElementById("statusBtn")

    if (isActive) {

        btn.innerText = "Active"
        btn.classList.remove("btn-danger")
        btn.classList.add("btn-warning")

    }
    else {

        btn.innerText = "Inactive"
        btn.classList.remove("btn-warning")
        btn.classList.add("btn-danger")

    }

}

async function updateManager() {
    const user = JSON.parse(localStorage.getItem("user"));

    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const phone = document.getElementById("editPhone").value.trim();

    // 🔹 Validate required fields
    if (!name || !email || !phone) {
        alert("Please fill all fields, including phone.");
        return;
    }

    // 🔹 Optional: Validate phone format (10 digits)
    if (phone.length !== 10) {
        return; // silently block
    }

    try {
        const res = await fetch(API + "/api/managers/" + user.id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                id: user.id,                  // include ID
                name: name,
                email: email,
                phone: phone,
                role: user.role,              // keep role
                managerType: user.managerType // keep managerType
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            alert("Update failed: " + errorText);
            return;
        }

        // Update localStorage
        user.name = name;
        user.email = email;
        user.phone = phone;
        localStorage.setItem("user", JSON.stringify(user));

        loadManager();
        alert("Manager updated successfully");
    } catch (err) {
        console.error(err);
        alert("An error occurred while updating manager.");
    }
}


/* LOAD TYPES */

function loadTypes() {

    const category = document.getElementById("category").value
    const typeDropdown = document.getElementById("etype")

    let options = ""

    if (category === "IT") {

        options = `
<option value="">Employee Type</option>
<option value="Developer">Developer</option>
<option value="QA">QA</option>
<option value="DevOps">DevOps</option>
`

    }

    else if (category === "NonIT") {

        options = `
<option value="">Employee Type</option>
<option value="HR Services">HR Services</option>
<option value="Finance">Finance</option>
<option value="Sales">Sales</option>
`

    }

    typeDropdown.innerHTML = options

}


/* EMPLOYEE CRUD */

let employeeId = null
let employees = []
let selectedRequirementId = null;

async function saveEmployee() {

    const name = document.getElementById("ename").value.trim()
    const email = document.getElementById("eemail").value.trim()
    const password = document.getElementById("epassword").value.trim()
    const phone = document.getElementById("ephone").value.trim()
    const pob = document.getElementById("epob").value.trim();
    const type = document.getElementById("etype").value



    if (!name || !email || !password || !phone || !pob || !type) {

        alert("Please fill all fields")
        return

    }

    if (phone.length !== 10) {
        return; // silently block
    }



    let emp = {};

    if (employeeId == null) {
        // 👉 ADD MODE
        emp = {
            name: name,
            email: email,
            password: password,
            phone: phone,
            placeOfBirth: pob,
            employeeType: type,
            role: "Employee"
        };
    } else {
        // 👉 EDIT MODE (NO PASSWORD)
        emp = {
            name: name,
            email: email,
            phone: phone,
            placeOfBirth: pob,
            employeeType: type,
            role: "Employee"
        };
    }

    let url = "/api/employees"
    let method = "POST"

    if (employeeId != null) {

        url = "/api/employees/" + employeeId
        method = "PUT"

    }

    const res = await fetch(API + url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(emp)
    })

    if (!res.ok) {
        const err = await res.text();
        alert("Failed to save employee: " + err);
        return;
    }

    employeeId = null

    document.getElementById("ename").value = "";
    document.getElementById("eemail").value = "";
    document.getElementById("epassword").value = "";
    document.getElementById("ephone").value = "";
    document.getElementById("epob").value = "";
    document.getElementById("etype").value = "";
    document.getElementById("passwordFieldContainer").style.display = "block";


    loadEmployees()

}

async function loadRequirements() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.managerType) {
        console.error("Manager type missing in localStorage user object");
        return; // prevent API call with undefined
    }

    const managerType = user.managerType;

    const res = await fetch(API + "/api/customerrequirements/assigned", {
        headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
        console.error("Failed to fetch requirements:", res.status);
        return;
    }

    const data = await res.json();
    let html = "";

    data.forEach(r => {
        html += `
<tr>
<td>${r.id}</td>
<td>${r.customerId}</td>
<td>${r.title}</td>
<td>${r.description}</td>
<td>${r.category}</td>

<td>${r.assignedTo || "Not Assigned"}</td>

<td>
<button class="btn btn-sm ${r.status === 'Completed' ? 'btn-success' : 'btn-warning'}"
    onclick="toggleStatus(${r.id}, '${r.status}')">
    ${r.status}
</button>
</td>

<td>
<button class="btn btn-sm btn-primary"
    ${r.isAssigned ? "disabled" : ""}
    onclick="openAssignModal(${r.id}, '${r.category}')">
    ${r.isAssigned ? "Assigned" : "Assign"}
</button>
</td>
</tr>
`;
    });

    document.getElementById("requirementsTable").innerHTML = html;
}

async function toggleStatus(id, currentStatus) {

    let newStatus = currentStatus === "Completed"
        ? "Assigned"
        : "Completed"

    const res = await fetch(API + "/api/Customerrequirements/status/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify({
            status: newStatus
        })

    })

    if (!res.ok) {

        alert("Failed to update status")
        return

    }

    loadRequirements()

}

async function pushRequirement(reqId) {

    const res = await fetch(API + "/api/customerrequirements/push-to-employees/" + reqId, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!res.ok) {
        alert("Push failed");
        return;
    }

    const data = await res.json();
    alert(data.message);
}

function openAssignModal(reqId, category) {

    selectedRequirementId = reqId;

    const dropdown = document.getElementById("employeeSelect");

    // 🔹 Filter employees by category
    let filtered = employees.filter(e => {
        if (category === "IT") {
            return ["Developer", "QA", "DevOps"].includes(e.employeeType);
        } else {
            return ["HR Services", "Finance", "Sales"].includes(e.employeeType);
        }
    });

    dropdown.innerHTML = filtered.map(e =>
        `<option value="${e.id}">${e.name} (${e.employeeType})</option>`
    ).join("");

    const modal = new bootstrap.Modal(document.getElementById('assignEmployeeModal'));
    modal.show();
}

async function confirmAssign() {

    const empId = document.getElementById("employeeSelect").value;

    const res = await fetch(API + "/api/customerrequirements/assign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            requirementId: selectedRequirementId,
            employeeId: parseInt(empId)
        })
    });

    if (!res.ok) {
        const err = await res.text();
        alert(err);
        return;
    }

    alert("Assigned successfully");

    bootstrap.Modal.getInstance(document.getElementById('assignEmployeeModal')).hide();

    loadRequirements();
}

/* LOAD EMPLOYEES */

async function loadEmployees() {
    if (!token) {
        console.error("No JWT token, cannot load employees");
        return;
    }

    const res = await fetch(API + "/api/employees", {
        headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
        console.error("Failed to fetch employees:", res.status);
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const managerType = user.managerType;

    let allEmployees = await res.json();

    // ✅ FILTER BASED ON MANAGER TYPE
    if (managerType === "IT") {
        employees = allEmployees.filter(e =>
            e.employeeType === "Developer" ||
            e.employeeType === "QA" ||
            e.employeeType === "DevOps"
        );
    }
    else if (managerType === "NonIT") {
        employees = allEmployees.filter(e =>
            e.employeeType === "HR Services" ||
            e.employeeType === "Finance" ||
            e.employeeType === "Sales"
        );
    }
    else {
        employees = allEmployees; // fallback
    }

    renderTable(employees);
   // updateStats();
}


/* UPDATE STATS */
/*
function updateStats() {

    document.getElementById("totalEmployees").innerText = employees.length

    let it = employees.filter(e =>
        e.employeeType === "Developer" ||
        e.employeeType === "QA" ||
        e.employeeType === "DevOps"
    ).length

    let nonit = employees.filter(e =>
        e.employeeType === "HR Services" ||
        e.employeeType === "Finance" ||
        e.employeeType === "Sales"
    ).length

    document.getElementById("itEmployees").innerText = it
    document.getElementById("nonItEmployees").innerText = nonit

}
*/


/* RENDER TABLE */

function renderTable(data) {

    let html = ""

    data.forEach(e => {

        html += `

<tr>

<td>${e.name}</td>
<td>${e.email}</td>
<td>${e.phone}</td>
<td>${e.placeOfBirth}</td>
<td>${e.employeeType}</td>
<td>${e.role}</td>

<td>

<button
class="btn btn-warning btn-sm me-1"
onclick="editEmployee(${e.id},'${e.name}','${e.email}','${e.password}','${e.phone}','${e.placeOfBirth}','${e.employeeType}')">

<i class="bi bi-pencil"></i>

</button>

<button
class="btn btn-danger btn-sm"
onclick="deleteEmployee(${e.id})">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`

    })

    document.getElementById("employeesTable").innerHTML = html

}


/* EDIT */

function editEmployee(id, name, email, password, phone, pob, type) {

    document.getElementById("ename").value = name;
    document.getElementById("eemail").value = email;
    document.getElementById("epassword").value = password;
    document.getElementById("ephone").value = phone;
    document.getElementById("epob").value = pob;
    document.getElementById("etype").value = type;
    document.getElementById("passwordFieldContainer").style.display = "none";


    employeeId = id

}


/* DELETE */

async function deleteEmployee(id) {

    await fetch("/api/employees/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })

    loadEmployees()

}
async function toggleManagerStatus() {

    const user = JSON.parse(localStorage.getItem("user"))

    if (!user || !user.id) {

        alert("Manager ID not found")

        return

    }

    try {

        const res = await fetch(API + "/api/managers/status/" + user.id, {

            method: "PUT",

            headers: {

                "Authorization": "Bearer " + token

            }

        })

        if (!res.ok) {

            alert("Failed to update status")

            return

        }

        // flip status locally

        user.isActive = !user.isActive

        localStorage.setItem("user", JSON.stringify(user))

        updateStatusButton(user.isActive)

    }

    catch (error) {

        console.error(error)

        alert("Error updating status")

    }

}



/* FILTER */

function applyFilters() {

    let search = document.getElementById("searchInput").value.toLowerCase()
    let type = document.getElementById("filterType").value

    let filtered = employees.filter(e => {

        let matchSearch =
            e.name.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search)

        let matchType =
            !type || e.employeeType === type

        return matchSearch && matchType

    })

    renderTable(filtered)

}


function clearFilters() {

    document.getElementById("searchInput").value = ""
    document.getElementById("filterType").value = ""

    renderTable(employees)

}


/* LOGOUT */

function logout() {

    localStorage.clear()
    window.location.href = "login.html"

}

function loadUpdates() {

    fetch("https://localhost:7192/api/projectupdates")
        .then(res => res.json())
        .then(data => {

            let table = document.getElementById("updatesTable");
            table.innerHTML = "";

            data.forEach(u => {

                table.innerHTML += `
<tr>
<td>${u.employeeId}</td>
<td>${u.employeeName}</td>
<td>${u.projectName}</td>
<td>${u.updateText}</td>
<td>${new Date(u.createdAt).toLocaleString()}</td>

<td>${u.feedback ?? ""}</td>

<td>
<button class="btn btn-sm btn-primary"
onclick="sendFeedback(${u.id})">
Give Feedback
</button>
</td>

</tr>
`;

            });

        });
}
loadUpdates();

function sendFeedback(updateId) {

    const feedback = prompt("Enter feedback for employee:");

    if (!feedback) return;

    fetch("https://localhost:7192/api/projectupdates/feedback/" + updateId, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(feedback)

    })
        .then(res => res.json())
        .then(() => {

            alert("Feedback sent");
            loadUpdates();

        });

}


/* INIT */

loadManager();
loadEmployees();

loadRequirements();
