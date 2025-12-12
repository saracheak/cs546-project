import {Router} from "express";
import { commentsFunctions } from "../data/comments.js";
import {parksFunctions} from "../data/parks.js";
import { requireLogin } from "../middleware.js";
import { checkString } from "../validation.js";
import { usersFunctions } from "../data/users.js";
import xss from "xss";
import { ratingsFunctions } from "../data/ratings.js";


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
        return res.status(500).render("error", {message: e.toString() });
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

//shows user the new park form if they click the link from the search bar
router.get("/new", async (req, res)=> {
    try{
        res.status(200).render('newPark');
    }catch(e){
        return res.status(404).render("error", {message: e.toString()});
    }
});

//create a park with approved =false
router.post("/new", async (req, res) => {
    try {

      let park_name = xss(req.body.park_name);
      let park_type = xss(req.body.park_type);
      let street_1 = xss(req.body.street_1);
      let street_2 = xss(req.body.street_2 || "");
      let city = xss(req.body.city);
      let state = xss(req.body.state);
      let zip_code = xss(req.body.zip_code);
  
      //Input Validation
      park_name = checkString(park_name, "park_name");
      park_type = checkString(park_type, "park_type");
      street_1 = checkString(street_1, "address.street_1");
      city = checkString(city, "address.city");
      state = checkString(state, "address.state");
      zip_code = checkString(zip_code, "address.zip_code");
  
      //Build address object in the shape checkAddress() expects
      const address = {
        street_1,
        city,
        state,
        zip_code
      };

      // only include street_2 if it's non-empty
      street_2 = street_2.trim(); //needs to be trimmed if empty so the helper function checkAddress works correctly
      if (street_2.length > 0) {
        address.street_2 = street_2;
      }
  
      //Defaults for new, user-submitted park
      const approved = false;           
      const comments = [];             
      const avg = 0;   
  
      //
      const newPark = await parksFunctions.createPark(
        park_name,
        park_type,
        approved,
        comments,
        address,
        avg, // average_cleanliness
        avg, // average_dog_friendliness
        avg, // average_busyness
        avg, // average_water_availability
        avg, // average_wastebag_availability
        avg, // average_trash_availability
        avg, // average_surface
        avg  // average_amenities
      );
  
      // New park was created, so e-render the form with a success message
      return res.status(200).render("newPark", {
        successMessage:
          "Park submitted successfully and is pending admin approval!",
          newPark        // optional: send newPark back to show its info - not sure if i want to keep this
      });
    } catch (e) {
      // On error, re-render with error and keep previously typed values
      return res.status(400).render("newPark", {
        error: e.toString(),
        // so the user doesn't lose their input:
        park_name: req.body.park_name,
        park_type: req.body.park_type,
        street_1: req.body.street_1,
        street_2: req.body.street_2,
        city: req.body.city,
        state: req.body.state,
        zip_code: req.body.zip_code
      });
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

        await parksFunctions.getParkById(parkId);
        const comments = await commentsFunctions.getCommentsForPark(parkId);
        const ratings = await ratingsFunctions.getRatingsForPark(parkId);
        await ratingsFunctions.getAverageRatingsForPark(parkId);
        const park = await parksFunctions.getParkById(parkId);
        
        const currentUserId = req.session.userId;
        const isAdmin = res.locals.isAdmin === true;

        for (const c of comments) {
      c.canDelete =
        !!currentUserId && (isAdmin || c.user_id?.toString() === currentUserId);

      try {
        const user = await usersFunctions.getUser(c.user_id.toString());
        c.authorName =
          user?.dog_name || user?.human_first_name || user?.email || "Unknown pup";
      } catch (e) {
        c.authorName = "Unknown pup";
      }
    }
         
        return res.status(200).render("parkDetail", {
            title: park.park_name,
            park,
            comments,
            ratings,
            isLoggedIn: !!req.session.userId,
            isAdmin
        });
    }catch(e){
        return res.status(404).render("error", {message: e.toString()});
    }
});
export default router;
