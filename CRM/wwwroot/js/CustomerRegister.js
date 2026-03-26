async function register() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();

    const emailError = document.getElementById("emailError");
    const nameError = document.getElementById("nameError");
    const phoneError = document.getElementById("phoneError");
    const successMsg = document.getElementById("successMsg");
    const failMsg = document.getElementById("failMsg");
    const passwordError = document.getElementById("passwordError");

    emailError.style.display = "none";
    phoneError.style.display = "none";
    successMsg.style.display = "none";
    failMsg.style.display = "none";
    passwordError.style.display = "none";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        emailError.style.display = "block";
        return;
    }

    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phone)) {
        phoneError.style.display = "block";
        return;
    }

    if (name === "")
    {
        nameError.style.display = "block";
        return;
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordPattern.test(password)) {
        passwordError.style.display = "block";
        return;
    }

    const customer = { name, email, password, phone };

    const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
    });

    if (res.ok) {
        successMsg.style.display = "block";

        setTimeout(() => {
            window.location.href = "CustomerLogin.html";
        }, 1500);
    } else {
        const errorText = await res.text();

        if (errorText.includes("Email already")) {
            failMsg.innerText = "Email already registered";
        } else {
            failMsg.innerText = "Registration failed. Please try again.";
        }

        failMsg.style.display = "block";
    }
}