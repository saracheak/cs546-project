import {Router} from 'express';
import {parksFunctions} from '../data/parks.js';
import {usersFunctions} from '../data/users.js';
import { users } from "../config/mongoCollections.js"
//import {biscuitsFunctions} from '../data/biscuits.js';

import { checkString } from '../validation.js';
import xss from 'xss';
const router = Router();

router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
      res.render("home");
    } catch (e) {
      res.status(404).render("error", {message: "Bad Request"});
    }
  });

//for the search bar added to home page
router.route('/search').get(async (req, res) => {
  try {
    //get the park name the user typed in
    let parkQuery = xss(req.query.parkQuery || '');
    parkQuery = checkString(parkQuery, 'Park Query');

    if (!parkQuery) {
      return res.status(400).render('home', {searchQuery: '', parkFound: false, searchError: 'You must enter a park name to search.'});
    }

    // find the park by name from approved parks
    const allParks = await parksFunctions.getAllParks(true);
    const matchedPark = allParks.find((p) => p.park_name.trim().toLowerCase() === parkQuery.toLowerCase());

    // If no park found, give user 'submit new park link' to form to submit a new park
    if (!matchedPark) return res.status(200).render('home', {searchQuery: parkQuery, parkFound: false});


//---------- TODO - figure out how to get peak time bc this isnt working. will have to likely seed times and parks to do this ----------//
    // If park found find all users whose favorite_park include this park name 
    // and then find peak time from users who like this park
    // const usersCollection = await users(); 
    // const userDocs = await usersCollection
    //   .find({ favorite_parks: matchedPark.park_name })
    //   .toArray();

  
    // //Count time intervals across those users
    // const timeCounts = {};
    // for (const u of userDocs) {
    //   if (!Array.isArray(u.times)) continue;

    //   for (let t of u.times) {
    //     if (!t) continue;
    //     t = t.trim();
    //     if (!t) continue;

    //     timeCounts[t] = (timeCounts[t] || 0) + 1;
    //   }
    // }

    // //Determine the single peak time (if any)
    // let peakTime = null;
    // let maxCount = 0;
    // for (const [t, count] of Object.entries(timeCounts)) {
    //   if (count > maxCount) {
    //     maxCount = count;
    //     peakTime = t;
    //   }
    // }

    //Render home with search results
    return res.status(200).render('home', {
      searchQuery: parkQuery,
      parkFound: true,
      park: matchedPark,
      parkLink: `/parks/${matchedPark._id}`,
      //peakTime
    });
  } catch (e) {
    return res.status(400).render('error', {message: e.toString()});
  }
});

  export default router;