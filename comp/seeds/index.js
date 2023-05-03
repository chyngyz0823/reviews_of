const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '643289f24b3ad915e016acc4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ducimus provident illo, repellat minima voluptatem beatae repellendus sit itaque a quasi in necessitatibus quam quisquam nihil asperiores saepe omnis. Voluptas, corrupti.',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,    
                ] 
            },
            images:  {
                url: 'https://res.cloudinary.com/dpc5fsziq/image/upload/v1682193258/CampingKG/a1x8f3xu5eruzccgznke.jpg',
                filename: 'CampingKG/a1x8f3xu5eruzccgznke'
              }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})