require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const hpp = require('hpp');

const app = express();

// Manual CORS Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
    console.log('Origin header:', req.headers.origin);

    // Force allow localhost:5173
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight');
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(compression());
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
app.use(morgan('dev'));

// Sanitize data
// app.use(mongoSanitize());

// Prevent Parameter Pollution
// app.use(hpp());

// Rate Limiting
// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 mins
//     max: 100
// });
// app.use(limiter);

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

// Routes
const rooms = require('./routes/rooms');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');
const properties = require('./routes/properties');
const content = require('./routes/content');
const messages = require('./routes/messages');

app.use('/api/rooms', rooms);
app.use('/api/bookings', bookings);
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/content', content);
app.use('/api/messages', messages);
app.use('/api/upload', require('./routes/upload'));

// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('BeyondHeaven API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.status(status).json({
        success: false,
        status,
        message,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
