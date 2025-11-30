import {Router} from "express";
import { commentsFunctions } from "../data/comments.js";
import {parksFunctions} from "../data/parks.js";

const router = Router();

router.get("/", async(req, res)=> {
    try{
        let approvedOnly = true;

        if(typeof req.query.approved === "string"){
            const n = req.query.approved.toLowerCase();
            if(n === "false"){
                approvedOnly = false;
            }else if(n === "true"){
                approvedOnly = true;
            }
        }
        const allParks = await parksFunctions.getAllParks(approvedOnly);
        return res.status(200).render("parks", {
            title: "Parks",
            parks: allParks
        });
    }catch(e){
        return res.status(500).render("error", {error: e.toString() });
    }
});


router.get("/:parkId/comments", async (req, res)=>{
    try{
        const {parkId} = req.params;
        await parksFunctions.getParkById(parkId);
        const comments = await commentsFunctions.getCommentsForPark(parkId);
        return res.status(200).json(comments);
    }catch(e){
        return res.status(400).json({e: e.toString()});
    }
});
router.get("/:parkId", async (req, res)=> {
    try{
        const{parkId} = req.params;

        const park = await parksFunctions.getParkById(parkId);
        const comments = await commentsFunctions.getCommentsForPark(parkId);
        return res.status(200).render("parkDetail", {
            title: park.park_name,
            park:park,
            comments: comments
        });
    }catch(e){
        return res.status(404).render("error", {error: e.toString()});
    }
});
export default router;
