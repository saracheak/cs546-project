import { ObjectId } from "mongodb";
import { ratings} from "../config/mongoCollections.js";
import { checkIdInRatings,checkString } from "../validation.js";
import { parksFunctions } from "./parks.js";
import { biscuitsFunctions } from "./biscuits.js";


export const ratingsFunctions ={

    async createRating(ratingData){
        

        const ratingCollection = await ratings();

        const {
            user_id,
            parkId,
            comment,
            dog_size,
        } = ratingData;

        
        const uid = checkIdInRatings(user_id, "user id");
        const pid = checkIdInRatings(parkId, "park id");
            
        const s = ratingData.scores ?? ratingData;
        const {
            cleanliness,
            dog_friendliness,
            busyness,
            water_availability,
            wastebag_availability,
            trash_availability,
            surface,
            amenities
        } = s;
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
            parkId: new ObjectId(pid),
            scores:{
                cleanliness,
                dog_friendliness,
                busyness,
                water_availability,
                wastebag_availability,
                trash_availability,
                surface,
                amenities
            },
            comment: commentStr,
            dog_size: dogSizeStr,
            createdAt: new Date()
           
        };

        const insertInfo = await ratingCollection.insertOne(ratingObj);
        if (!insertInfo.acknowledged) throw "Could not add rating";
        await biscuitsFunctions.autoAwardBiscuits(user_id); //autoaward biscuit will work once users are able to create ratings
        return await ratingCollection.findOne({ _id: insertInfo.insertedId });
    },

    async getRatingsForPark(parkId){
        const col = await ratings();
        const pid = checkIdInRatings(parkId, "park id");
            return col.find({ parkId: new ObjectId(pid) }).toArray();
    },
    
    async getUserRatingForPark(parkId, user_id) {
        const col = await ratings();
        const pid = checkIdInRatings(parkId, "park id");
        const uid = checkIdInRatings(user_id, "user id");

        return col.findOne({
            parkId: new ObjectId(pid),
            user_id: new ObjectId(uid)
        });
    },

    async getAverageRatingsForPark(parkId) {
        const ratingCollection = await ratings();
        const pid = checkIdInRatings(parkId, "park id");
        
        const list = await ratingCollection
            .find({ parkId: new ObjectId(pid)})
            .toArray();

        if (list.length === 0) {
            return null;;
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
            const s = r.scores ?? r;
            for (const key in totals) {
            totals[key] += Number(s[key] ?? 0);
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

        await parksFunctions.updateAverageRatings(pid, averages);
        return averages; 
    },

}
