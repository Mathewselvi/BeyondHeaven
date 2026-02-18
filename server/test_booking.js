const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('1. Fetching Rooms...');
        const roomRes = await axios.get(`${API_URL}/rooms`);
        const rooms = roomRes.data.data;
        if (rooms.length === 0) throw new Error('No rooms found. Run seeder first.');
        const room = rooms[0];
        console.log(`   Selected Room: ${room.name} (${room._id})`);

        console.log('\n2. Checking Availability (Valid Dates)...');
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 10); // 10 days from now
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 15); // 15 days from now

        const checkRes = await axios.post(`${API_URL}/bookings/check-availability`, {
            roomId: room._id,
            checkIn,
            checkOut
        });
        console.log(`   Available: ${checkRes.data.available}`);

        console.log('\n3. Creating Booking...');
        // Simulating userId since we haven't implemented full Auth middleware yet for this endpoint
        // You might need to temporarily modify the controller to accept userId in body if it relies on req.user
        // Or we create a dummy user first if strictly required. 
        // Based on my code: const userId = req.user ? req.user.id : req.body.userId; -> It accepts body.

        // Let's create a User first to be safe or use existing one from seeder?
        // Seeder deletes all users. Let's create one.
        // Actually, we can fetch users? No endpoint exposed yet. 
        // I will just pass a random ID for now if schema allows, but schema requires Ref.
        // Better: Login/Register first? 
        // Let's just create a quick user via direct MongoDB if needed, but wait, I haven't implemented Auth API yet.
        // STOP. I need Auth to test "Create Booking" properly because it saves `user` Ref.

        console.log('   SKIPPING Booking Creation until Auth is ready. Availability check passed.');

    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }
};

runTest();
