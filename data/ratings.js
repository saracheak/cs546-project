import { ObjectId } from "mongodb";
import { ratings} from "../config/mongoCollections.js";
import { checkId } from "../validation.js";

export const ratingsFunctions ={
    async createRating(user_id, park_id, scores, dog_size){
        

        const ratingCollection = await ratings();
        try{
            let ratingObj = {
                user_id: user_id,
                park_id: park_id,
                scores: scores,
                dog_size: dog_size
            };

            const insertInfo = await ratingCollection.insertOne(ratingObj);
            if (!insertInfo.acknowledged || !insertInfo.insertedId){
                throw new Error("Could not add rating");
            }
            
        }catch(e){
            throw new Error(e);
        }
    },

    async getRatingsForPark(park_id){
        const ratingCollection = await ratings();

        park_id = checkId(park_id);

        const ratingslist = await ratingCollection.find({ park_id: new ObjectId(park_id) }).toArray();
        
        return ratingslist;
    }
    


}

// export const getAverageRatingsForPark =(park_id) =>{

// }

// export const getTopParksByOverallScore = (limit) =>{

// }
