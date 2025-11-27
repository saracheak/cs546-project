import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js"

const usersCollection = await users();

export const usersFunctions = {
    async createUser(dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, hashed_password, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited){
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
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            return user;
        } catch (e) {
            throw new Error(e);
        }
    },

    async updateUser(userId, updateInfo){
        try {
            if(!checkId(userId)){
                throw new Error("userId is not a valid ObjectId");
            }
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