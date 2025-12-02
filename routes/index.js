//this file is for collating all routes for our data files
import parksRoutes from "./parks.js";
import profileRoutes from './profile.js'
import loginRoutes from './login.js'
import signupRoutes from './signup.js'
import ratingRoutes from './ratings.js'
import editPupfileRoutes from "./editPupfile.js";
import homeRoutes from "./home.js";
import biscuitsRoutes from "./biscuits.js";

const constructorMethod = (app) => {
  app.use('/parks', parksRoutes);
  app.use('/profile', profileRoutes);
  app.use('/login', loginRoutes);
  app.use('/signup', signupRoutes);
  app.use('/parks', ratingRoutes); 
  app.use('/editPupfile', editPupfileRoutes);
  app.use('/home', homeRoutes);
  app.use('/biscuits', biscuitsRoutes);
  
  app.use(/(.*)/, (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

export default constructorMethod;
