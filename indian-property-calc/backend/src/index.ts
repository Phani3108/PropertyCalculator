import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { mainRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import database from './services/database.js';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', mainRouter);

// Error handling
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await database.initialize();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error: unknown) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
