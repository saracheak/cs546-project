import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';

router.get("/", async (req, res) => {
    console.log("reached get in routes");
    const userId = req.session.userId;
    let user = await usersFunctions.getUser(userId);
    console.log(user);
    res.render("editPupfile", {user});
});

router.post("/", async (req, res) => {
    //TODO: check first name, last name, gender, dog name combination is not already in db, for now accepts any
    try {
        const updateInfo = req.body;
        const userId = req.session.userId;
        const updatedUser = await usersFunctions.updateUser(userId, updateInfo);
        console.log("successfully updated user info");
        res.redirect("/profile");
    } catch (error) {
        res.status(404).render('error', {message: "Could not sign up user"});
    }
});

export default router;