import express from 'express';
import exphbs from 'express-handlebars';
import session from 'express-session';
import configRoutes from './routes/index.js';
import path from 'path';
import 'dotenv/config';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import { create } from 'express-handlebars';
import cookieParser from 'cookie-parser';
import { attachUserToLocals } from './middleware.js';
import { usersFunctions } from './data/users.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
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

const hbs = create({
  defaultLayout: 'main',
  helpers: { 
    includes: (arr, value) => { //helper function used in biscuits.handlebars to verify if biscuits user has earned
      if (!Array.isArray(arr)) return false;
      return arr.includes(value);
    }
}});
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//Runs for every request and automatically passes isLoggedIn, isAdmin, currentUser, and userId to handlebars
//For every request, automatically sets res.locals.userId = req.session.userId that was previously listed in app.js
app.use(attachUserToLocals);
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
