const dotenv = require('dotenv');
dotenv.config();

const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const smsRoutes = require('./routes/smsRoutes');
const configRoutes = require('./routes/configRoutes');

const rateLimit = require('express-rate-limit');

// Robust Sentry Init
const SENTRY_DSN = process.env.SENTRY_DSN;
if (SENTRY_DSN && SENTRY_DSN.startsWith('https') && !SENTRY_DSN.includes('mongo')) {
    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
} else {
    console.warn("Sentry DSN invalid or missing, initializing with dummy DSN.");
    Sentry.init({
        dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
        integrations: [],
    });
}

connectDB();

const app = express();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased to avoid lockout
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased significantly to avoid lockout during verification
    message: "Too many login attempts, please try again after 15 minutes"
});

app.use(express.json());
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false, // Required for local network resource sharing
}));
app.use(morgan('dev'));

// Apply global rate limiter to all requests
app.use(limiter);

app.get('/api/ping', (req, res) => res.json({ message: 'pong', time: new Date() }));

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/device', require('./routes/deviceRoutes'));

// The error handler must be before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});