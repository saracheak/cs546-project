import { ObjectId } from "mongodb";
import { ratings} from "../config/mongoCollections.js";
import { checkId,checkIdInRatings,checkString } from "../validation.js";


export const ratingsFunctions ={
    async createRating(ratingData){
        

        const ratingCollection = await ratings();

        const {
            user_id,
            park_id,
            cleanliness,
            dog_friendliness,
            busyness,
            water_availability,
            wastebag_availability,
            trash_availability,
            surface,
            amenities,
            comment,
            dog_size,
        } = ratingData;

        
        const uid = checkIdInRatings(user_id, "user id");
        const pid = checkIdInRatings(park_id, "park id");
            
        
        const fields = [
            cleanliness,
            dog_friendliness,
            busyness,
            water_availability,
            wastebag_availability,
            trash_availability,
            surface,
            amenities
        ];

        for (const f of fields) {
            if (typeof f !== "number" || f < 0 || f > 5) {
                throw "Each rating field must be a number between 0 and 5";
            }
        }

            
         const dogSizeStr = checkString(dog_size);
         const commentStr = checkString(comment);

         const ratingObj = {
            user_id: new ObjectId(uid),
            park_id: new ObjectId(pid),
            cleanliness,
            dog_friendliness,
            busyness,
            water_availability,
            wastebag_availability,
            trash_availability,
            surface,
            amenities,
            comment: commentStr,
            dog_size: dogSizeStr,
           
        };

        const insertInfo = await ratingCollection.insertOne(ratingObj);
        if (!insertInfo.acknowledged) throw "Could not add rating";

        return await ratingCollection.findOne({ _id: insertInfo.insertedId });
    },

    async getRatingsForPark(park_id){
        const col = await ratingsCollectionPromise;
            return col
                .find({ parkId: new ObjectId(park_id) })
                .toArray();
    },
    
    async getUserRatingForPark(parkId, userId) {
        const col = await ratingsCollectionPromise;
        return col.findOne({
        parkId: new ObjectId(parkId),
        userId: new ObjectId(userId)
        });
    },

    async createRating(ratingObj) {
    const col = await ratingsCollectionPromise;

    const doc = {
      parkId: new ObjectId(ratingObj.parkId),
      userId: new ObjectId(ratingObj.userId),
      overall: ratingObj.overall,
      cleanliness: ratingObj.cleanliness,
      dogFriendliness: ratingObj.dogFriendliness,
      busyness: ratingObj.busyness,
      waterAvailability: ratingObj.waterAvailability,
      wastebagAvailability: ratingObj.wastebagAvailability,
      trashAvailability: ratingObj.trashAvailability,
      surface: ratingObj.surface,
      amenities: ratingObj.amenities,
      comment: ratingObj.comment,
      createdAt: new Date()
    };

    const insertInfo = await col.insertOne(doc);
    if (!insertInfo.acknowledged) throw 'Could not insert rating';

    doc._id = insertInfo.insertedId;
    return doc;
  },
    

    async getAverageRatingsForPark(park_id) {
        const ratingCollection = await ratings();
        const pid = checkIdInRatings(park_id, "park id");

        const list = await ratingCollection
            .find({ park_id: pid  })
            .toArray();

        if (list.length === 0) {
            return;
        }

        const a = list[0];
        await parksFunctions.updateAverageRatings(parkId, {
            average_overall: a.average_overall,
            average_cleanliness: a.average_cleanliness,
            average_dog_friendliness: a.average_dog_friendliness,
            average_busyness: a.average_busyness,
            average_water_availability: a.average_water_availability,
            average_wastebag_availability: a.average_wastebag_availability,
            average_trash_availability: a.average_trash_availability,
            average_surface: a.average_surface,
            average_amenities: a.average_amenities
        });
    },

    async getTopParksByOverallScore(limit = 10) {
        const ratingCollection = await ratings();

        const agg = await ratingCollection
            .aggregate([
                {
                    $group: {
                        _id: "$park_id",
                        cleanliness: { $avg: "$cleanliness" },
                        dog_friendliness: { $avg: "$dog_friendliness" },
                        busyness: { $avg: "$busyness" },
                        water_availability: { $avg: "$water_availability" },
                        wastebag_availability: { $avg: "$wastebag_availability" },
                        trash_availability: { $avg: "$trash_availability" },
                        surface: { $avg: "$surface" },
                        amenities: { $avg: "$amenities" }
                    }
                },
                {
                    $addFields: {
                        overall: {
                            $avg: [
                                "$cleanliness",
                                "$dog_friendliness",
                                "$busyness",
                                "$water_availability",
                                "$wastebag_availability",
                                "$trash_availability",
                                "$surface",
                                "$amenities"
                            ]
                        }
                    }
                },
                { $sort: { overall: -1 } },
                { $limit: limit }
            ])
            .toArray();

        return agg;
    }

}
