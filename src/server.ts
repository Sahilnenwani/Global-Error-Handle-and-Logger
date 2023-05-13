const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create logger
const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logsDir, 'combined.log') })
    ]
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err:any) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    process.exit(1);
});

// Example express route that throws an error
app.get('/', (req, res) => {
    throw new Error('Something went wrong!');
});

// Handle errors
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Something went wrong!');
});

// Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
