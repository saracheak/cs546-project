import {Router} from "express";
import { commentsFunctions } from "../data/comments.js";
import {parksFunctions} from "../data/parks.js";
import { requireLogin } from "../middleware.js";
import { checkString } from "../validation.js";

const router = Router();

router.get("/", async(req, res)=> {
    try{
        let approvedOnly = true;

        if(typeof req.query.approved === "string"){
            const n = req.query.approved.toLowerCase().trim();
            if(n === "false"){
                approvedOnly = false;
            }else if(n === "true"){
                approvedOnly = true;
            } else {
                return res.status(400)
                .render("error", {error: "approved must be either true or false"});
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

router.post("/:parkId/comments", requireLogin, async (req, res) => {
    try{
        let {parkId} = req.params;
        parkId= checkString(parkId, "parkId");

        let commentText = checkString(req.body.comment, "comment");
        if(commentText.length > 500){
            throw new Error("comment must be 500 characters or fewer");
        }

        const userId = req.session.userId;
      

        await commentsFunctions.addCommentToPark(parkId, {
            user_id: userId,
            comment: commentText,
     
        });

        return res.redirect(`/parks/${parkId}`);
    }catch(e){
        return res.status(400).render("error", {error: e.toString()});
    }
});


router.delete("/comments/:commentId", requireLogin, async (req, res) => {
    try{

        if(!req.session.userId){
            return res
                .status(401)
                .json({error: "You must be logged in to delete comments"})
        }
        let{commentId} = req.params;
        commentId = checkString(commentId, "commentId");

        const isAdmin = res.locals.isAdmin === true;

        const deleted = await commentsFunctions.deleteCommentFromPark(commentId, req.session.userId, isAdmin);
        return res.status(200).json({
            deleted: true,
            comment: deleted
        });
    }catch (e){
        return res.status(400).json({error: e.toString()});
    }
});


router.post("/comments/:commentId/like", requireLogin, async (req, res) => {
    try{

        if(!req.session.userId){
            return res
                .status(401)
                .json({error: "You must be logged in to like comments"});
        }
        let {commentId} = req.params;
        commentId = checkString(commentId, "commentId");

        const updated = await commentsFunctions.likeUnlikeComment(commentId, req.session.userId);

        return res.status(200).json({likes: updated.likes});
    } catch(e){
        return res.status(400).json({error: e.toString()});
    }

});

router.get("/:parkId/comments", async (req, res)=>{
    try{
        let {parkId} = req.params;
        parkId = checkString(parkId, "parkId");
        
       await parksFunctions.getParkById(parkId);
       const comments = await commentsFunctions.getCommentsForPark(parkId);
       return res.status(200).json(comments);
    }catch(e){
        return res.status(400).json({error: e.toString()});
    }
});


router.get("/:parkId", async (req, res)=> {
    try{
        let {parkId} = req.params;
        parkId = checkString(parkId, "parkId");

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
