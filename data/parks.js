import { parks } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js";
import { ratingsFunctions } from "./ratings.js";

const parksCollection = await parks();


const checkString = (value, name) => {
    if(value === undefined || value=== null){
        throw new Error(`${name} is required`);
    }
    if(typeof value !== "string"){
        throw new Error(`${name} must be a string`);
    }
    value = value.trim();
    if(value.length === 0){
        throw new Error(`${name} cannot be an empty string or just spaces`);
    }

    return value;
};

const checkBool = (value, name) =>{
    if(typeof value !== "boolean"){
        throw new Error(`${name} must be a boolean`);
    }
    return value;
};

const checkRating = (value, name) =>{
    if(value === undefined || value === null){
        throw new Error(`${name} is required`);
    }
    if(typeof value !== "number" || value === null){
        throw new Error(`${name} must be a number`);
    }
    if(value < 0 || value > 5){
        throw new Error(`${name} must be between 0 and 5`);
    }
    return value;
};

const validateId = (value)=> {
    const id = checkString(value, "id");

    if(!checkId(id)){
        throw new Error("id must be a valid ObjectId");
    }
    return id;
};

const checkParkType = (park_type) => {
    park_type = checkString(park_type, "park_type").toLowerCase();
    const allowedTypes = ["run", "off-leash"];

    if(!allowedTypes.includes(park_type)) {
        throw new Error('park_type must be either run or off-leash');
    }

    if(park_type === "run"){
        return "Run";
    }
    if(park_type === "off-leash"){
        return "Off-Leash";
    }
    return park_type;
};

const checkAddress = (address) =>{
    if(!address || typeof address !== "object"){
        throw new Error("address must be an object");
    }
    const street_1 = checkString(address.street_1, "address.street_1");
    let street_2 ="";
    if(address.street_2 != undefined && address.street_2 !== null){
        street_2 = checkString(address.street_2, "address.street_2");
    }
    const city = checkString(address.city, "address.city");
    const state = checkString(address.state, "address.state");
    const zip_code = checkString(address.zip_code?.toString(), "address.zip_code");
    
    return{
        street_1,
        street_2,
        city,
        state,
        zip_code
    };
};

const checkComments =(comments) =>{
    if(!Array.isArray(comments)){
        throw new Error("comments must be in array form");
    }

    return comments; 
};

const prepPark =(park_Doc)=> {
    if(!park_Doc){
        return park_Doc;
    }
    park_Doc._id = park_Doc._id.toString();
    return park_Doc;
};

export const parksFunctions = {
    async createPark(park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities){
        try{
            park_name= checkString(park_name, "park_name");
            park_type = checkParkType(park_type);
            approved = checkBool(approved, "approved");
            comments = checkComments(comments);
            address = checkAddress(address);

            average_cleanliness = checkRating(average_cleanliness, "average_cleanliness");
            average_dog_friendliness = checkRating(average_dog_friendliness, "average_dog_friendliness");
            average_busyness = checkRating(average_busyness, "average_busyness");
            average_water_availability= checkRating(average_water_availability, "average_water_availability");
            average_wastebag_availability= checkRating(average_wastebag_availability, "average_wastebag_availability");
            average_trash_availability= checkRating(average_trash_availability, "average_trash_availability");
            average_surface= checkRating(average_surface, "average_surface");
            average_amenities = checkRating(average_amenities, "average_amenities");
            
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

            return prepPark(parkObj);
        }catch(e) {
            throw e;
        }
    },

    async getAllParks(approvedOnly = true){
        try{
            const query = {};
            if(approvedOnly){
                query.approved = true;
            }
            const parksList = await parksCollection.find(query).toArray();

            const preppedParks = [];
            for(let i=0; i<parksList.length; i++){
                preppedParks.push(prepPark(parksList[i]));
            }

            return preppedParks;
        }catch(e){
            throw e;
        }
    },

    async getParkById(park_Id){
        try{
            park_Id = validateId(park_Id);

            const park = await parksCollection.findOne({
                _id: new ObjectId(park_Id),
            });

            if(!park){
                throw new Error(`No park found with id ${park_Id}`);
            }

            return prepPark(park);
        }catch(e){
            throw e;
        }
    },

    async updatePark(park_Id, parkData){
        try{
            park_Id = validateId(park_Id);

            if(!parkData || typeof parkData !== "object"){
                throw new Error("parkData must be an object");
            }

            const update_fields = {};

            if(parkData.park_name !== undefined){
                update_fields.park_name = checkString(parkData.park_name, "park_name");
            }

            if(parkData.park_type !== undefined){
                update_fields.park_type= checkParkType(parkData.park_type);
            }
            if(parkData.address !== undefined){
                update_fields.address = checkAddress(parkData.address);
            }

            if(Object.keys(update_fields).length === 0){
                throw new Error("No fields provided for park update");
            }

            const setUpdate = await parksCollection.updateOne(
                {_id: new ObjectId(park_Id)},
                {$set: update_fields},
                //{returnDocument: "after"}
            );

            if(!setUpdate.matchedCount) {
                throw new Error(`Could not update park ${park_Id}`);
            }
            const updatedDoc = await parksCollection.findOne({ _id: new ObjectId(park_Id) });
            return prepPark(updatedDoc);
        }catch(e){
            throw e;
        }
    },

    async setParkApproved(park_Id, approvedBool){
        try{
            park_Id = validateId(park_Id);
            approvedBool = checkBool(approvedBool, "approvedBool");

            const setUpdate = await parksCollection.updateOne(
            {_id: new ObjectId(park_Id)},
            {$set: {approved: approvedBool}},
         );

        if(!setUpdate.matchedCount){
            throw new Error(`Could not update approved status for park ${park_Id}`);
        }

        const updatedDoc = await parksCollection.findOne({ _id: new ObjectId(park_Id) });
        return prepPark(updatedDoc);
        }catch(e){
            throw e;
        }
    },

    async updateAverageRatings(park_Id, averages){
        try{
            park_Id = validateId(park_Id);

            if(!averages || typeof averages !== "object"){
                throw new Error("all averages must be an object");
            }

            const vars = [
                "average_cleanliness",
                "average_dog_friendliness",
                "average_busyness",
                "average_water_availability",
                "average_wastebag_availability",
                "average_trash_availability",
                "average_surface",
                "average_amenities",
                "average_overall"
            ];

            const updateFields = {};
            for(const v of vars){
                if(averages[v]=== undefined){
                    continue;
                } 
                updateFields[v] = checkRating(averages[v], v);
            }

            if(Object.keys(updateFields).length === 0){
                throw new Error("No average rating fields provided for update")
            }

             const parkObjId = new ObjectId(park_Id);

            const setUpdate = await parksCollection.updateOne(
                {_id: parkObjId},
                {$set: updateFields },
                //{returnDocument: "after"}
            );

            if(!setUpdate.matchedCount) {
                   throw new Error(`Unable to update averages for park ${park_Id}`);
            }
            const updated = await parksCollection.findOne({ _id: parkObjId });
            return prepPark(updated);
        }catch(e){
            throw e;
        }
    },

    async getTopRatedParks(limit = 10){
        const parksCollection = await parks();
        

        const topParks = await parksCollection
            .find({
                approved: true,
                average_overall: { $exists: true }
            })
            .sort({  average_overall: -1 })
            .limit(limit)
            .toArray();

        return topParks.map(prepPark);
    },

    async deletePark(park_Id){ /// TO DO: This should be an admin only feature 
        try{
            park_Id = validateId(park_Id);

            const deleteCheck = await parksCollection.deleteOne({
                _id: new ObjectId(park_Id),
            });

            if(!deleteCheck.deletedCount){
                throw new Error(`Could not delete park ${park_Id}`);
            }

            return true;
        }catch(e){
            throw e;
        }
    },
};
