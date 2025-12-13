import {Router} from 'express';

import { checkId, checkIdInRatings } from '../validation.js';
import { ratingsFunctions } from '../data/ratings.js';
import { parksFunctions } from '../data/parks.js';

const router = Router();

router.get('/:parkId/ratings', async (req, res) => {
  let parkId;
  console.log("routes/ratings.js has been loaded");

  try {
    parkId = checkIdInRatings(req.params.parkId, 'parkId');
  } catch (e) {
    return res.status(400).render('error', { error: e.toString() });
  }

  const user = req.session.user;
  if (!user) {
    return res
      .status(401)
      .render('error', { error: 'You must be logged in to leave a rating.' });
  }
  try {
    const existing = await ratingsFunctions.getUserRatingForPark(parkId, user._id);
    if (existing) {
      return res.status(200).render('ratingForm', {
        title: 'Rating',
        parkId,
        cannotRate: true,
        existingRating: existing
      });
    }
    return res.status(200).render('ratingForm', {
      title: 'Rating',
      parkId,
      cannotRate: false
    });
    }catch (e) {
    console.error(e);
    return res.status(500).render('error', { error: e.toString() });
  }
});

router.post('/:parkId/ratings', async (req, res) => {
  let parkId;

  try {
    parkId = checkId(req.params.parkId, 'park id');
  } catch (e) {
    return res.status(400).render('error', { error: e.toString() });
  }

  const user = req.session.user;
  if (!user) {
    return res
      .status(401)
      .render('error', { error: 'You must be logged in to leave a rating.' });
  }
  try {
    const existing = await ratingsFunctions.getUserRatingForPark(parkId, user._id);
    if (existing) {
      return res.status(400).render('ratingForm', {
        title: 'Rating',
        parkId,
        cannotRate: true,
        existingRating: existing,
        error: 'You have already rated this park.'
      });
    }
    let {
      overall,
      cleanliness,
      dog_friendliness,
      busyness,
      water_availability,
      wastebag_availability,
      trash_availability,
      surface,
      amenities,
      comment
    } = req.body;

    const parseScore = (v, name) => {
      const num = Number(v);
      if (!Number.isInteger(num) || num < 0 || num > 5) {
        throw `${name} must be an integer between 0 and 5`;
      }
      return num;
    };

    overall = parseScore(overall, 'Overall');
    cleanliness = parseScore(cleanliness, 'Cleanliness');
    dog_friendliness = parseScore(dog_friendliness, 'Dog friendliness');
    busyness = parseScore(busyness, 'Busyness');
    water_availability = parseScore(water_availability, 'Water availability');
    wastebag_availability = parseScore(wastebag_availability, 'Wastebag availability');
    trash_availability = parseScore(trash_availability, 'Trash availability');
    surface = parseScore(surface, 'Surface');
    amenities = parseScore(amenities, 'Amenities');

    if (typeof comment !== 'string') throw 'Comment must be a string';
    comment = xss(comment.trim());
    if (!comment) throw 'Comment cannot be empty';

    const newRating = await ratingsFunctions.createRating({
      parkId: park._id,
      userId: user._id,
      overall,
      cleanliness,
      dog_friendliness,
      busyness,
      water_availability,
      wastebag_availability,
      trash_availability,
      surface,
      amenities,
      comment
    });

    const ratings = await ratingsFunctions.getRatingsForPark(parkId);
     return res.json(ratings);
  } catch (e) {
    console.error(e);
    return res.status(400).render('ratingForm', {
      title: 'Rating',
      parkId,
      cannotRate: false,
      error: e.toString(),
      formData: req.body
    });
  }
});

router.get('/:parkId/ratings/summary', async (req, res) => {
  let parkId;
  try {
    parkId =checkIdInRatings(req.params.parkId, 'parkId');
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    //const ratingList = await ratingsFunctions.getRatingsForPark(parkId);
    const ratingSummary = await ratingsFunctions.getAverageRatingsForPark(parkId);
    return res.redirect(`/parks/${parkId}`);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Cannot fetch rating summary' });
  }
});

export default router;