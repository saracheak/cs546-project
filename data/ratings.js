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
            dog_size
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

            
         const dogSizeStr = checkId(dog_size);

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
            dog_size: dogSizeStr
        };

        const insertInfo = await ratingCollection.insertOne(ratingObj);
        if (!insertInfo.acknowledged) throw "Could not add rating";

        return await ratingCollection.findOne({ _id: insertInfo.insertedId });
    },

    async getRatingsForPark(park_id){
        const ratingCollection = await ratings();
        let pid = park_id;
        if (typeof pid !== "string") {
            pid = pid.toString();
        }

        const ratingsList = await ratingCollection.find({ park_id: new ObjectId(pid) }).toArray();

          return ratingsList;

        
    },

    async getAverageRatingsForPark(park_id) {
        const ratingCollection = await ratings();
         const pid = checkString(park_id, "park id");
            if (!checkId(pid)) {
                throw "Error: park id is not a valid ObjectId";
            }

        const list = await ratingCollection
            .find({ park_id: new ObjectId(pid) })
            .toArray();

        if (list.length === 0) {
            return {
                cleanliness: 0,
                dog_friendliness: 0,
                busyness: 0,
                water_availability: 0,
                wastebag_availability: 0,
                trash_availability: 0,
                surface: 0,
                amenities: 0,
                overall: 0
                
            };
        }

        const avg = (field) => list.reduce((sum, r) => sum + r[field], 0) / list.length

        const summary = {
            average_cleanliness: avg("cleanliness"),
            average_dog_friendliness: avg("dog_friendliness"),
            average_busyness: avg("busyness"),
            average_water_availability: avg("water_availability"),
            average_wastebag_availability: avg("wastebag_availability"),
            average_trash_availability: avg("trash_availability"),
            average_surface: avg("surface"),
            average_amenities: avg("amenities")
        };
    
        summary.average_overall =
            Object.values(summary).reduce((sum, x) => sum + x, 0) /
            Object.values(summary).length;

        for (const key in summary) {
            summary[key] = Number(summary[key].toFixed(2));
        }

        return summary;
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
