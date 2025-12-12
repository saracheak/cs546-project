
const showLoginError = (msg) => {
  const messageDiv = document.getElementById("login-error");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    //login form validation
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            checkEmail(email);
            checkPassword(password);
            loginForm.submit();
        } catch (error) {
            showLoginError(error.message);
        }
    });
});


function checkEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Email is not valid");
}

function checkPassword(password) {
    if (typeof password !== "string") throw new Error("Password must be a string");
    if (password.length < 8 || password.length > 20) throw new Error("Password must be 8-20 characters");
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!strongPasswordRegex.test(password)) throw new Error("Password must contain 1 lowercase, 1 uppercase, 1 number, and 1 special character");
}