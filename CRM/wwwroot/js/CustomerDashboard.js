
const API = "https://localhost:7192";

// ✅ WAIT UNTIL PAGE LOADS
document.addEventListener("DOMContentLoaded", function () {

    const session = JSON.parse(localStorage.getItem("user"));

    if (!session) {
        showToast("Please login first", "error");

        setTimeout(() => {
            window.location.href = "CustomerLogin.html";
        }, 1500);

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
        showToast("Fill all fields", "error");
        return;
    }

    try {
        const res = await fetch(API + "/api/customerrequirements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        });

        if (res.ok) {
            showToast("Requirement submitted successfully", "success");

            document.getElementById("title").value = "";
            document.getElementById("desc").value = "";
            document.getElementById("category").value = "";

            loadRequirements(user.id);
        } else {
            const err = await res.text();
            showToast("Error: " + err, "error");
        }

    } catch (err) {
        showToast("Server error", "error");
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
        showToast("Error loading data", "error");
        console.error(err);
    }
}
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

// ✅ LOGOUT
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}