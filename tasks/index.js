import { parks, biscuits, users, ratings, comments } from "../config/mongoCollections.js";
import { commentsData } from "./comments.js";
import { parksData } from './parks.js'
import { biscuitsData } from './biscuits.js';
import { usersData } from './users.js'
import { parksFunctions } from "../data/parks.js";
import { biscuitsFunctions } from "../data/biscuits.js"
import { usersFunctions } from "../data/users.js"
import { ratingsData } from './ratings.js';
import { ratingsFunctions } from '../data/ratings.js';


const parksCollection = await parks();
const biscuitsCollection = await biscuits();
const usersCollection = await users();
const ratingsCollection = await ratings();
const commentsCollection = await comments();

const main = async () => {
    await parksCollection.deleteMany({});
    await biscuitsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await ratingsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    for (const park of parksData) {
        try {
            const { park_id, park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities} = park;
            const newPark = await parksFunctions.createPark(park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities);
            console.log("Parks seeded successfully");
        } catch (e) {
            throw e;
        }
    }

    for (const biscuit of biscuitsData) {
        try {
            const {biscuit_id, biscuit_name, description} = biscuit;
            const newBiscuit = await biscuitsFunctions.createBiscuit(biscuit_name, description);
            console.log("Biscuits seeded successfully");
        } catch (e) {
            throw e;
        }   
    }

    for (const user of usersData) {
        try {
            const {user_id, dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, password, role, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited} = user;
            const newUser = await usersFunctions.createUser(dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, password, role, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited);
            console.log("Users seeded successfully");
        } catch (e) {
            throw e;
        }   
    }

    const allParks = await parksCollection.find({}).toArray();
    console.log(allParks);

    const allBiscuits = await biscuitsCollection.find({}).toArray();
    console.log(allBiscuits);

    const allUsers = await usersCollection.find({}).toArray();
    console.log(allUsers);

    for (const rating of ratingsData) {
        const user = await usersCollection.findOne({ email: rating.userEmail });
        //onst park = allParks.find(p => p.park_name === rating.parkName);
        if (!user ) {
            console.log(`User not found: ${rating.userEmail}`);
            continue;
        }
        const park = await parksCollection.findOne({ park_name: rating.parkName });
        if (!park) {
            console.log(`Park not found: ${rating.parkName}`);
        continue;
        }
        //create Rating
        const ratingDoc = {
            userId: user._id,
            parkId: park._id,
            scores: rating.scores,
            comment: rating.comment,
            dog_size: rating.dog_size,
            createdAt: new Date()
         };

        await ratingsCollection.insertOne(ratingDoc);
        console.log(`Inserted rating for ${rating.userEmail} at ${rating.parkName}`);
    }

    console.log("Ratings seeded successfully!");


    for (const c of commentsData){
        try{
            const {userEmail, parkName, comment: commentText, timestamp} = c;
            const user = await usersCollection.findOne({email: userEmail});
            if(!user){
                console.log('User not found for given email');
                continue;
            }

            const park = await parksCollection.findOne({park_name: parkName});
            if(!park){
                console.log('Park not found for comment.');
                continue;
            }

            const newComment = {
                park_id: park._id,
                user_id: user._id,
                comment: commentText,
                timestamp: new Date(timestamp),
                likes: 0,
                likedBy: []
            };

            await commentsCollection.insertOne(newComment);
            console.log('Comment seeded successfully.')
        }catch (e){
            throw e;
        }
    }

};

main().then(() => {
    console.log('Done seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});