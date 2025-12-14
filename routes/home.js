import {Router} from 'express';
import {parksFunctions} from '../data/parks.js';
import {usersFunctions} from '../data/users.js';
//import {biscuitsFunctions} from '../data/biscuits.js';

import { checkString } from '../validation.js';
import xss from 'xss';
const router = Router();

router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
      //get top parks for "top 10 parks" section
      const topParks = await parksFunctions.getTopRatedParks(10);
      topParks.forEach(p => {
        if (p.average_overall !== undefined && p.average_overall !== null) {
          p.average_overall = Number(p.average_overall).toFixed(2);
        }
      });
      const isLoggedIn = !!req.session.userId;
      let currentUser = null;

      if (isLoggedIn) {
        currentUser = await usersFunctions.getUser(req.session.userId);
      }

      res.render('home', {
        title: 'Home',
        topParks,
        isLoggedIn,
        currentUser,
        bodyClass: "home-body"
      });
    } catch (e) {
      res.status(404).render("error", {message: "Bad Request", bodyClass: "error-page"});
    }
  });

//for the search bar added to home page
router.route('/search').get(async (req, res) => {
  try {
    //get the park name the user typed in
    let parkQuery = xss(req.query.parkQuery || '');
    parkQuery = checkString(parkQuery, 'Park Query');

    if (!parkQuery) {
      return res.status(400).render('home', {searchQuery: '', parkFound: false, searchError: 'You must enter a park name to search.', bodyClass: "home-body"});
    }

    // find the park by name from approved parks
    const allParks = await parksFunctions.getAllParks(true);
    const matchedPark = allParks.find((p) => p.park_name.trim().toLowerCase() === parkQuery.toLowerCase());

    // If no park found, give user 'submit new park link' to form to submit a new park
    if (!matchedPark) return res.status(200).render('home', {searchQuery: parkQuery, parkFound: false, bodyClass: "home-body"});


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
      bodyClass: "home-body"
      //peakTime
    });
  } catch (e) {
    return res.status(400).render('error', {message: e.toString(), bodyClass: "error-page"});
  }
});

export default router;