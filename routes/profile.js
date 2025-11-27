import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';

router.get("/", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const userId = req.session.userId;
    const user = await usersFunctions.getUser(userId);

    console.log("user details pulled from profile route", user);

    res.render("profile", { humanFirstName: user.human_first_name, petFriends: user.pet_friends, favParks: user.favorite_parks, times: user.times, parksVisited: user.parks_visited});
});

export default router;