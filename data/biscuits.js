import { biscuits } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js";
const biscuitsCollection = await biscuits();

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

const validateId = (value)=> {
    const id = checkString(value, "id");

    if(!checkId(id)){
        throw new Error("id must be a valid ObjectId");
    }
    return id;
};

export const biscuitsFunctions = {
    async createBiscuit(biscuit_name, description){
        //TODO: validations for each field
        try{
            let biscuitObj = { 
                _id: new ObjectId(),
                biscuit_name: biscuit_name,
                description: description,
            };
        
            const insertInfo = await biscuitsCollection.insertOne(biscuitObj);
            if (!insertInfo.acknowledged || !insertInfo.insertedId){
                throw new Error("Could not add biscuit");
            }
        } catch(e){
            throw new Error(e);
        }
    },
    async getAllBiscuits(){
        try{
            let biscuitList = await biscuitsCollection
            .find({})
            .toArray();
        if (!biscuitList) throw new Error('Could not find all biscuits');
        return biscuitList;
        }catch(e){
            throw new Error(e);
        }
    },
    async updateBiscuit(biscuitId, updateInfo){
            try {
                biscuitId = validateId(biscuitId) //validates string is entered and not empty
                let updatedBiscuit = await biscuitsCollection.findOneAndUpdate({_id: new ObjectId(biscuitId)},
                {$set: {
                    biscuit_name: updateInfo.biscuit_name,
                    description: updateInfo.description,
                }},
                {returnNewDocument : true});
    
                return updatedBiscuit;
            } catch (e) {
                throw new Error(e);
            }
        },
    async deleteBiscuitById(biscuitId){
        try{
            biscuitId = validateId(biscuitId) //validates string is entered and not empty
            const deletionInfo = await biscuitsCollection.findOneAndDelete({
                _id: new ObjectId(biscuitId)
              });
            if (!deletionInfo.value) throw new Error(`Could not delete biscuit with id of ${biscuitId}. The biscuit does not exist.`);
        }catch(e){
            throw new Error(e);
        }
    }
}