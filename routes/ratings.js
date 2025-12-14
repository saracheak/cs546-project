import {Router} from 'express';

import { checkString, checkIdInRatings } from '../validation.js';
import { ratingsFunctions } from '../data/ratings.js';
import { parksFunctions } from '../data/parks.js';
import xss from 'xss';


const router = Router();

router.get('/:parkId/ratings', async (req, res) => {
  let parkId;
  console.log("routes/ratings.js has been loaded");

  try {
    parkId = checkIdInRatings(req.params.parkId, 'park id');
  } catch (e) {
    return res.status(400).render('error', { error: e.toString() });
  }

  const userId = req.session.userId;
  if (!userId) {
    return res
      .status(401)
      .render('error', { error: 'You must be logged in to leave a rating.' });
  }
  try {
    const existing = await ratingsFunctions.getUserRatingForPark(parkId, req.session.userId);
    if (existing) {
      return res.status(200).render('ratingForm', {
        title: 'Rating',
        parkId,
        cannotRate: true,
        existingRating: existing,
        bodyClass: "home-body"
      });
    }
    return res.status(200).render('ratingForm', {
      title: 'Rating',
      parkId,
      cannotRate: false,
      bodyClass: "home-body"
    });
    }catch (e) {
    console.error(e);
    return res.status(500).render('error', { error: e.toString(), bodyClass: "error-page" });
  }
});

router.post('/:parkId/ratings', async (req, res) => {
  let parkId;

  try {
    parkId = checkIdInRatings(req.params.parkId, 'park id');
  } catch (e) {
    return res.status(400).render('error', { error: e.toString(), bodyClass: "error-page" });
  }

  const currentUserId = req.session.userId;   
  if (!currentUserId) {
    return res
      .status(401)
      .render('error', { error: 'You must be logged in to leave a rating.', bodyClass: "error-page" });
  }
  try {
    const existing = await ratingsFunctions.getUserRatingForPark(parkId, req.session.userId);
    if (existing) {
      return res.status(400).render('ratingForm', {
        title: 'Rating',
        parkId:parkId,
        user_id:currentUserId,
        cannotRate: true,
        existingRating: existing,
        error: 'You have already rated this park.',
        bodyClass: "home-body"
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

    let { dog_size } = req.body;
    dog_size = checkString(dog_size, "dog size");
    
    await ratingsFunctions.createRating({
      parkId:parkId,
      user_id: req.session.userId,
      cleanliness,
      dog_friendliness,
      busyness,
      water_availability,
      wastebag_availability,
      trash_availability,
      surface,
      amenities,
      comment,
      dog_size
    });

    // const ratings = await ratingsFunctions.getRatingsForPark(parkId);
    //  return res.json(ratings);
    return res.redirect(`/parks/${parkId}`);

  } catch (e) {
    console.error(e);
    return res.status(400).render('ratingForm', {
      title: 'Rating',
      parkId,
      cannotRate: false,
      error: e.toString(),
      formData: req.body,
      bodyClass: "home-body"
    });
  }
});

router.get('/:parkId/ratings/new', async (req, res) => {

  const parkId = checkIdInRatings(req.params.parkId, 'parkId');

  const currentUserId = req.session.userId;
  if (!currentUserId) {
    return res.status(401).render('error', { error: 'You must be logged in to leave a rating.', bodyClass: "error-page" });
  }

  const existing = await ratingsFunctions.getUserRatingForPark(parkId, req.session.userId);
  if (existing) {
    return res.status(200).render('ratingForm', {
      title: 'Rating',
      parkId:parkId,
      cannotRate: true,
      existingRating: existing,
      bodyClass: "home-body"
    });
  }
  return res.status(200).render('ratingForm', {
    title: 'Rating',
    parkId,
    cannotRate: false,
    bodyClass: "home-body"
  });
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