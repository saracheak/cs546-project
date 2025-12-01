import {Router} from 'express';
const router = Router();

router.get("/", (req, res) => {
    if (!req.session) {
        console.log("User tried to log out but no session existed");
        return res.redirect('/home');
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid');
        console.log("User successfully logged out");
        res.redirect('/home');
    });
});

export default router;