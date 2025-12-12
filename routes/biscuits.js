import {Router} from "express";
const router = Router();
import {biscuitsFunctions} from "../data/biscuits.js";
import {usersFunctions} from "../data/users.js";

router.get("/", async(req, res)=> {
    try{
        const allBiscuits = await biscuitsFunctions.getAllBiscuits();
    
        let earnedIds = []; //if user is logged in the array will store the ids they have earned that are in the user's biscuits array
        if (req.session.userId) {
        const user = await usersFunctions.getUser(req.session.userId);
        earnedIds = (user.biscuits || []).map(id => id.toString()); //converts biscuit ObjectID values into strings for handlebars comparison
        }

        res.render("biscuits", {allBiscuits: allBiscuits.map(b => ({...b, _id: b._id.toString()})), //loop through every biscuit and change the object id to a string
        earnedIds, 
        isLoggedIn: !!req.session.userId }); //verifies if the user is logged in
    } 
    catch(e){
        return res.status(500).render("error", {message: e.toString() });
    }
});

export default router;

