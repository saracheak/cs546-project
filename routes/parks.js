import {Router} from "express";
import { commentsFunctions } from "../data/comments.js";
import {parksFunctions} from "../data/parks.js";
import { requireLogin } from "../middleware.js";
import { checkString } from "../validation.js";
import { usersFunctions } from "../data/users.js";

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

        if(commentText.indexOf("<")!== -1 || commentText.indexOf(">") !== -1){
            throw new Error("comment cannot contain < or >")
        }

        const userId = req.session.userId;
        if(!userId){
            return res
                .status(401)
                .render("error", {error: "You must be logged in to comment"});
        }
      

        await commentsFunctions.addCommentToPark(parkId, {
            user_id: userId,
            comment: commentText,
     
        });

        return res.redirect(`/parks/${parkId}`);
    }catch(e){
        return res.status(400).render("error", {error: e.toString()});
    }
});

router.post("/comments/:commentId/delete", requireLogin, async (req, res) =>{
    try{
        if(!req.session.userId){
            return res
                .status(401)
                .render("error", {"error": "You must be logged in to delete comments"});
        }
        let{commentId} = req.params;
        commentId = checkString(commentId, "commentId");

        let {parkId} = req.body;
        parkId= checkString(parkId, "parkId");

        const isAdmin = res.locals.isAdmin === true;

        await commentsFunctions.deleteCommentFromPark(commentId, req.session.userId, isAdmin);
        return res.redirect(`/parks/${parkId}`);
    }catch (e){
        return res.status(400).render("error", {error: e.toString()});
    }
});

router.post("/comments/:commentId/like", requireLogin, async (req, res) => {
    try{
        if(!req.session.userId){
            return res
                .status(401)
                .render("error", {error: "You must be logged in to like comments"});
        }
        let {commentId} = req.params;
        commentId = checkString(commentId, "commentId");
        
        let {parkId} = req.body;
        parkId = checkString(parkId, "parkId");

        await commentsFunctions.likeUnlikeComment(commentId, req.session.userId)

        return res.redirect(`/parks/${parkId}`);
    } catch(e){
        return res.status(400).render("error", {error: e.toString()});
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

        const currentUserId = req.session.userId;
        const isAdmin = res.locals.isAdmin === true;

        for(let i = 0; i<comments.length; i++){
            let canDelete = false;

            if(currentUserId){
                if(isAdmin || comments[i].user_id === currentUserId){
                    canDelete = true;
                }
            }
            comments[i].canDelete = canDelete;

            try{
                const user = await usersFunctions.getUser(comments[i].user_id);

                if(user && user.dog_name){
                    comments[i].authorName = user.dog_name;
                } else if(user && user.human_first_name){
                    comments[i].authorName = user.human_first_name;
                }else if(user && user.email){
                    comments[i].authorName = user.email;
                }else{
                    comments[i].authorName = "Unknown pup";
                }
            }catch(e){
                comments[i].authorName = "Unkown pup";
            }
        }
         
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
