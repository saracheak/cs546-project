import { ObjectId } from "mongodb";
import { ratings,parks} from "../config/mongoCollections.js";
import { checkIdInRatings,checkString } from "../validation.js";
import { parksFunctions } from "./parks.js";


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
        
        //  const overall =
        //     (cleanliness +
        //         dog_friendliness +
        //         busyness +
        //         water_availability+
        //         wastebag_availability+
        //         trash_availability+
        //         surface +
        //         amenities) / 8;


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
            createdAt: new Date()
           
        };

        const insertInfo = await ratingCollection.insertOne(ratingObj);
        if (!insertInfo.acknowledged) throw "Could not add rating";

        return await ratingCollection.findOne({ _id: insertInfo.insertedId });
    },

    async getRatingsForPark(park_id){
        const col = await ratings();
            return col
                .find({ park_id: new ObjectId(park_id) })
                .toArray();
    },
    
    async getUserRatingForPark(park_id, user_id) {
        const col = await ratings();
        return col.findOne({
        park_id: new ObjectId(park_id),
        user_id: new ObjectId(user_id)
        });
    },

    async getAverageRatingsForPark(park_id) {
        const ratingCollection = await ratings();
        const pid = checkIdInRatings(park_id, "park id");
        

        const list = await ratingCollection
            .find({ park_id: pid  })
            .toArray();

        if (list.length === 0) {
            return[];
        }

        const totals = {
            cleanliness: 0,
            dog_friendliness: 0,
            busyness: 0,
            water_availability: 0,
            wastebag_availability: 0,
            trash_availability: 0,
            surface: 0,
            amenities: 0
            };

        for (const r of list) {
            for (const key in totals) {
                totals[key] += r[key];
            }
        }

        const count = list.length;

        const averages = {
            average_cleanliness: totals.cleanliness / count,
            average_dog_friendliness: totals.dog_friendliness / count,
            average_busyness: totals.busyness / count,
            average_water_availability: totals.water_availability / count,
            average_wastebag_availability: totals.wastebag_availability / count,
            average_trash_availability: totals.trash_availability / count,
            average_surface: totals.surface / count,
            average_amenities: totals.amenities / count,
            average_overall:
                (totals.cleanliness +
                totals.dog_friendliness +
                totals.busyness +
                totals.water_availability +
                totals.wastebag_availability +
                totals.trash_availability +
                totals.surface +
                totals.amenities) / (8 * count)
        };

        

const parksCol = await parks();
const exists = await parksCol.findOne({ _id: new ObjectId(pid) });
console.log("DEBUG park exists?", !!exists, pid);

        await parksFunctions.updateAverageRatings(pid, averages);
        console.log("DEBUG list length in getAverageRatingsForPark =", list.length);


        return list; 
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
