
const API = "https://localhost:7192";

let verifiedEmail = "";
let verifiedRole = "";

async function verifyUser() {
    const email = document.getElementById("email").value.trim();
    const placeOfBirth = document.getElementById("placeofbirth").value.trim();
    const role = document.getElementById("role").value;
    const message = document.getElementById("verifyMessage");

    const res = await fetch(API + "/api/auth/verify-placeofbirth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            placeOfBirth: placeOfBirth,
            role: role
        })
    });

    if (!res.ok) {
        message.style.display = "block";
        message.className = "message error";
        message.innerText = "Email or Place Of Birth incorrect";
        return;
    }

    message.style.display = "block";
    message.className = "message success";
    message.innerText = "Verification successful";

    verifiedEmail = email;
    verifiedRole = role;

    document.getElementById("resetSection").style.display = "block";
}

async function resetPassword() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const passwordMsg = document.getElementById("passwordMessage");

    if (newPassword !== confirmPassword) {
        passwordMsg.style.display = "block";
        passwordMsg.className = "message error";
        passwordMsg.innerText = "Passwords do not match";
        return;
    }

    const res = await fetch(API + "/api/auth/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: verifiedEmail,
            newPassword: newPassword
        })
    });

    if (!res.ok) {
        const text = await res.text();
        passwordMsg.style.display = "block";
        passwordMsg.className = "message error";
        passwordMsg.innerText = text;
        return;
    }

    passwordMsg.style.display = "block";
    passwordMsg.className = "message success";
    passwordMsg.innerText = "Password successfully changed.";

    setTimeout(() => {
        if (verifiedRole === "Manager") {
            window.location.href = "ManagerLogin.html";
        } else {
            window.location.href = "EmployeeLogin.html";
        }
    }, 2000);
}