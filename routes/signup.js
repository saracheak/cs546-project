import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';

router.get("/", (req, res) => {
    res.render("signup");
});

router.post("/", async (req, res) => {
    //TODO: check first name, last name, gender, dog name combination is not already in db, for now accepts any
    try {
        const {dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password} = req.body;
        const newUserId = await usersFunctions.createUser(dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password, "user", [], [], [], [], [], []);
        req.session.userId = newUserId;
        console.log(`user ${humanFirstName} successfully signed up with id of ${newUserId}`);
        res.redirect("/profile");
    } catch (error) {
        res.status(404).render('error', {message: "Could not sign up user"});
    }
});

export default router;