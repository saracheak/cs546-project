import {Router} from "express";
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

router.get("/:parkId", async (req, res)=> {
    try{
        const{parkId} = req.params;

        const park = await parksFunctions.getParkById(parkId);
        return res.status(200).render("parkDetail", {
            title: park.park_name,
            park:park,
        });
    }catch(e){
        return res.status(404).render("error", {error: e.toString()});
    }
});
export default router;
