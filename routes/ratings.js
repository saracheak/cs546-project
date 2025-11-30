import {Router} from 'express';

import { checkIdInRatings } from '../validation.js';
import { ratingsFunctions } from '../data/ratings.js';
import { parksFunctions } from '../data/parks.js';

console.log(
  'Ratings routes loaded. Testing hint: In MongoDB, find the park with park_name "Asser Levy Park" and copy its _id. ' +
  'Visit /parks/<that-parkId>/ratings and /parks/<that-parkId>/ratings/summary to verify that ratings and averages render correctly.'
);


const router = Router();
//console.log('>> routes/ratings.js loaded');

router.get('/:parkId/ratings', async (req, res) => {
  let parkId;
  console.log("routes/ratings.js has been loaded");

  try {
    parkId = checkIdInRatings(req.params.parkId, 'park_id');
    //console.log('route parkId =', parkId, 'typeof =', typeof parkId);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const ratings = await ratingsFunctions.getRatingsForPark(parkId);
     return res.json(ratings);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error: Can not fetch ratings for this park' });
  }
});

router.get('/:parkId/ratings/summary', async (req, res) => {
  let parkId;
  try {
    parkId = checkIdInRatings(req.params.parkId, 'park_id');
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const ratingSummary = await ratingsFunctions.getAverageRatingsForPark(parkId);
    return res.render('ratingSummary', {
      title: 'Rating Summary',
      ratingSummary//to handlebars
    }

    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Cannot fetch rating summary' });
  }
});

router.post('/:parkId/ratings', async (req, res) => {

  if (!req.session.user) {
    return res.status(401).json({ error: 'Login required' });
  }

  const userId = req.session.user._id;

  //vheck park id
  let parkId;
  try {
    parkId = checkIdInRatings(req.params.parkId, 'park_id');
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  //get rating data from body
  const {
    cleanliness,
    dog_friendliness,
    busyness,
    water_availability,
    wastebag_availability,
    trash_availability,
    surface,
    amenities,
    dog_size
  } = req.body;
  const ratingData = {
      user_id: userId,
      park_id: parkId,
      cleanliness,
      dog_friendliness,
      busyness,
      water_availability,
      wastebag_availability,
      trash_availability,
      surface,
      amenities,
      dog_size
    };

  try {
    const newRating = await ratingsFunctions.createRating(ratingData);
    const averages = await ratingsFunctions.getAverageRatingsForPark(parkId);
    
    await parksFunctions.updateAverageRatings(parkId, averages);

    return res.status(200).json({
      message: 'Rating created and park averages updated',
      rating: newRating,
      averages: averages
    });
  } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Cannot create rating or update averages' });
    }
});

export default router;