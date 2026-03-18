localStorage.clear();

function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailError = document.getElementById("emailError");
    const loginError = document.getElementById("loginError");

    emailError.style.display = "none";
    loginError.style.display = "none";


    /* EMAIL VALIDATION */

    if (!email.includes("@")) {

        emailError.style.display = "block";
        return;

    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
        passwordError.style.display = "block";
        return;
    }


    const data = {
        email: email,
        password: password
    };


    /* API LOGIN */

    fetch("/api/auth/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })
        .then(async res => {

            if (!res.ok) {

                loginError.style.display = "block";
                return;

            }

            const user = await res.json();
            console.log(data);   // check this in console




            localStorage.setItem("token", user.token);
            localStorage.setItem("role", user.role);


            /* Store only needed fields */

            localStorage.setItem("user", JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                managerType: user.managerType
            }));

            window.location.href = "ManagerDashboard.html";
        });

}

function goToForgot() {
    window.location.href = "ForgotPassword.html";
}