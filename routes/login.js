import {Router} from 'express';
const router = Router();
import bcrypt from "bcryptjs";
import {users} from '../config/mongoCollections.js'

let usersCollection = await users();

router.get("/", (req, res) => {
    res.render("login", { root: "../views" });
});

router.post("/", async(req, res) => {
    try {
        const {email, password} = req.body;

        const user = await usersCollection.findOne({ email });
        if (!user) return res.render("/login", {error: "No user found with that email"});

        const match = await bcrypt.compare(password, user.hash_password);
        if (!match) return res.render("/login", {error: "Incorrect password"});

        req.session.userId = user._id;
        req.session.humanFirstName = user.human_first_name;

        console.log(`user ${email} successfully logged in`);
        res.redirect("/profile");
    } catch (e) {
        res.status(404).render('error', {message: "User not found in db"});    
    }    
});

export default router;