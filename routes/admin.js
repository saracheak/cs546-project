// routes/admin.routes.js
import { Router } from "express";
import { requireAdmin } from "../middleware.js";
import { parksFunctions } from "../data/parks.js";
import { biscuitsFunctions } from "../data/biscuits.js";
import { checkString } from "../validation.js";
import { ObjectId } from "mongodb";
const router = Router();

//requireAdmin middleware will run for every request that is made through this route page
//because all of the routes in this file require the user to be an admin 
router.use(requireAdmin);

// /*------------ Admin Dashboard + loads pending parks --> GET /admin ------------*/
router.get('/', async (req, res) => {
  try {
    const allParks = await parksFunctions.getAllParks(false);
    const pendingParks = allParks.filter(p => !p.approved);

    // Pull messages out of session - needed bc otherwise when approve or deny is clicked the web page format gets messed up
    const approveMessage = req.session.approveMessage;
    const approveError = req.session.approveError;

    // Clear them so they only show once
    req.session.approveMessage = null;
    req.session.approveError = null;

    return res.status(200).render('admin', {pendingParks, approveMessage, approveError});

  } catch (e) {
    return res.status(400).render('admin', {pendingParks: [], approveError: e.toString()});
  }
});

///parks/pending not needed anymore since it gets passed straight to admin temp. Needs to be passed directly to admin template otherwise it does not show up every time the page is rendered

// GET /admin/parks/pending --> show all parks with approved = false
// router.get("/parks/pending", async (req, res) => {
//   try {
//     const allParks = await parksFunctions.getAllParks(false);    // getAllParks(false) returns ALL parks, both approved and not
//     const pendingParks = allParks.filter(p => !p.approved); //get parks that are not approved

//     return res.status(200).render("admin", {title: "Pending Parks", pendingParks});
//   } catch (e) {
//     return res.status(500).render("error", {message: e.toString() });
//   }
// });

// /*------------ Parks Admin Routes --> Approve and Deny User Park Suggestion------------*/

router.post('/parks/:parkId/approve', async (req, res) => {
  try {
    const parkId = checkString(req.params.parkId, 'parkId');
    await parksFunctions.setParkApproved(parkId, true);

    // store message
    req.session.approveMessage = "Park approved successfully!";

    return res.redirect('/admin');

  } catch (e) {
    req.session.approveError = e.toString();
    return res.redirect('/admin');
  }
});

router.post('/parks/:parkId/deny', async (req, res) => {
  try {
    const parkId = checkString(req.params.parkId, 'parkId');
    await parksFunctions.deletePark(parkId);

    req.session.approveMessage = "Park denied and removed successfully.";
    return res.redirect('/admin');

  } catch (e) {
    req.session.approveError = e.toString();
    return res.redirect('/admin');
  }
});

// /*------------ Parks Admin Routes TODO's for Aeslyn------------*/

// //DELETE /admin/parks/:parkId --> remove a park if needed (maybe users reported it closed)
// router.route('/parks/:parkId').delete(async (req,res) => {
//     //TODO
// });


/*------------ Biscuit Admin Routes ------------*/

//POST /admin/biscuits/ --> Create new biscuit
router.route('/biscuits').post(async (req,res) => {
    try{
        let {biscuit_name, description} = req.body;

        //input validation check
        biscuit_name = checkString(biscuit_name, 'biscuit_name');
        description = checkString(description, 'description');

        //validate the name or description isn't already in the DB system
        biscuit_name = biscuit_name.trim().toLowerCase();
        description = description.trim().toLowerCase();

        //check for duplicates
        const allBiscuits = await biscuitsFunctions.getAllBiscuits();
        const alreadyExists = allBiscuits.some((b) => {
            const existingName = b.biscuit_name.trim().toLowerCase();
            const existingDesc = b.description.trim().toLowerCase();
            return (existingName === biscuit_name || existingDesc === description);
        })
        if(alreadyExists){// duplicate found → re-render admin with an error
            return res.status(400).render('admin', {createError: 'A biscuit with the same name or description already exists.'
            });
        }

         // create new biscuit if no dups are found
        await biscuitsFunctions.createBiscuit(biscuit_name, description);
        console.log('Successfully created biscuit!');

        return res.status(200).render('admin', {createMessage: 'Biscuit created successfully!'
        });
    } catch (e) {
        return res.status(400).render('admin', {createError: e + ' biscuit_name and description are required to create a new biscuit.'
        });
    }
})

//POST /admin/biscuits/:biscuitId --> Update/edit biscuit
//Originally wrote this as patch, but realized it made the form hard to write. 
//So i changed it back to post but left the logic the same, which is why there are some
//extra checks for if a parameter exists
router.route('/biscuits/update').post(async(req, res)=>{
    try{
        let {biscuitId, biscuit_name, description} = req.body;

        //input validation check
        // Both fields are required; if either is missing, show an error
        if (!biscuit_name || !description) {
            return res.status(400).render('admin', { updateError: 'You must provide biscuit_name and description to update.' });
        }

        // Input validation
        biscuitId = checkString(biscuitId, 'biscuitId');
        // Throw error if the biscuit ID does not exist
        try {
          await biscuitsFunctions.getBiscuitById(biscuitId);
        } catch (err) {
          // data function throws if not found
          return res.status(400).render('admin', {updateError: 'That biscuit ID does not exist.'});
        }

        biscuit_name = checkString(biscuit_name, 'biscuit_name');
        biscuit_name = biscuit_name.trim().toLowerCase();
    
        description = checkString(description, 'description');
        description = description.trim().toLowerCase();
    
        //validate the new name and description provided are not duplicates of ones already in the DB
        const allBiscuits = await biscuitsFunctions.getAllBiscuits();
        const isDuplicate = allBiscuits.some((b) => {
            //prevents system from crashing/counting a duplicate if the current biscuit being checked in the DB is 
            //the same as the one we want to edit. The function skips over the biscuit if it is the one we want to edit, and 
            //continues checking the other biscuits in the DB. 
            if (b._id.toString() === biscuitId) return false; 

            //bc this is patch, we have to verify that the field exists bc checking it since
            //it may not be provided
            const nameMatches = b.biscuit_name.trim().toLowerCase() === biscuit_name;
            const descMatches = b.description.trim().toLowerCase() === description;
    
            return nameMatches || descMatches;
          });

          if (isDuplicate) {
            return res.status(400).render('admin', {updateError: 'A biscuit with the same name or description already exists.'});
          }

          // No duplicate name or description, so build updated biscuit object
          //based on the input that was provided (bc this is patch one or both params
          //could have been given)
            const updateInfo = {};
            if (biscuit_name !== undefined) updateInfo.biscuit_name = biscuit_name;
            if (description !== undefined) updateInfo.description = description;

          const updateSuccessful = await biscuitsFunctions.updateBiscuit(biscuitId, updateInfo);
          console.log('Biscuit updated successfully!');
          return res.status(200).render('admin', { updateMessage: 'Biscuit updated successfully!' });
        }
    catch (e){
        return res.status(400).render('admin', {updateError: e});
    }
});

// POST /admin/biscuits/delete --> delete biscuit by ID from form
router.route('/biscuits/delete').post(async (req, res) => {
    try {
      let { biscuitId } = req.body;
  
      //input validation
      biscuitId = checkString(biscuitId, 'biscuitId');
      // // Throw error if the biscuit ID does not exist
      // try {
      //   await biscuitsFunctions.getBiscuitById(biscuitId);
      // } catch (err) {
      //   // data function throws if not found
      //   return res.status(400).render('admin', {
      //     updateError: 'That biscuit ID does not exist.'
      //   });
      // }

      // will throw if ID is invalid or biscuit not found
      await biscuitsFunctions.getBiscuitById(biscuitId); //delete if not working
      await biscuitsFunctions.deleteBiscuitById(biscuitId);
  
      console.log('Successfully deleted biscuit!');
  
      // Option 1: render admin page with a success message
      return res.status(200).render('admin', {deleteMessage: 'Biscuit deleted successfully!'});
    } catch (e) {
      return res.status(400).render('admin', {deleteError: e});
    }
  });


export default router;
