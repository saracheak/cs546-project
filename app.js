import express from 'express';
import exphbs from 'express-handlebars'
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import 'dotenv/config';

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  session({
    name: 'PupMap',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 3600000}
  })
);

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  helpers: { 
    includes: (arr, value) => { //helper function used in biscuits.handlebars to verify if biscuits user has earned
      if (!Array.isArray(arr)) return false;
      return arr.includes(value);
    }
  }}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(async (req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});