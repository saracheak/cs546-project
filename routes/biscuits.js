import {Router} from "express";
const router = Router();
import {biscuitsFunctions} from "../data/biscuits.js";

router.get("/", async(req, res)=> {
    try{
        const allBiscuits = await biscuitsFunctions.getAllBiscuits();
        return res.status(200).render("biscuits", { allBiscuits });
    }catch(e){
        return res.status(500).render("error", {error: e.toString() });
    }
});

export default router;

