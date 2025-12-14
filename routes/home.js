import {Router} from 'express';
import {parksFunctions} from '../data/parks.js';
import {usersFunctions} from '../data/users.js';
//import {biscuitsFunctions} from '../data/biscuits.js';
import { ObjectId } from "mongodb";

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


//---------- After searching for an existing park on the homepage, this returns the peak time(s) from users 
// who have this park stored as a favorited park. User's need to have favorite times and parks for this to give results.
// This logic accounts for ties in peak times. Note: the favoritePark index does not correspond to the times index for a user. 
// So this is more of an approximation of peak park times. ----------//

const usersCollection = await users(); //get all users
let parkName = matchedPark.park_name.trim(); //favoriteParks stores the name of each park as a string
const userDocs = await usersCollection
  .find({ favoriteParks: parkName}) //find all users with the specific park that was searched for in their favoriteParks array
  .project({ times: 1 }) // only pull the times array from those users
  .toArray();

  console.log(userDocs);

<<<<<<< HEAD
// userDocs consists of the user id and times like [{_id:..., times: [9:00-10:00, 13:00-14:00]}, {_id:..., times: [2:00-4:00]}] etc. 
// Count the number of times a specific time interval (like 9:00-10:00) is mentioned in the times in userDocs
const timeCounts = {};
for (const u of userDocs) { 
  if (!Array.isArray(u.times)) continue; //extra safety guard. if user does not have any times program won't crash
  for (let t of u.times) { //iterate through times to fill timeCounts with key = time and value = count
    if (!t) continue; //if the specific times array is empty then check the next one
    timeCounts[t] = (timeCounts[t] || 0) + 1; //add 1 to the count for a specific time
=======
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
>>>>>>> origin
  }
}
console.log(timeCounts);

// Determine busiest time(s) by updating these variables as we iterate through all of the timeCounts. 
//the time(s) that are mentioned the most (maxCount) with be the peakTime(s) that we return to the user
let peakTimes = [];
let maxCount = 0;

for (const [t, count] of Object.entries(timeCounts)) { //t is the time interval (i.e. 9:00-10:00), count is how many times it appeared in userDocs 
  if (count > maxCount) {
    maxCount = count;
    peakTimes = [t];          //when new peak time is found (new max count found), replace the old list with the new peak time
  } else if (count === maxCount) {
    peakTimes.push(t);        // if there is a tie between max counts, then add the new time for that max count to the existing list
  }
}
//sort times so output is pretty and in order
peakTimes.sort();

//Render home with search results
return res.status(200).render('home', {
  searchQuery: parkQuery,
  parkFound: true,
  park: matchedPark,
  parkLink: `/parks/${matchedPark._id}`,
  peakTimes,
  peakTimeCount: maxCount
});
} catch (e) {
return res.status(400).render('error', {message: e.toString()});
}
});

export default router;