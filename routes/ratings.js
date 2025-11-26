import {Router} from 'express';

import { checkId } from '../validation.js';
import { ratingsFunctions } from '../data/ratings.js';

const router = Router();
console.log('>> routes/ratings.js loaded');

router.get('/:id/ratings', async (req, res) => {
  let parkId;
  console.log("routes/ratings.js has been loaded");

  try {
    parkId = checkId(req.params.id, 'park_id');
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

export default router;