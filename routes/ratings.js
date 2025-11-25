import {Router} from 'express';

import { checkId } from '../validation.js';
import { createRating, getRatingsForPark } from '../data/ratings.js';

const router = Router();

router.get('/:id/ratings', async (req, res) => {
  let parkId;
  try {
    parkId = checkId(req.params.id, 'Park ID');
  } catch (e) {
    return res.status(400).json({ error: e });
  }
  try {
    const ratings = await getRatingsForPark(parkId);
     return res.json(ratings);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error: Can not fetch ratings for this park' });
  }
});

export default router;