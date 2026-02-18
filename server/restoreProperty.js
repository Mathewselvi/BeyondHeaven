const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const restoreProperty = async () => {
    try {
        const count = await Property.countDocuments();

        if (count > 0) {
            console.log('Property already exists. No action needed.');
            process.exit();
        }

        console.log('No property found. Creating default resort...');

        // Find admin user to assign as owner (optional but good practice)
        const admin = await User.findOne({ role: 'admin' });

        const property = await Property.create({
            name: 'Beyond Heaven Resort',
            description: 'Your primary luxury resort destination.',
            location: 'Main Location',
            admin: admin ? admin._id : null,
            images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb']
        });

        console.log(`SUCCESS: Created property "${property.name}" with ID: ${property._id}`);
        process.exit();
    } catch (err) {
        console.error('Error restoring property:', err);
        process.exit(1);
    }
};

restoreProperty();
