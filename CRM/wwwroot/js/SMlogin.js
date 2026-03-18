

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

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

    localStorage.setItem("token", user.token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("user", JSON.stringify(user));

    window.location.href = "dashboard.html";

                });

        }

