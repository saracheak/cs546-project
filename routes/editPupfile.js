import {Router} from 'express';
const router = Router();
import { usersFunctions } from '../data/users.js';
import { parks, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validator from 'validator';

const parksCollection = await parks();
const usersCollection = await users();

router.get("/", async (req, res) => {
    console.log("/GET editpupfile");
    const userId = req.session.userId;
    let user = await usersFunctions.getUser(userId);
    res.render("editPupfile", {user, selectedDogGender: user.dogGender, selectedHumanGender: user.humanGender, times: user.times || []});
});

router.post("/", async (req, res) => {
    try {
        const updateInfo = req.body;
        const userId = req.session.userId;

        await checkUpdateInfo(userId, updateInfo);
        await usersFunctions.updateUser(userId, updateInfo);

        res.redirect("/profile");
    } catch (error) {
        const body = req.body;

        res.status(404).render("editPupfile", {
            error: error.message,
            formData: body,
            selectedDogGender: body.dogGender,
            selectedHumanGender: body.humanGender,
            times: body.times || []
        });
    }
});


//Route Validation
const checkUpdateInfo = async (userId, updateInfo) =>{
    try {
        console.log("/post on editpupfile, here's what user inputted", updateInfo);
        let {dogName, humanFirstName, humanLastName, dogGender, humanGender, times, petFriends} = updateInfo;
        checkName(dogName, "dog name");
        checkName(humanFirstName, "human first name");
        checkName(humanLastName, "human last name");
        checkGender(dogGender);
        checkGender(humanGender);
        // checkFavoriteParks(favoriteParks);
        // checkTimes(times);
        // checkPetFriends(petFriends);
        // checkParksVisited(parksVisited);
        return true;
    } catch (e) {
        throw new Error(e.message);
    }
}

const checkName = (name, field) => {
    // console.log("name", name);
    if(typeof name !== "string") throw new Error(`${field} has to be type string`);
    name = name.trim();
    if(name.length < 2 || name.length > 40) throw new Error("Name has to be between 2-40 characters");
    if(!/^[a-zA-Z' -]+$/.test(name)) throw new Error("Name can only contain space, alphanumeric, ', -")
    return true;
}

const checkGender = (gender) => {
    if(typeof gender !== "string") throw new Error("Gender has to be type string");
    gender = gender.trim().toLowerCase();
    if(gender !== "male" && gender !== "female" && gender !== "non-binary" && gender !== "prefer not to say" && gender !== "other") throw new Error("Invalid Gender Input");
    return true;
}

// const checkTimes = (times) => {
//     if (!Array.isArray(times)) throw new Error("Times must be an array.");

//     const timeRegex = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

//     for (const t of times) {
//         if (typeof t !== "string") {
//             throw new Error("Each time range must be a string.");
//         }
//         if (!timeRegex.test(t)) {
//             throw new Error("Each time range is expected in this format: HH:MM-HH:MM.");
//         }
//     }

//     return true;
// };


// const checkPetFriends = (petFriends) => {
//     if (!Array.isArray(petFriends)) throw new Error("petFriends must be an array.");
// }


export default router;