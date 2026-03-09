console.log("JS Loaded"); // check if script loads

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("loginForm").addEventListener("submit", async function (e) {

        e.preventDefault();

        const loginData = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        try {

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {

                const result = await response.json();

                alert(result.message);

            } else {

                alert("Invalid email or password");

            }

        } catch (error) {

            alert("Error connecting to API");

            console.log(error);

        }

    });

});