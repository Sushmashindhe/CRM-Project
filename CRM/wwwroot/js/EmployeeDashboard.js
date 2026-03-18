const API = "https://localhost:7192"

const token = localStorage.getItem("token")
const role = localStorage.getItem("role")

/* AUTH CHECK */

if (!token || role !== "Employee") {

    document.getElementById("unauthorizedScreen").style.display = "flex"

    setTimeout(() => {

        localStorage.clear()
        window.location.href = "login.html"

    }, 2500)

}


/* LOAD EMPLOYEE */

let employeeId = null

async function loadEmployee() {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data) return;

    // Fetch updated profile from API
    const res = await fetch(`https://localhost:7192/api/emp/profile/${data.id}`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const user = await res.json();

    employeeId = user.id; // lowercase

    document.getElementById("empName").innerText = user.name;  // lowercase
    document.getElementById("empEmail").innerText = user.email;
    document.getElementById("empType").innerText = user.employeeType;
    document.getElementById("empRole").innerText = localStorage.getItem("role");
    document.getElementById("empManagerId").innerText = user.managerName ?? "Not Assigned";
    document.getElementById("empPhone").innerText = user.phone ?? "Not Available";

    document.getElementById("ename").value = user.name;
    document.getElementById("eemail").value = user.email;

    // Save updated user to localStorage
    localStorage.setItem("user", JSON.stringify(user));
}

/* UPDATE EMPLOYEE */

async function updateEmployee() {

    const phone = ephone.value.trim()

    /* PHONE VALIDATION */

    const phonePattern = /^[0-9]{10}$/

    if (!phonePattern.test(phone)) {

        alert("Phone number must be exactly 10 digits")

        return

    }

    const emp = {

        name: ename.value,
        email: eemail.value,
        phone: phone,
        employeeType: document.getElementById("empType").innerText,
        role: "Employee"

    }

    const res = await fetch(API + "/api/emp/" + employeeId, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify(emp)

    })

    if (!res.ok) {

        const text = await res.text()
        alert(text)
        return

    }

    const updated = await res.json()

    localStorage.setItem("user", JSON.stringify(updated))

    alert("Details updated successfully")

    loadEmployee()

}


/* LOGOUT */

function logout() {

    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")

    window.location.href = "login.html"

}


/* INIT */

loadEmployee()

function sendUpdate() {

    const data = JSON.parse(localStorage.getItem("user"));
    const user = data.user ? data.user : data;

    if (!user) {
        alert("User not found. Please login again.");
        return;
    }

    const update = {
        employeeId: user.id,
        employeeName: user.name,
        projectName: document.getElementById("projectName").value,
        updateText: document.getElementById("updateText").value
    };

    fetch("https://localhost:7192/api/projectupdates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(update)
    })
        .then(res => {

            if (!res.ok) {
                return res.text().then(text => { throw new Error(text); });
            }

            return res.json();
        })
        .then(() => {

            alert("Update submitted successfully");

            document.getElementById("projectName").value = "";
            document.getElementById("updateText").value = "";

        })
        .catch(err => {
            console.error(err);
            alert("Error: " + err.message);
        });

}

function loadEmployeeUpdates() {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch("https://localhost:7192/api/projectupdates")
        .then(res => res.json())
        .then(data => {

            let table = document.getElementById("employeeUpdates");

            table.innerHTML = "";

            data
                .filter(u => u.employeeId === user.id)
                .forEach(u => {

                    table.innerHTML += `
<tr>
<td>${u.projectName}</td>
<td>${u.updateText}</td>
<td>${u.feedback ?? "Waiting for feedback"}</td>
</tr>
`;

                });

        });

}

loadEmployeeUpdates();

function loadAssignedRequirements() {

    const user = JSON.parse(localStorage.getItem("user"));

    fetch(API + "/api/emp/employee/" + user.id, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(data => {

            let table = document.getElementById("assignedReqTable");
            table.innerHTML = "";

            data.forEach(req => {

                table.innerHTML += `
<tr>
<td>${req.title}</td>
<td>${req.description}</td>
<td>
    <span class="badge bg-primary">${req.status}</span>
</td>
</tr>`;
            });
        });
}
loadAssignedRequirements();
