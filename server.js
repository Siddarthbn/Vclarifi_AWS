require('dotenv').config();
const app = require('./app');
const { getPool } = require('./src/db/connection');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await getPool();
    app.listen(PORT, () => {
      logger.info(`🚀 Vclarifi API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => { logger.info('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { logger.info('Shutting down...'); process.exit(0); });
process.on('unhandledRejection', (reason) => { logger.error('Unhandled Rejection:', reason); });

startServer();