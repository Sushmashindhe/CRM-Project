
const API = "https://localhost:7192";

// ✅ WAIT UNTIL PAGE LOADS
document.addEventListener("DOMContentLoaded", function () {

    const session = JSON.parse(localStorage.getItem("user"));

    if (!session) {
        alert("Please login first");
        window.location.href = "CustomerLogin.html";
        return;
    }

    // ✅ Extract actual user
    const user = session.user;

    // ✅ Display user details
    document.getElementById("cname").innerText = user.name;
    document.getElementById("cemail").innerText = user.email;
    document.getElementById("cphone").innerText = user.phone;

    // ✅ Load data
    loadRequirements(user.id);
});


// ✅ SEND REQUIREMENT
async function sendRequirement() {

    const session = JSON.parse(localStorage.getItem("user"));
    const user = session.user;

    const req = {
        Title: document.getElementById("title").value,
        Description: document.getElementById("desc").value,
        Category: document.getElementById("category").value,
        CustomerId: user.id,
        Status: "Pending",
        AssignedTo: "Admin"
    };

    if (!req.Title || !req.Description || !req.Category) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch(API + "/api/customerrequirements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        });

        if (res.ok) {
            alert("Submitted!");

            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
            document.getElementById("category").value = "";

            loadRequirements(user.id);
        } else {
            const err = await res.text();
            alert("Error: " + err);
        }

    } catch (err) {
        alert("Server error");
        console.error(err);
    }
}


// ✅ LOAD REQUIREMENTS
async function loadRequirements(customerId) {

    try {
        const res = await fetch(API + "/api/customerrequirements/my/" + customerId);
        const data = await res.json();

        let html = "";

        let total = data.length;
        let pending = data.filter(r => r.status === "Pending").length;
        let completed = data.filter(r => r.status === "Completed").length;

        data.forEach(r => {

            let badge = "bg-warning";

            if (r.status === "Completed") badge = "bg-success";
            if (r.status === "Rejected") badge = "bg-danger";

            html += `
                    <tr>
                        <td>${r.title}</td>
                        <td>${r.description}</td>
                        <td>${r.category}</td>
                        <td><span class="badge ${badge}">${r.status}</span></td>
                    </tr>
                `;
        });

        document.getElementById("reqTable").innerHTML = html;

        document.getElementById("totalReq").innerText = total;
        document.getElementById("pendingReq").innerText = pending;
        document.getElementById("completedReq").innerText = completed;

    } catch (err) {
        alert("Error loading data");
        console.error(err);
    }
}


// ✅ LOGOUT
function logout() {
    localStorage.removeItem("user");
    window.location.href = "CustomerLogin.html";
}