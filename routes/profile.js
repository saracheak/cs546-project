import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';
import {parks, biscuits} from '../config/mongoCollections.js';
import { biscuitsFunctions } from '../data/biscuits.js';
import { ObjectId } from 'mongodb';

const parksCollection = await parks();
const biscuitsCollection = await biscuits();

router.get("/", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const userId = req.session.userId;
    const user = await usersFunctions.getUser(userId);

    //since parks and friends are stored as IDs, convert first to their names
    const favoriteParks = await favoriteParksIdToName(await usersFunctions.getFavParks(userId));
    const parksVisited = await parksVisitedIDToName(await usersFunctions.getParksVisited(userId));

    //get biscuits and convert them to names
    const userBiscuits = await userBiscuitsIdToName(await biscuitsFunctions.getBiscuitsForUser(userId));
    
    //TODO: get ratings

    res.render("profile", { humanFirstName: user.humanFirstName, bio: user.bio, petFriends: user.petFriends, favParks: favoriteParks, times: user.times, parksVisited: parksVisited, userBiscuits: userBiscuits, bodyClass: "profile-body"});
});

const favoriteParksIdToName = async (favoriteParks) => {
    const favoriteParksByName = [];

    for (let parkId of favoriteParks) {
        parkId = new ObjectId(parkId);
        const park = await parksCollection.findOne({ _id: parkId });
        if (park) favoriteParksByName.push({_id: parkId, name: park.park_name});
    }

    return favoriteParksByName;
}


const parksVisitedIDToName = async (parksVisited) => {
    const parksVisitedByName = [];

    for (let parkId of parksVisited) {
        parkId = new ObjectId(parkId);
        const park = await parksCollection.findOne({ _id: parkId });
        if (park) parksVisitedByName.push({_id: parkId, name: park.park_name});
    }

    return parksVisitedByName;
}

const userBiscuitsIdToName = async (userBiscuits) => {
    const userBiscuitsByName = [];

    for (let biscuitId of userBiscuits) {
        biscuitId = new ObjectId(biscuitId);
        const biscuit = await biscuitsCollection.findOne({ _id: biscuitId });
        if (biscuit) userBiscuitsByName.push({_id: biscuitId, name: biscuit.biscuit_name});
    }

    return userBiscuitsByName;
}

export default router;