//this file is for collating all routes for our data files
import parksRoutes from "./parks.js";
import profileRoutes from './profile.js'
import loginRoutes from './login.js'
import signupRoutes from './signup.js'
import ratingRoutes from './ratings.js'
import editPupfileRoutes from "./editPupfile.js";

console.log('>>> constructorMethod called');
const constructorMethod = (app) => {
  app.use('/profile', profileRoutes);
  app.use('/login', loginRoutes);
  app.use('/signup', signupRoutes);
  app.use('/parks', ratingRoutes); 
  app.use("/editPupfile", editPupfileRoutes);

//   app.use('/users', userRoutes);
//   app.use('/biscuits', biscuitsRoutes);

  app.use("/parks", parksRoutes);

  app.use(/(.*)/, (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

export default constructorMethod;
