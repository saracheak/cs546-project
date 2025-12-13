const showEditPupfileError = (msg) => {
  const messageDiv = document.getElementById("edit-pupfile-error");
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    //editPupfile form validation
    const editPupfileForm = document.getElementById("edit-pupfile-form");
    editPupfileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const dogName = document.getElementById("dogName").value.trim();
        const humanFirstName = document.getElementById("humanFirstName").value.trim();
        const humanLastName = document.getElementById("humanLastName").value.trim();
        const dogGender = document.getElementById("dogGender").value.trim();
        const humanGender = document.getElementById("humanGender").value.trim();
        const bio = document.getElementById("bio").value.trim();
        const times = Array.from(document.querySelectorAll('input[name="times[]"]:checked')).map(time => time.value);

        try {
            checkName(dogName);
            checkName(humanFirstName);
            checkName(humanLastName);
            checkGender(dogGender);
            checkGender(humanGender);
            checkBio(bio);
            checkTimes(times);
            // checkPetFriends(petFriends);
            editPupfileForm.submit();
        } catch (error) {
            showEditPupfileError(error.message);
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

function checkTimes(times) {
    if (!Array.isArray(times)) throw new Error("Times must be an array");
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;
    for (const t of times) {
        if (!timeRegex.test(t)) throw new Error(`Invalid time format: ${t}`);
    }
}