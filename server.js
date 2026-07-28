const express = require('express')
const mongoose = require('mongoose');  // MongoDB library
const cors = require('cors')
const path = require('path');
const apiRoute = require('./routes/api')
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const trekRoutes = require('./routes/trek');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/report');

const app = express();
const port = process.env.PORT || '3000';

// app.use(cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin",
//      //    "http://localhost:4200");
//          "http://trekone.s3-website.ap-south-1.amazonaws.com");
//     next();
// });

app.use(cors({
    origin: [
        "https://trekone.netlify.app",
        "http://trekone.s3-website.ap-south-1.amazonaws.com"
        // ,"http://localhost:4200"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// app.use(express.static(path.join(__dirname, 'dist')));

app.use('/payment/razorpay/webhook', express.raw({ type: 'application/json' }));
//app.use(bodyParser.json());     // used when db data in json format
app.use(express.json());

// app.use((err, req, res, next) => {
//     console.error("Global Error:", err.message);
//     res.status(400).json({ error: err.message });
// });
app.use('/api', apiRoute);
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);
app.use('/booking', bookingRoutes);
app.use('/trek', trekRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/reports', reportRoutes);

// app.listen(port, function () {
//     console.log("server running on port " + port)
// });

app.get('/', (req, res) => {
    res.send("server is in running")
});

// app.get('/health', (req, res) => {
//     res.send("Health is OK ");
// });

app.get('/health', (req, res) => {
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

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("MongoDB connected"))
//     .catch(err => console.log(err));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
})
.catch(err => console.error(err));    
