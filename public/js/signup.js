const showSignupError = (msg) => {
  const messageDiv = document.getElementById("signup-error");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    //signup form validation
    const signupForm = document.getElementById("signup-form");
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const dogName = document.getElementById("dog-name").value.trim();
        const humanFirstName = document.getElementById("human-first-name").value.trim();
        const humanLastName = document.getElementById("human-last-name").value.trim();
        const dogGender = document.getElementById("dog-gender").value.trim();
        const humanGender = document.getElementById("human-gender").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const bio = document.getElementById("bio").value.trim();

        try {
            checkName(dogName);
            checkName(humanFirstName);
            checkName(humanLastName);
            checkGender(dogGender);
            checkGender(humanGender);
            checkEmail(email);
            checkPassword(password);
            checkBio(bio);
            signupForm.submit();
        } catch (error) {
            showSignupError(error.message);
        }
    });
});

function checkName(name) {
    if (typeof name !== "string") throw new Error("Name must be a string");
    if (name.length < 2 || name.length > 40) throw new Error("Name must be between 2-40 characters");
    if (!/^[a-zA-Z' -]+$/.test(name)) throw new Error("Name can only contain letters, spaces, ', -");
}

function checkGender(gender, fieldName = "Gender") {
    const validGenders = ["male", "female", "non-binary", "prefer not to say", "other"];
    if (typeof gender !== "string") throw new Error(`${fieldName} must be a string`);
    if (!validGenders.includes(gender.toLowerCase())) throw new Error(`${fieldName} input is invalid`);
}

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

function checkBio(bio) {
    if (typeof bio !== "string") throw new Error("Bio must be a string");
    if (bio.length > 100) throw new Error("Bio must be less than 100 characters");
}
