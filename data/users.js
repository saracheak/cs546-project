import { users } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";

const usersCollection = await users();

export const usersFunctions = {
    async createUser(dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, hash_password, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited){
        try{
            let userObj = { 
                _id: new ObjectId(),
                dog_name: dog_name,
                human_first_name: human_first_name,
                human_last_name: human_last_name,
                dog_gender: dog_gender,
                human_gender: human_gender,
                email: email,
                hash_password: hash_password,
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
        } catch(e){
            throw new Error(e);
        }
    }
}

