

async function register() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();

    const phoneError = document.getElementById("phoneError");
    const successMsg = document.getElementById("successMsg");
    const failMsg = document.getElementById("failMsg");

    phoneError.style.display = "none";
    successMsg.style.display = "none";
    failMsg.style.display = "none";

    /* PHONE VALIDATION */

    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phone)) {
        phoneError.style.display = "block";
        return;
    }

    const customer = {

        name: name,
        email: email,
        password: password,
        phone: phone

    };

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

        failMsg.style.display = "block";

    }

}