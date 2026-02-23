const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const smsRoutes = require('./routes/smsRoutes');
const configRoutes = require('./routes/configRoutes');

const rateLimit = require('express-rate-limit');

connectDB();

const app = express();

// Trust Nginx Proxy
app.set('trust proxy', 1);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many login attempts, please try again after 15 minutes" }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOrigins = [
    ...envOrigins,
    frontendUrl,
    'http://localhost:5173',
    'https://connecthubapp.bond',
    'https://www.connecthubapp.bond',
    'http://116.203.28.131'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
        } else {
            console.log('[CORS] Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// Request Logger for debugging
app.use('/api', (req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use(limiter);

app.get('/api/ping', (req, res) => res.json({ message: 'pong', time: new Date() }));

// Authentication routes
app.post('/api/login', loginLimiter);
app.use('/api', authRoutes); // This handles /api/login, /api/me etc.
app.use('/api/auth', authRoutes); // Fallback for old apps

// SMS and Config routes
app.use('/api/sms', smsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/device', require('./routes/deviceRoutes'));

// 404 handler for API
app.use('/api', (req, res) => {
    console.log(`[API 404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Task 3: Setup Socket.io
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.id}`);
    });
});

// Export io for use in controllers
app.set('socketio', io);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
