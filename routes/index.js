//this file is for collating all routes for our data files
import parksRoutes from "./parks.js";
import profileRoutes from './profile.js'
import loginRoutes from './login.js'
import signupRoutes from './signup.js'
import editPupfileRoutes from "./editPupfile.js";
import homeRoute from "./home.js";
import biscuitsRoutes from "./biscuits.js";
import logoutRoutes from "./logout.js"

const constructorMethod = (app) => {
  app.use('/profile', profileRoutes);
  app.use('/login', loginRoutes);
  app.use('/signup', signupRoutes);
  app.use("/editPupfile", editPupfileRoutes);
  app.use('/biscuits', biscuitsRoutes);
  app.use('/logout', logoutRoutes);
  app.use("/parks", parksRoutes);
  app.use('/home', homeRoute);

  app.use(/(.*)/, (req, res) => {
    res.redirect('/home');
  });
};

export default constructorMethod;
