const axios = require('axios');

// Using IPv4 explicitly
const API_URL = 'http://127.0.0.1:5001/api';

const runTest = async () => {
    try {
        console.log('1. Fetching Rooms...');
        const roomRes = await axios.get(`${API_URL}/rooms`);
        console.log(`   Status: ${roomRes.status}`);
        const rooms = roomRes.data.data;
        if (!rooms || rooms.length === 0) throw new Error('No rooms found. Run seeder first.');
        const room = rooms[0];
        console.log(`   Selected Room: ${room.name} (${room._id})`);

        console.log('\n2. Checking Availability...');
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 20); // 20 days from now
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 25); // 25 days from now

        console.log(`   Dates: ${checkIn.toISOString()} to ${checkOut.toISOString()}`);

        const checkRes = await axios.post(`${API_URL}/bookings/check-availability`, {
            roomId: room._id,
            checkIn,
            checkOut
        });
        console.log(`   Available: ${checkRes.data.available}`);

        if (checkRes.data.available) {
            console.log('\n3. Creating Guest Booking...');
            try {
                const bookingRes = await axios.post(`${API_URL}/bookings`, {
                    roomId: room._id,
                    checkIn,
                    checkOut,
                    guests: { adults: 2, children: 1 },
                    guest: {
                        name: 'John Guest',
                        email: 'guest@example.com',
                        phone: '+1234567890'
                    },
                    totalAmount: 1000
                });
                console.log('   Booking Created Successfully!');
                console.log(`   Booking ID: ${bookingRes.data.data._id}`);
                console.log(`   Status: ${bookingRes.data.data.status}`);
                console.log(`   Guest: ${bookingRes.data.data.guest.name}`);
            } catch (bookingErr) {
                console.error('   Booking Creation Failed:');
                if (bookingErr.response) {
                    console.error('   Data:', bookingErr.response.data);
                } else {
                    console.error('   Error:', bookingErr.message);
                }
            }
        }

    } catch (err) {
        console.error('CRITICAL ERROR:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Message:', err.message);
            console.error(err);
        }
    }
};

runTest();
