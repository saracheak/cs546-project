import {Router} from 'express';
const router = Router();


router.get("/", (req, res) => {
    res.render("login", { root: "../views" });
});

router.post("/", (req, res) => {
    const {username, password} = req.body;

    //TODO: check username and password matches in db, for now accepts any
    if(username && password){
        console.log(`user ${username} successfully logged in`);
        res.redirect(`/profile?username=${username}`);
    } else{
        res.status(404).render('error', {message: "User not found in db"});
    }
});

export default router;