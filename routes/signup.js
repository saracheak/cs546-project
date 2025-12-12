import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';
import validator from 'validator';
import { users } from '../config/mongoCollections.js';

const usersCollection = await users();

router.get("/", (req, res) => {
    res.render("signup", {bodyClass: "signup-body"});
});

router.post("/", async (req, res) => {
    try {
        const {dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password, bio} = req.body;
        checkName(dogName);
        checkName(humanFirstName);
        checkName(humanLastName);
        checkGender(dogGender);
        checkGender(humanGender);
        await checkEmail(email);
        checkPassword(password);
        checkBio(bio);
        console.log("/post signup user details", dogName);
        const newUserId = await usersFunctions.createUser(dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password, bio, "user", [], [], [], [], [], []);
        req.session.userId = newUserId;
        console.log(`user ${humanFirstName} successfully signed up with id of ${newUserId}`);
        res.redirect("/profile");
    } catch (error) {
        res.status(404).render('signup', {error: error.message, bodyClass: "signup-body"});
    }
});

//Route Validation
const checkName = (name) => {
    if(typeof name !== "string") throw new Error("Name has to be type string");
    name = name.trim();
    if(name.length < 2 || name.length > 40) throw new Error("Name has to be between 2-40 characters");
    if(!/^[a-zA-Z' -]+$/.test(name)) throw new Error("Name can only contain space, alphanumeric, ', -")
    return true;
}

const checkGender = (gender) => {
    if(typeof gender !== "string") throw new Error("Gender has to be type string");
    gender = gender.trim().toLowerCase();
    if(gender !== "male" && gender !== "female" && gender !== "non-binary" && gender !== "prefer not to say" && gender !== "other") throw new Error("Invalid Gender Input");
    return true;
}

const checkEmail = async (email) => {
    let isValidEmail = validator.isEmail(email);
    let emailRegex = new RegExp(email, "i");
    let emailInDb = await usersCollection.findOne({email: emailRegex});
    if(emailInDb) throw new Error("This email is already taken. Login instead.");
    if(!isValidEmail) throw new Error("The email entered is not valid.");
    return true;
}

const checkPassword = (password) => {
    if(typeof password !== "string") throw new Error("Password has to be type string");
    password = password.trim();
    if(password.length < 8 || password.length > 20) throw new Error("Password has to be between 8-20 characters");

    //1 lowercase, 1 uppercase, 1 number, 1 special character respectively
    const strongPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");
    if(!strongPasswordRegex.test(password)) throw new Error("Password must have at least 1 lowercase, 1 uppercase, 1 number and 1 special character");
    return true;
}

const checkBio = (bio) => {
    if(typeof bio !== "string") throw new Error("Bio has to be type string");
    bio = bio.trim();
    if(bio.length > 100) throw new Error("Bio has to be <100 characters");
    return true;
}

export default router;