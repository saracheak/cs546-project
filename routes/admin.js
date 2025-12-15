// routes/admin.routes.js
import { Router } from "express";
import { requireAdmin } from "../middleware.js";
import { parksFunctions } from "../data/parks.js";
import { biscuitsFunctions } from "../data/biscuits.js";
import { checkString } from "../validation.js";
import xss from "xss";
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

    return res.status(200).render('admin', {pendingParks, approveMessage, approveError, bodyClass: "admin-body"});

  } catch (e) {
    return res.status(400).render('admin', {pendingParks: [], approveError: e.toString(), bodyClass: "admin-body"});
  }
});

// /*------------ Parks Admin Routes --> Approve and Deny User Park Suggestion------------*/

router.post('/parks/:parkId/approve', async (req, res) => {
  try {
    let parkId = xss(req.body.parkId);
    parkId = checkString(req.params.parkId, 'parkId');
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
    let parkId = xss(req.body.parkId);
    parkId = checkString(req.params.parkId, 'parkId');
    await parksFunctions.deletePark(parkId);

    req.session.approveMessage = "Park denied and removed successfully.";
    return res.redirect('/admin');

  } catch (e) {
    req.session.approveError = e.toString();
    return res.redirect('/admin');
  }
});

router.get("/parks/:parkId/edit", async (req, res) => {
  try {
    const parkId = checkString(req.params.parkId, "parkId");
    const park = await parksFunctions.getParkById(parkId);

    return res.status(200).render("editPark", {park, bodyClass: 'home-body'});
  } catch (e) {
    return res.status(400).render("admin", {
      approveError: `Could not load edit page: ${e.toString()}`,
      pendingParks: []
    });
  }
});

router.post("/parks/:parkId/edit", async (req, res) => {
  try {
    const parkId = checkString(req.params.parkId, "parkId");

    //validation
    let park_name = checkString(xss(req.body.park_name), "park_name");
    let park_type = checkString(xss(req.body.park_type), "park_type");
    let street_1  = checkString(xss(req.body.street_1), "address.street_1");
    let street_2  = xss(req.body.street_2 || "").trim();
    let city      = checkString(xss(req.body.city), "address.city");
    let state     = checkString(xss(req.body.state), "address.state");
    let zip_code  = checkString(xss(req.body.zip_code), "address.zip_code");

    if (park_type !== "run" && park_type !== "off-leash") {
      throw "park_type must be 'run' or 'off-leash'.";
    }

    if (!/^[0-9]{5}$/.test(zip_code)) {
      throw "zip_code must be a 5-digit number.";
    }

    const address = { street_1, city, state, zip_code };
    if (street_2.length > 0) address.street_2 = street_2;
    
    //  update fields.
    await parksFunctions.updatePark(parkId, { park_name, park_type, address });

    // use session messaging like approve/deny so it survives redirect
    req.session.approveMessage = "Park updated successfully!";
    return res.redirect("/admin");
  } catch (e) {
    // If validation fails, re-render edit page with existing data + error
    try {
      const park = await parksFunctions.getParkById(req.params.parkId);
      return res.status(400).render("editPark", { park, error: e.toString()});
    } catch {
      req.session.approveError = e.toString();
      return res.redirect("/admin");
    }
  }
});

/*------------ Parks Admin Route Create ------------*/

router.post("/parks/create", async (req, res) => {
  try{
    let park_name=xss(req.body.park_name);
    let park_type = xss(req.body.park_type);
    let street_1 = xss(req.body.street_1);
    let street_2 = xss(req.body.street_2 || "");
    let city = xss(req.body.city);
    let state = xss(req.body.state);
    let zip_code = xss(req.body.zip_code);

    park_name = checkString(park_name, "park_name");
    park_type = checkString(park_type, "park_type");
    street_1 = checkString(street_1, "address.street_1");
    city = checkString(city, "address.city");
    state = checkString(state, "address.state");
    zip_code = checkString(zip_code, "address.zip_code");

    if(!/^[0-9]{5}$/.test(zip_code)){
      throw "zip_code must be a 5-digit number.";
    }
    street_2 = street_2.trim();

    const address = {
      street_1,
      city,
      state,
      zip_code
    };

    if(street_2.length > 0){
      address.street_2 = street_2;
    }

    const allParks = await parksFunctions.getAllParks(false);
    const newName = park_name.toLowerCase();
    const newStreet = street_1.toLowerCase();
    const newCity = city.toLowerCase();
    const newState = state.toLowerCase();
    const newZip = String(zip_code);
    
    let checkExists = false;

    for(let i = 0; i< allParks.length; i++){
      const p= allParks[i];
      if(!p.address){
        continue;
      }
      const existingName = p.park_name.toLowerCase();
      const existingStreet = p.address.street_1.toLowerCase();
      const existingCity = p.address.city.toLowerCase();
      const existingState = p.address.state.toLowerCase();
      const existingZip = String(p.address.zip_code);

      const nameCheck = existingName === newName;
      const sameStreet = existingStreet === newStreet;
      const sameCity = existingCity === newCity;
      const sameState = existingState === newState;
      const sameZip = existingZip === newZip;

      if(nameCheck && sameStreet && sameCity && sameState && sameZip){
        checkExists = true;
        break;
      }
    }

    if(checkExists){
      return res
        .status(400)
        .render("admin", {
          createParkError: "A park with that name already exists",
          bodyClass: "admin-body"
      });
    }

    const approved = true;
    const comments = [];
    const avg = 0;

    await parksFunctions.createPark(
      park_name,
      park_type,
      approved,
      comments,
      address,
      avg,
      avg,
      avg,
      avg,
      avg,
      avg,
      avg,
      avg
    );

    return res
      .status(200)
      .render("admin", {
        createParkMessage: "Park created!",
        bodyClass: "admin-body"
      });
  }catch(e){
    return res 
      .status(400)
      .render("admin", {
        createParkError: e.toString(),
        bodyClass: "admin-body"
      });
  }
});

/*------------ Parks Admin Route Delete ------------*/

router.post("/parks/delete", async (req, res)=>{
  try{
    let parkId = xss(req.body.parkId);
    parkId = checkString(parkId, "parkId");

    await parksFunctions.getParkById(parkId);

    await parksFunctions.deletePark(parkId);

    return res
      .status(200)
      .render("admin", {
        deleteParkMessage: "Park deleted successfully!",
        bodyClass: "admin-body"
      });
  }catch(e){
    return res  
      .status(400)
      .render("admin", {
        deleteParkError: e.toString(),
        bodyClass: "admin-body"
      });
  }
});

/*------------ Biscuit Admin Routes ------------*/

//POST /admin/biscuits/ --> Create new biscuit
router.route('/biscuits').post(async (req,res) => {
    try{
        let biscuit_name = xss(req.body.biscuit_name);
        let description = xss(req.body.description);

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
            return res.status(400).render('admin', {createError: 'A biscuit with the same name or description already exists.',
              bodyClass: "admin-body"
            });
        }

         // create new biscuit if no dups are found
        await biscuitsFunctions.createBiscuit(biscuit_name, description);
         console.log('Successfully created biscuit!');

        return res.status(200).render('admin', {createMessage: 'Biscuit created successfully!', bodyClass: "admin-body"});
    } catch (e) {
        return res.status(400).render('admin', {createError: e + ' biscuit_name and description are required to create a new biscuit.', bodyClass: "admin-body"});
    }
})

//POST /admin/biscuits/:biscuitId --> Update/edit biscuit
//Originally wrote this as patch, but realized it made the form hard to write. 
//So i changed it back to post but left the logic the same, which is why there are some
//extra checks for if a parameter exists
router.route('/biscuits/update').post(async(req, res)=>{
    try{
        let biscuitId = xss(req.body.biscuitId);
        let biscuit_name = xss(req.body.biscuit_name);
        let description = xss(req.body.description);

        //input validation check
        // Both fields are required; if either is missing, show an error
        if (!biscuit_name || !description) {
            return res.status(400).render('admin', {updateError: 'You must provide biscuit_name and description to update.', bodyClass: "admin-body"});
        }

        // Input validation
        biscuitId = checkString(biscuitId, 'biscuitId');
        // Throw error if the biscuit ID does not exist
        try {
          await biscuitsFunctions.getBiscuitById(biscuitId);
        } catch (err) {
          // data function throws if not found
          return res.status(400).render('admin', {updateError: 'That biscuit ID does not exist.', bodyClass: "admin-body"});
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
            return res.status(400).render('admin', {updateError: 'A biscuit with the same name or description already exists.', bodyClass: "admin-body"});
          }

          // No duplicate name or description, so build updated biscuit object
          //based on the input that was provided (bc this is patch one or both params
          //could have been given)
            const updateInfo = {};
            if (biscuit_name !== undefined) updateInfo.biscuit_name = biscuit_name;
            if (description !== undefined) updateInfo.description = description;

          const updateSuccessful = await biscuitsFunctions.updateBiscuit(biscuitId, updateInfo);
          console.log('Biscuit updated successfully!');
          return res.status(200).render('admin', {updateMessage: 'Biscuit updated successfully!', bodyClass: "admin-body"});
        }
    catch (e){
        return res.status(400).render('admin', {updateError: e, bodyClass: "admin-body"});
    }
});

// POST /admin/biscuits/delete --> delete biscuit by ID from form
router.route('/biscuits/delete').post(async (req, res) => {
    try {
      let biscuitId = xss(req.body.biscuitId);
  
      //input validation
      biscuitId = checkString(biscuitId, 'biscuitId');

      // will throw if ID is invalid or biscuit not found
      await biscuitsFunctions.getBiscuitById(biscuitId); //throws error if biscuit id does not exist
      await biscuitsFunctions.deleteBiscuitById(biscuitId);
  
      console.log('Successfully deleted biscuit!');
  
      // Option 1: render admin page with a success message
      return res.status(200).render('admin', {deleteMessage: 'Biscuit deleted successfully!', bodyClass: "admin-body"});
    } catch (e) {
      return res.status(400).render('admin', {deleteError: e, bodyClass: "admin-body"});
    }
  });


export default router;
