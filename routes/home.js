import {Router} from 'express';
import {parksFunctions} from '../data/parks.js';
import {usersFunctions} from '../data/users.js';
//import {biscuitsFunctions} from '../data/biscuits.js';
const router = Router();

router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
      res.render("home");
    } catch (e) {
      res.status(404).render("error", {message: "Bad Request"});
    }
  });

  export default router;