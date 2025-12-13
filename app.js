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
import { ratingsFunctions } from './data/ratings.js';
import { parksFunctions } from './data/parks.js';
import { users, parks } from './config/mongoCollections.js';

//test 1
const testUser = await usersFunctions.createUser("doggie", "human", "smith", "male", "male", "dogman@gmail.com", "Test123$", "user", [], [], [], [], [], []);
console.log(testUser); //returns userId

const usersCol = await users();
const parksCol = await parks();
const email = "dogman@gmail.com";
const parkName = "Asser Levy Park";

const user = await usersCol.findOne({ email: email });
if (!user) throw "User not found";

const park = await parksCol.findOne({ park_name: parkName });
console.log("user =", user);
if (!park) throw "Park not found";

const testUserRatings = await ratingsFunctions.createRating({
  user_id: user._id.toString(),
  park_id: park._id.toString(),
  overall: 4,
  cleanliness: 4,
  dog_friendliness: 5,
  busyness: 4,
  water_availability: 4,
  wastebag_availability: 4,
  trash_availability: 5,
  surface: 4,
  amenities: 5,
  comment: "Really clean and lots of space for dogs.",
  dog_size: "medium"
});    
console.log(testUserRatings)
//2
const testUser2 = await usersFunctions.createUser("first", "fran", "Sally", "male", "male", "first@gmail.com", "First123$", "user", [], [], [], [], [], []);
console.log(testUser2); //returns userId
const usersCol2 = await users();
const parksCol2 = await parks();
const email2 = "first@gmail.com";
const parkName2 = "Asser Levy Park";
const user2 = await usersCol2.findOne({ email: email2 });
if (!user2) throw "User not found";

const park2 = await parksCol2.findOne({ park_name: parkName2 });
console.log("user =", user);
if (!park2) throw "Park not found";


const testUserRatings2 = await ratingsFunctions.createRating({
  user_id: user2._id.toString(),
  park_id: park2._id.toString(),
  overall: 4,
  cleanliness: 4,
  dog_friendliness: 5,
  busyness: 5,
  water_availability: 4,
  wastebag_availability: 4,
  trash_availability: 4,
  surface: 4,
  amenities: 4,
  comment: "We alaways come here and it's a popular park! People here are dog friengdly and the amenities are great.",
  dog_size: "small"
});    
console.log(testUserRatings2)

//test 3
const testUser3 = await usersFunctions.createUser("three", "Larryn", "lyn", "female", "male", "three@gmail.com", "Three123$", "user", [], [], [], [], [], []);
console.log(testUser3); //returns userId
const usersCol3 = await users();
const parksCol3= await parks();
const email3 = "three@gmail.com";
const parkName3 = "Brooklyn Bridge Park";
const user3 = await usersCol3.findOne({ email: email3 });
if (!user3) throw "User not found";

const park3 = await parksCol3.findOne({ park_name: parkName3 });
console.log("user =", user3);
if (!park3) throw "Park not found";
console.log("park3 id =", park3._id.toString(), "name =", park3.park_name);



const testUserRatings3 = await ratingsFunctions.createRating({
  user_id: user3._id.toString(),
  park_id: park3._id.toString(),
  overall: 3,
  cleanliness: 4,
  dog_friendliness: 4,
  busyness: 3,
  water_availability: 3,
  wastebag_availability: 3,
  trash_availability: 4,
  surface: 3,
  amenities: 4,
  comment: "I wish there's more wastebag and water",
  dog_size: "large"
});    
console.log(testUserRatings3)
// update averages for Asser Levy
const avg1 = await ratingsFunctions.getAverageRatingsForPark(park._id.toString());
console.log("Asser avg =", avg1);
// update averages for Brooklyn Bridge Park
const avg3 = await ratingsFunctions.getAverageRatingsForPark(park3._id.toString());
console.log("Brooklyn avg =", avg3);
// verify parks were updated
const updatedPark1 = await parksFunctions.getParkById(park._id.toString());
console.log("Asser overall =", updatedPark1.average_overall);

const updatedPark3 = await parksFunctions.getParkById(park3._id.toString());
console.log("Brooklyn overall =", updatedPark3.average_overall);

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
