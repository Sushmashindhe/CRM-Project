
const API = "https://localhost:7192";

async function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loginError = document.getElementById("loginError");

    emailError.style.display = "none";
    passwordError.style.display = "none";
    loginError.style.display = "none";

    if (!email.includes("@")) {
        emailError.style.display = "block";
        return;
    }

    if (password.length < 8) {
        passwordError.style.display = "block";
        return;
    }

    const res = await fetch(API + "/api/customers/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        loginError.style.display = "block";
        return;
    }

    const result = await res.json();

    console.log("LOGIN RESPONSE:", result);

    // ✅ STORE USER
    localStorage.setItem("user", JSON.stringify(result));

    // ✅ REDIRECT
    window.location.href = "CustomerDashboard.html";
}