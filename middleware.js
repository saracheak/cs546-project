import {usersFunctions} from './data//users.js';

//this will run for every request and called in app.js with app.use(neededStats). 
//this way every handlebars template 


//require that a user is an Admin to access certain routes 
//this middleware will be used on routes/admin.js
export const requireAdmin = async (req, res, next) => {
    try{
        if(!req.session.userId){
            return res.status(400).render("error", {error: "You must be logged in as an admin to access this page."});
        }

        const user = await usersFunctions.getUser(req.session.userId);
        if (!user || user.role !== "admin") { 
            return res.status(400).render("error", {error: "You don't have permission to access this page."});
        }

        // ensure locals are in sync
        res.locals.userId = userId;
        res.locals.currentUser = user;
        res.locals.isLoggedIn = true;
        res.locals.currentUserRole = user.role;
        res.locals.isAdmin = true;

        next();
  } catch (e) {
    console.error("requireAdmin error:", e);
    return res.status(500).render("error", { error: e.toString() });
  }
}