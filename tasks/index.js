import { parks, biscuits } from "../config/mongoCollections.js";
import { parksData } from './parks.js'
import { biscuitsData } from './biscuits.js';
import { parksFunctions } from "../data/parks.js";
import { biscuitsFunctions } from "../data/biscuits.js"

const parksCollection = await parks();
const biscuitsCollection = await biscuits();

const main = async () => {
    await parksCollection.deleteMany({});
    await biscuitsCollection.deleteMany({});

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

    const allParks = await parksCollection.find({}).toArray();
    console.log(allParks);

    const allBiscuits = await biscuitsCollection.find({}).toArray();
    console.log(allBiscuits);
};

main().then(() => {
    console.log('Done seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});