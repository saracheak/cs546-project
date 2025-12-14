import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js"
import { parksFunctions } from "./parks.js";
import bcrypt from 'bcryptjs';
import validator from "validator";
import { biscuitsFunctions } from "./biscuits.js";

const usersCollection = await users();

export const usersFunctions = {
    async createUser(dogName, humanFirstName, humanLastName, dogGender, humanGender, email, password, 
        bio, role, favoriteParks, times, ratings, petFriends, biscuits, parksVisited){
        try{
            //Validations
            checkName(dogName);
            checkName(humanFirstName);
            checkName(humanLastName);
            checkGender(dogGender);
            checkGender(humanGender);
            await checkEmail(email);
            checkPassword(password);
            checkBio(bio);
            checkRole(role);
            checkFavoriteParks(favoriteParks);
            checkTimes(times);
            checkRatings(ratings);
            checkPetFriends(petFriends);
            checkBiscuits(biscuits);
            checkParksVisited(parksVisited);
        } catch(e){
            throw new Error(e.message);
        }

        //hash password
        let hashedPassword = password;
        try{
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        } catch(e){
            throw new Error("Error occured while salting password");
        }

        //sanitize all text inputs before adding to db
        try {
            dogName = validator.escape(dogName);
            humanFirstName = validator.escape(humanFirstName);
            humanLastName = validator.escape(humanLastName);
            bio = validator.escape(bio);
        } catch (error) {
            console.log("error with santising fields", error);
        }
        
        try{
            let userObj = { 
                _id: new ObjectId(),
                dogName: dogName,
                humanFirstName: humanFirstName,
                humanLastName: humanLastName,
                dogGender: dogGender,
                humanGender: humanGender,
                email: email,
                hashedPassword: hashedPassword,
                bio: bio,
                role: role,
                favoriteParks: favoriteParks,
                times: times,
                ratings: ratings,
                petFriends: petFriends,
                biscuits: biscuits,
                parksVisited: parksVisited
            };
        
            const insertInfo = await usersCollection.insertOne(userObj);
            if (!insertInfo.acknowledged || !insertInfo.insertedId){
                throw new Error("Could not add user");
            }
            return insertInfo.insertedId;
        } catch(e){
            throw new Error(e);
        }
    },

    async getUser(userId){
        try {
            if(!checkId(userId)) throw new Error("userId is not a valid ObjectId");
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            if(!user) throw new Error("Could not find user with that userId");
            return user;
        } catch (e) {
            throw new Error(e);
        }
    },

    async updateUser(userId, updateInfo){
        try {
            if(!checkId(userId)) throw new Error("userId is not a valid ObjectId");

            let updatedUser = await usersCollection.findOneAndUpdate({_id: new ObjectId(userId)},
            {$set: {
                dogName: updateInfo.dogName,
                humanFirstName: updateInfo.humanFirstName,
                humanLastName: updateInfo.humanLastName,
                dogGender: updateInfo.dogGender,
                humanGender: updateInfo.humanGender,
                bio: updateInfo.bio,
                times: updateInfo.times,
                petFriends: updateInfo.petFriends,
            }},
            {returnNewDocument : true});
            
            if(!updatedUser) throw new Error("Ran into error while updating user with that userId");
            await biscuitsFunctions.autoAwardBiscuits(userId); //autoupdate pet friends + times biscuits
            return updatedUser;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getBiscuits(userId){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let biscuits = user.biscuits;
            return biscuits;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getPetFriends(userId){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let petFriends = user.petFriends;
            return petFriends;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getFavParks(userId){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let favParks = Array.isArray(user.favoriteParks) ? user.favoriteParks : [];
            return favParks;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getTimes(userId){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let times = user.times;
            return times;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getParksVisited(userId){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let parksVisited = user.parksVisited;
            return parksVisited;
        } catch (e) {
            throw new Error(e);
        }
    }
}

const checkName = (name) => {
    if(typeof name !== "string") throw new Error("Name has to be type string");
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

const checkEmail = async (email) => {
    let isValidEmail = validator.isEmail(email);
    let emailRegex = new RegExp(email, "i");
    let emailInDb = await usersCollection.findOne({email: emailRegex});
    if(emailInDb) throw new Error("This email is already taken. Login instead.");
    if(!isValidEmail) throw new Error("The email entered is not valid.");
    return true;
}

const checkPassword = (password) => {
    if(typeof password !== "string") throw new Error("Password has to be type string");
    password = password.trim();
    if(password.length < 8 || password.length > 20) throw new Error("Password has to be between 8-20 characters");

    //1 lowercase, 1 uppercase, 1 number, 1 special character respectively
    const strongPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");
    if(!strongPasswordRegex.test(password)) throw new Error("Password must have at least 1 lowercase, 1 uppercase, 1 number and 1 special character");
    return true;
}

const checkBio = (bio) => {
    if(typeof bio !== "string") throw new Error("Bio has to be type string");
    bio = bio.trim();
    if(bio.length > 100) throw new Error("Bio has to be <100 characters");
    return true;
}

const checkRole = (role) => {
    if(typeof role !== "string") throw new Error("Role has to be type string");
    role = role.trim();
    if(role !== "user" && role !== "admin") throw new Error("Role can only be user or admin");
    return true;
}

const checkFavoriteParks = (favoriteParks) => {
    if(!Array.isArray(favoriteParks)) throw new Error("favoriteParks must be an array");
    if(favoriteParks.length !== 0) throw new Error("favoriteParks is not an empty array");
    return true;
}

const checkTimes = (times) => {
    if(!Array.isArray(times)) throw new Error("times must be an array");
    if(times.length !== 0) throw new Error("times is not an empty array");
    return true;
}

const checkRatings = (ratings) => {
    if(!Array.isArray(ratings)) throw new Error("ratings must be an array");
    if(ratings.length !== 0) throw new Error("ratings is not an empty array");
    return true;
}

const checkPetFriends = (petFriends) => {
    if(!Array.isArray(petFriends)) throw new Error("petFriends must be an array");
    if(petFriends.length !== 0) throw new Error("petFriends is not an empty array");
    return true;
}

const checkBiscuits = (biscuits) => {
    if(!Array.isArray(biscuits)) throw new Error("biscuits must be an array");
    if(biscuits.length !== 0) throw new Error("biscuits is not an empty array");
    return true;
}

const checkParksVisited = (parksVisited) => {
    if(!Array.isArray(parksVisited)) throw new Error("parksVisited must be an array");
    if(parksVisited.length !== 0) throw new Error("parksVisited is not an empty array");
    return true;
}
