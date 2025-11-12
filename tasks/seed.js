import { parks } from "../config/mongoCollections.js";
import { parksFunctions } from "../data/parks.js";
import { ObjectId } from "mongodb";

//TODO: Add all parks data once it's clean
let parksData = [
    {
    park_name : "Devoe Park",
    park_type: "Off_Leash",
    approved: true,
    comments: [],
    address: {
        street_1 : "192nd Street",
        street_2 : "Jerome Avenue",
        city: "New York City",
        state: "New York",
        zip_code: 10468
    },
    average_cleanliness : 0, 
    average_dog_friendliness : 0,  
    average_busyness : 0, 
    average_water_availability : 0, 
    average_wastebag_availability : 0, 
    average_trash_availability : 0, 
    average_surface : 0,
    average_amenities : 0
    }
]

const main = async () => {
    const parksCollection = await parks();
    // await parksCollection.deleteMany({});
    for (const park of parksData) {
        try {
            const { park_id, park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities} = park;
            const newPark = await parksFunctions.createPark(park_name, park_type, approved, comments, address, average_cleanliness, average_dog_friendliness, average_busyness, average_water_availability, average_wastebag_availability, average_trash_availability, average_surface, average_amenities);
        } catch (e) {
            throw e;
        }   
    }
    const allParks = await parksCollection.find({}).toArray();
    console.log(allParks);
};

main().then(() => {
    console.log('Done seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});