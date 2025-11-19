import { parks } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";

const parksCollection = await parks();

export const parksFunctions = {
    async createPark(park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities){
        //TODO: validations for each field
        try{
            let parkObj = { 
                _id: new ObjectId(),
                park_name: park_name,
                park_type: park_type,
                approved: approved,
                comments: comments,
                address: address,
                average_cleanliness: average_cleanliness,
                average_dog_friendliness: average_dog_friendliness,
                average_busyness: average_busyness,
                average_water_availability: average_water_availability,
                average_wastebag_availability: average_wastebag_availability,
                average_trash_availability: average_trash_availability,
                average_surface: average_surface,
                average_amenities: average_amenities
            };
        
            const insertInfo = await parksCollection.insertOne(parkObj);
            if (!insertInfo.acknowledged || !insertInfo.insertedId){
                throw new Error("Could not add park");
            }
        } catch(e){
            throw new Error(e);
        }
    }
}