import { biscuits } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";

const biscuitsCollection = await biscuits();

export const biscuitsFunctions = {
    async createBiscuit(biscuit_name, description){
        //TODO: validations for each field
        try{
            let biscuitObj = { 
                _id: new ObjectId(),
                biscuit_name: biscuit_name,
                description: description
            };
        
            const insertInfo = await biscuitsCollection.insertOne(biscuitObj);
            if (!insertInfo.acknowledged || !insertInfo.insertedId){
                throw new Error("Could not add biscuit");
            }
        } catch(e){
            throw new Error(e);
        }
    }
}