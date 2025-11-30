import {biscuits, comments} from "../config/mongoCollections.js";
import { ObjectId, ReturnDocument } from "mongodb";
import {checkId} from  "../validation.js";

const commentsCollection = await comments();

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

const validateId = (value)=> {
    const id = checkString(value, "id");

    if(!checkId(id)){
        throw new Error("id must be a valid ObjectId");
    }
    return id;
};


const checkNumber = (value, name) =>{
    if(value === undefined || value === null){
        throw new Error(`${name} is required`);
    }

    if(typeof value !== "number" || Number.isNaN(value)){
        throw new Error(`${name} must be a number`);
    }

    if(value < 0){
        throw new Error(`${name} cannot be a negative number`);
    }

    return value;
};

const parseTime =(value)=>{
    // if no time stamp is proivded, default to current time
    if(value === undefined || value === null || value === "" ){
        return new Date();
    }

    if(typeof value === "string"){
        const dt = new Date(value);
        if(Number.isNaN(dt.getTime())){
            throw new Error("timestamp must be a valid date/time");
        }
        return dt;
    }

    throw new Error("timestamp must be a valud date/time or empty ");
};

const prepComment=(comment)=>{
    if(comment.park_id) {
        comment.park_id = comment.park_id.toString();
    }

    if(comment.user_id){
        comment.user_id = comment.user_id.toString();
    }

    return comment;
}

export const commentsFunctions = {
    async getCommentsForPark(park_id){
        try{
            park_id = validateId(park_id);
            const commentList = await commentsCollection
            .find({park_id: new ObjectId(park_id)})
            .sort({timestamp: -1})
            .toArray();
            
            const preppedComments = [];
            for(let i= 0; i< commentList.length; i++){
                preppedComments.push(commentList[i]);
            }

            return preppedComments;
        } catch(e){
            throw new Error(e);
        }
    },

    async addCommentToPark(park_Id, { user_id, comment, timestamp }){
        try{
            park_Id = validateId(park_Id);
            user_id = validateId(user_id);
            comment = checkString(comment, "comment");
            const timeS = parseTime(timestamp);

            const commentObject = {
                _id: new ObjectId(),
                park_Id: new ObjectId(park_Id),
                user_id: new ObjectId(user_id),
                comment: comment,
                timestamp: timeS,
                biscuits: 0,
            }

            const insert = await commentsCollection.insertOne(commentObject);
            if(!insert.acknowledged || insert.insertedId ){
                throw new Error("Could not add comment");
            }

            return prepComment(commentObject);
        }catch(e){
            throw new Error(e);
        }

        
    },

    async deleteCommentFromPark(comment_id, requestingUserId, isAdmin){
        try{
            comment_id = validateId(comment_id);
            requestingUserId = validateId(requestingUserId);
            isAdmin = checkBool(isAdmin, "isAdmin");

            const checkExisting = await commentsCollection.findOne({
                _id: new ObjectId(comment_id)
            });

            if(!checkExisting){
                throw new Error(`No comment found of id ${comment_id}`);
            }

            const isCommenter = checkExisting.user_id === requestingUserId.toString();

            if(!isAdmin && !isCommenter){
                throw new Error("Not authorized to delete this comment");
            }

            const deleteInfo = await commentsCollection.findOneAndDelete({
                _id: new ObjectId(comment_id)
            });

            if(!deleteInfo.value){
                throw new Error(`Could not delete comment of id ${comment_id}`);
            }

            return prepComment(deleteInfo.value);
        }catch(e){
            throw new Error(e);
        }
    },

    async incrementCommentBiscuits(comment_id, oldLikes, newLikes){
       try{
        comment_id = validateId(comment_id);
        oldLikes = checkNumber(oldLikes, "oldLikes");
        newLikes = checkNumber(newLikes, "newLikes");

        const newTotalLikes = oldLikes + newLikes;

        const update = await commentsCollection.findOneAndUpdate (
            {
                _id: new ObjectId(comment_id),
                biscuits: oldLikes
            },
            {
                $set: {biscuits: newTotalLikes},
            },
            {returnDocument: "after"}
        );

        if (!update.value){
            throw new Error(`Could not update biscuit count for comment with id ${comment_id}`);
        }

        return prepComment(update.value);
       }catch(e){
            throw new Error(e);
       }
    }

}
