const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Colors not used to avoid dependency issues for now, or just use console.log
const User = require('./models/User');
const Property = require('./models/Property');
const Room = require('./models/Room');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        await User.deleteMany();
        await Property.deleteMany();
        await Room.deleteMany();

        // Create Admin User
        const createdUser = await User.create({
            name: 'Admin User',
            email: 'admin@beyondheaven.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log(`Admin User Created: ${createdUser.email}`);

        // Create Property
        const property = await Property.create({
            name: 'Beyond Heaven Resort',
            description: 'A luxurious escape in the Maldives.',
            location: 'Maldives',
            admin: createdUser._id,
            images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb']
        });

        console.log(`Property Created: ${property.name}`);

        // Create Rooms
        const rooms = [
            {
                name: 'Beach Residence',
                type: 'suite',
                price: 500,
                maxGuests: 4,
                description: 'Direct beach access with private pool.',
                propertyId: property._id,
                images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
                features: ['Private Pool', 'Beach Access', 'Butler Service']
            },
            {
                name: 'Ocean Villa',
                type: 'villa',
                price: 850,
                maxGuests: 2,
                description: 'Overwater villa with glass floor panels.',
                propertyId: property._id,
                images: ['https://images.unsplash.com/photo-1590490360182-c33d57733527'],
                features: ['Glass Floor', 'Jacuzzi', 'Sunset View']
            },
            {
                name: 'Garden Suite',
                type: 'room',
                price: 350,
                maxGuests: 2,
                description: 'Surrounded by lush tropical gardens.',
                propertyId: property._id,
                images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a'],
                features: ['Garden View', 'Outdoor Shower']
            }
        ];

        await Room.insertMany(rooms);

        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Property.deleteMany();
        await Room.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
