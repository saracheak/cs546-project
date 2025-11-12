//this file is for collating all routes for our data files

const constructorMethod = (app) => {
//   app.use('/parks', parksRoutes);
//   app.use('/users', userRoutes);
//   app.use('/biscuits', biscuitsRoutes);
//   app.use('/ratings', ratingsRoutes);

  app.use(/(.*)/, (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

export default constructorMethod;