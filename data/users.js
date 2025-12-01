import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js"
import { parksFunctions } from "./parks.js";
import bcrypt from 'bcryptjs';
import validator from "validator";

const usersCollection = await users();

export const usersFunctions = {
    async createUser(dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, password, 
        role, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited){

        try{
            //Validations
            checkName(dog_name);
            checkName(human_first_name);
            checkName(human_last_name);
            checkGender(dog_gender);
            checkGender(human_gender);
            checkEmail(email);
            checkPassword(password);
            checkRole(role);
            checkFavoriteParks(favorite_parks);
            checkTimes(times);
            checkRatings(ratings);
            checkPetFriends(pet_friends);
            checkBiscuits(biscuits);
            checkParksVisited(parks_visited);
        } catch(e){
            throw new Error(e);
        }

        //hash password
        let hashed_password = password;
        try{
            const saltRounds = 10;
            hashed_password = await bcrypt.hash(password, saltRounds);
        } catch(e){
            throw new Error("Error occured while salting password");
        }

        try{
            let userObj = { 
                _id: new ObjectId(),
                dog_name: dog_name,
                human_first_name: human_first_name,
                human_last_name: human_last_name,
                dog_gender: dog_gender,
                human_gender: human_gender,
                email: email,
                hashed_password: hashed_password,
                role: role,
                favorite_parks: favorite_parks,
                times: times,
                ratings: ratings,
                pet_friends: pet_friends,
                biscuits: biscuits,
                parks_visited: parks_visited
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
                dog_name: updateInfo.dogName,
                human_first_name: updateInfo.humanFirstName,
                human_last_name: updateInfo.humanLastName,
                dog_gender: updateInfo.dogGender,
                human_gender: updateInfo.humanGender,
                email: updateInfo.email,
                favorite_parks: updateInfo.favoriteParks ? updateInfo.favoriteParks.split(",").map(s => s.trim()) : [],
                times: updateInfo.times ? updateInfo.times.split(",").map(s => s.trim()) : [],
                pet_friends: updateInfo.petFriends ? updateInfo.petFriends.split(",").map(s => s.trim()) : [],
                parks_visited: updateInfo.parksVisited ? updateInfo.parksVisited.split(",").map(s => s.trim()) : []
            }},
            {returnNewDocument : true});
            
            if(!updatedUser) throw new Error("Ran into error while updating user with that userId");
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
            let petFriends = user.pet_friends;
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
            let favParks = user.favorite_parks;
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
            let parksVisited = user.parks_visited;
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

const checkEmail = (email) => {
    return validator.isEmail(email);
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
