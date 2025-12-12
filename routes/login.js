import {Router} from 'express';
const router = Router();
import bcrypt from "bcryptjs";
import {users} from '../config/mongoCollections.js'
import validator from 'validator';

let usersCollection = await users();

router.get("/", (req, res) => {
    res.render("login", { root: "../views" });
});

router.post("/", async(req, res) => {
    try {
        const {email, password} = req.body;
        checkEmail(email);
        checkPassword(password);

        const user = await usersCollection.findOne({ email });
        if (!user) return res.render("login", {error: "No account with that email found."});

        const match = await bcrypt.compare(password, user.hashedPassword);
        if (!match) return res.render("login", {error: "Incorrect email or password"});

        req.session.userId = user._id;
        req.session.humanFirstName = user.humanFirstName;

        console.log(`user ${email} successfully logged in`);
        res.redirect("/profile");
    } catch (e) {
        res.status(400).render('login', {error: e.message});    
    }    
});


const checkEmail = (email) => {
    let isValidEmail = validator.isEmail(email);
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

export default router;