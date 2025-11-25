import {Router} from 'express';
const router = Router();


router.get("/", (req, res) => {
    const username = req.query.username;
    res.render("profile", { username: username });
});

export default router;