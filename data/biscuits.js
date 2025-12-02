import { biscuits } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
import { checkId } from "../validation.js";
import { users } from "../config/mongoCollections.js";
//import { comments } from "../config/mongoCollections.js";

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
    async getBiscuitById(id){
        if (!ObjectId.isValid(id)) throw new Error(`invalid object ID`);
        const specificBiscuit = await biscuitsCollection.findOne({_id: new ObjectId(id)});
        if (specificBiscuit === null) throw new Error(`No biscuit with that id`);
        return specificBiscuit.biscuit_name;
    },
    async getBiscuitsForUser(userId){
        if (!ObjectId.isValid(userId)) throw `invalid object ID`;
        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(userId)});
        if (user === null) throw new Error(`No user with that id`);
        const userBiscuits = user.biscuits;
        return userBiscuits;
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
    },

    async autoAwardBiscuits(userId) {
        const userCollection = await users();
        const uID = new ObjectId(userId); //needed bc the userId is a string here, but an objectId in the DB

        const user = await userCollection.findOne({_id: uID});
        if(!user) throw new Error('User not found - could not award biscuits');

        let earnedBiscuits = user.biscuits || []; //if user does not have biscuits, an empty array will be assigned to earnedBiscuits

        /*
        this function will push a biscuit to the user.biscuit array if it is not already there. If the user has already 
        earned this biscuit, the function will just return
        */

        async function giveNewBiscuit(biscuitId){
            let bID = new ObjectId(biscuitId); 
            if(earnedBiscuits.some(b=>b.toString() === bID.toString())) return;
            await userCollection.updateOne({_id: uID},{$push: {biscuits:bID}});
        }

        //------Conditions for an award to be given--------------//
        if(user.parks_visited?.length>=1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'First Park Visit'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }
        }
        if(user.parks_visited?.length>=3){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Park Runner'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }
        }
        if(user.parks_visited?.length>=5){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: "Don't stop, retrieven'!"}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        
        }
        if(user.favorite_parks?.length>=1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Unleash park funtime!'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.pet_friends?.length>=1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Not about that pug-life'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.pet_friends?.length>=5){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Ulti-mutt dog lover!'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.ratings?.length>=1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'First Rating'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.ratings?.length>=5){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Fifth Rating'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.ratings?.length>=10){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Tenth Rating'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        }
        if(user.times?.length>=1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = await biscuitsCollection.findOne({biscuit_name: 'Park playtime added to profile'}); //get the entire biscuit
            if(biscuitToGive){
                await giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
            }        
        }

        /*
            TO-DO: these have to do with comments. need to figure out how to manipulate these once the comments data and seeding 
                   is set up. 
        
        if(user.times?.length===1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = biscuitsCollection.findOne({biscuit_name: 'First Woof'}); //get the entire biscuit
            giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
        }
        if(user.times?.length===1){ //? means if the field is undefined/null this will not crash
            let biscuitToGive = biscuitsCollection.findOne({biscuit_name: '🎶You\'re gunna be Paw-pular🎶'}); //get the entire biscuit
            giveNewBiscuit(biscuitToGive._id); //send biscuit_Id to be added to user.biscuits array
        }
        */
    }
}
