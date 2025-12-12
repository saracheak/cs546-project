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
    if(comment.park_Id) {
        comment.park_Id = comment.park_Id.toString();
    }

    if(comment.user_id){
        comment.user_id = comment.user_id.toString();
    }

    return comment;
}

export const commentsFunctions = {
    async getCommentsForPark(park_Id){
        try{
            park_Id = validateId(park_Id);
            const commentList = await commentsCollection
            .find({park_id: new ObjectId(park_Id)})
            .sort({timestamp: -1})
            .toArray();
            
            const preppedComments = [];
            for(let i= 0; i< commentList.length; i++){
                preppedComments.push(prepComment(commentList[i]));
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
                park_id: new ObjectId(park_Id),
                user_id: new ObjectId(user_id),
                comment: comment,
                timestamp: timeS,
                likes: 0,
                likedBy: []
            }

            const insert = await commentsCollection.insertOne(commentObject);
            if(!insert.acknowledged || !insert.insertedId ){
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

            //const isCommenter = checkExisting.user_id && checkExisting.user_id.toString() === requestingUserId;

            let isCommenter = false;
            if(checkExisting.user_id){
                const ownerId = checkExisting.user_id.toString();
                if(ownerId === requestingUserId){
                    isCommenter = true;
                }
            }
            if(!isAdmin && !isCommenter){
                throw new Error("Not authorized to delete this comment");
            }

            const deleteInfo = await commentsCollection.deleteOne({
                _id: new ObjectId(comment_id)
            });

            if(deleteInfo.deletedCount === 0){
                throw new Error(`Could not delete comment of id ${comment_id}`);
            }

            return prepComment(checkExisting);
        }catch(e){
            throw new Error(e);
        }
    },

    async likeUnlikeComment(comment_id, userId){
        try{
            comment_id = validateId(comment_id);
            userId = validateId(userId);


            const existing = await commentsCollection.findOne({_id: new ObjectId(comment_id)});

            if(!existing){
                throw new Error(`No comment found with id ${comment_id}`);
            }

            let likedBy = [];
            if(Array.isArray(existing.likedBy)){
                for(let i=0; i < existing.likedBy.length; i++){
                    const val = existing.likedBy[i];

                    likedBy.push(val.toString());
                }
            }

            let hasLiked = false;
            for(let i= 0; i< likedBy.length; i++){
                if(likedBy[i] === userId){
                    hasLiked = true;
                    break;
                }
            }

            let newLikedBy = [];
            if(hasLiked){
                for(let i = 0; i< likedBy.length ; i++){
                    if(likedBy[i] !== userId){
                        newLikedBy.push(likedBy[i]);
                    }
                }
            }else{
                for(let i=0; i< likedBy.length; i++){
                    newLikedBy.push(likedBy[i]);
                }
                newLikedBy.push(userId);
            }

            const newLikes = newLikedBy.length;

            const result = await commentsCollection.updateOne(
                {_id: new ObjectId(comment_id)},
                {
                    $set: {
                        likes: newLikes,
                        likedBy: newLikedBy
                    }
                }
            );

            if(result.matchedCount === 0){
                throw new Error(`Could not update likes for comment with id ${comment_id}`);
            }

            const updatedComment = {
                ...existing,
                likes: newLikes,
                likedBy: newLikedBy
            };

            return prepComment(updatedComment);
        } catch(e){
            throw new Error(e);
        }
    }

}
