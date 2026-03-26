
const API = "https://localhost:7192";

localStorage.removeItem("token");
localStorage.removeItem("role");
localStorage.removeItem("user");

async function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loginError = document.getElementById("loginError");

    emailError.style.display = "none";
    passwordError.style.display = "none";
    loginError.style.display = "none";

    /* EMAIL VALIDATION */

   if (!email.includes("")) {

        emailError.style.display = "block";
        return;

    }

    /* PASSWORD VALIDATION */

    const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {

        passwordError.style.display = "block";
        return;

    }

    const data = {
        email: email,
        password: password
    };

    /* API LOGIN */

    const res = await fetch(API + "/api/auth/login", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)

    });

    if (!res.ok) {

        loginError.style.display = "block";
        return;

    }

    const user = await res.json();

    localStorage.setItem("token", user.token);
    localStorage.setItem("role", user.role);

    localStorage.setItem("user", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        employeeType: user.employeeType,
        role: user.role
    }));

    window.location.href = "EmployeeDashboard.html";
}