require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

const orgRoutes = require('./src/routes/orgRoutes');
const userRoutes = require('./src/routes/userRoutes');
const surveyRoutes = require('./src/routes/surveyRoutes');
const responseRoutes = require('./src/routes/responseRoutes');

const app = express();

app.use(helmet());
app.use(compression());

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/api/health',
}));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: process.env.APP_NAME || 'vclarifi-api',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

app.use('/api/orgs', orgRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;