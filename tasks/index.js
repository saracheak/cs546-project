import { parks, biscuits, users, ratings } from "../config/mongoCollections.js";
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

const main = async () => {
    await parksCollection.deleteMany({});
    await biscuitsCollection.deleteMany({});
    await usersCollection.deleteMany({});

    for (const park of parksData) {
        try {
            const { park_id, park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities} = park;
            const newPark = await parksFunctions.createPark(park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities);
            //console.log(newPark);
        } catch (e) {
            throw e;
        }
    }

    for (const biscuit of biscuitsData) {
        try {
            const {biscuit_id, biscuit_name, description} = biscuit;
            const newBiscuit = await biscuitsFunctions.createBiscuit(biscuit_name, description);
            //console.log(newBiscuit);
        } catch (e) {
            throw e;
        }   
    }

    for (const user of usersData) {
        try {
            const {user_id, dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, hash_password, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited} = user;
            const newUser = await usersFunctions.createUser(dog_name, human_first_name, human_last_name, dog_gender, human_gender, email, hash_password, favorite_parks, times, ratings, pet_friends, biscuits, parks_visited);
            //console.log(newUser);
        } catch (e) {
            throw e;
        }   
    }

    for (const rating of ratingsData) {
        try {
            const newRating = await ratingsFunctions.createRating(rating.user_id, rating.park_id, rating.scores, rating.dog_size);
    
        }  
        catch (e) {
            throw e;
        }   

    }


    const allParks = await parksCollection.find({}).toArray();
    console.log(allParks);

    const allBiscuits = await biscuitsCollection.find({}).toArray();
    console.log(allBiscuits);

    const allUsers = await usersCollection.find({}).toArray();
    console.log(allUsers);

    const allRatings = await ratingsCollection.find({}).toArray();
    console.log(allRatings);
};

main().then(() => {
    console.log('Done seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});