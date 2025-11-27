import { biscuits } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js";
const biscuitsCollection = await biscuits();

export const biscuitsFunctions = {
    async createBiscuit(biscuit_name, description, earned){
        //TODO: validations for each field
        try{
            let biscuitObj = { 
                _id: new ObjectId(),
                biscuit_name: biscuit_name,
                description: description,
                earned: !!earned //if "earned: false" is used then the DB always sets to false despite seed data. !!earned forces JS to look at this value as a boolean 
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
                if(!checkId(biscuitId)){
                    throw new Error("biscuitId is not a valid ObjectId");
                }
                let updatedBiscuit = await biscuitsCollection.findOneAndUpdate({_id: new ObjectId(biscuitId)},
                {$set: {
                    biscuit_name: updateInfo.biscuit_name,
                    description: updateInfo.description,
                    earned: updateInfo.earned
                }},
                {returnNewDocument : true});
    
                return updatedBiscuit;
            } catch (e) {
                throw new Error(e);
            }
        },
    async deleteBiscuitById(biscuitId){
        try{
            if(!checkId(biscuitId)){
                throw new Error ('Invalid biscuit id entered');
            };

            const deletionInfo = await biscuitsCollection.findOneAndDelete({
                _id: new ObjectId(biscuitId)
              });
            if (!deletionInfo.value) throw new Error(`Could not delete biscuit with id of ${biscuitId}. The biscuit does not exist.`);
        }catch(e){
            throw new Error(e);
        }
    }
}