import {Router} from 'express';
import bcrypt from 'bcryptjs';
const router = Router();
import { usersFunctions } from '../data/users.js';

//TODO: change to 16 at the end, it's just so slow for testing
const saltRounds = 10;

router.get("/", (req, res) => {
    res.render("signup");
});

router.post("/", async (req, res) => {
    //TODO: check first name, last name, gender, dog name combination is not already in db, for now accepts any
    try {
        const {dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserId = await usersFunctions.createUser(dogName, humanFirstName, humanLastName, dogGender, humanGender, email, hashedPassword, [], [], [], [], [], []);
        req.session.userId = newUserId;
        console.log(`user ${humanFirstName} successfully signed up with id of ${newUserId}`);
        res.redirect("/profile");
    } catch (error) {
        res.status(404).render('error', {message: "Could not sign up user"});
    }
});

export default router;