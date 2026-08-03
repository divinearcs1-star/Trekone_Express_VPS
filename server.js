const express = require('express')
const mongoose = require('mongoose');  // MongoDB library
const cors = require('cors')
const path = require('path');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const trekRoutes = require('./routes/trek');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/report');

const app = express();
const port = process.env.PORT || '3000';

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [];

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
// app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/v1/payment/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use((err, req, res, next) => {
    console.error("Global Error:", err.message);
    console.error(err);
    res.status(500).json({
        success:false,
        message:"Internal Server Error"
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/trek', trekRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send("server is in running")
});

app.get('/api/v1/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const databaseStatus = {
        0: "DISCONNECTED",
        1: "CONNECTED",
        2: "CONNECTING",
        3: "DISCONNECTING"
    };
    res.status(200).json({
        application: "TrekOne API",
        status: "UP",
        database: databaseStatus[dbState],
        uptime: `${process.uptime().toFixed(2)} seconds`,
        timestamp: new Date().toISOString()
    });
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
})
.catch(err => console.error(err));    
