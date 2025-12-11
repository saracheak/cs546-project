import {usersFunctions} from './data//users.js';

/*attachUserToLocals will run for every request and called in app.js with app.use(attachUserToLocals). 
this way every handlebars template will have access to these features without it having to be 
explicitly passed each time. 
res.locals passes data to views/middleware 
*/

// Attach user info to res.locals value so that they are automatically passed to all views/handlebars/views
export const attachUserToLocals = async (req, res, next) => {
    //default values that will pass to handlebars files automatically 
    res.locals.isLoggedIn = false;
    res.locals.isAdmin = false;
    res.locals.currentUser = null;
    res.locals.userId = null;

    try{
        if(!req.session.userId){ //if user is not logged in then move to next middleware (we don't have anything else though) so next() lets guests view public pages
            return next();
        }

        // look up the user by id from the session
        const user = await usersFunctions.getUser(req.session.userId);
        //update existing user locals values
        res.locals.isLoggedIn = true;
        res.locals.isAdmin = user.role === 'admin'; //if user.role is admin, res.locals.isAdmin will become true
        res.locals.currentUser = user; //allows us to access specific parts of the object in the handlebars functions very easily(e.g currentUser.humanFirstName)
        res.locals.userId = req.session.userId; 
        return next();
    }
    catch(e){
        console.log('attachUserLocals middleware error:', e);
        // if something breaks, just treat it as the user being logged out to prevent the program from crashing
        req.session.userId = undefined;
        res.locals.isLoggedIn = false;
        res.locals.isAdmin = false;
        return next();
    }
  };

//require that a user is an Admin to access certain routes 
//this middleware will be used on every route in routes/admin.js 
export const requireAdmin = (req, res, next) => {
    if (!res.locals.isLoggedIn || !res.locals.isAdmin) {
      return res.status(400).render('error', {message: 'You must be an admin to view this page.' });
    }
    return next();
  };


// NEEDS TO BE TESTED BY THE DEVELOPERS WORKING ON COMMENTS AND RATINGS
// // Created middleware for if login is required in case we need it.
// //I think it will will be needed to leave comments or ratings but not sure
// //To use in the route that require the user to be logged in:
// //1. import { requireLogin } from "../middleware.js"; at the top of the file 
// //2. at the top of the route function add router.use(requireLogin)
// //Refer to the top of route/admin.js to see how I imported and used the middleware there. 
// export const requireLogin = (req, res, next) => {
//     if (!req.session.userId) {
//         return res.status(401).render("error", {error: "You must be logged in to access this page."});
//     }
//     next();
// };