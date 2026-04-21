import db from './database.js';
// import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export abstract class BaseService {
  protected db = db;

  protected async withTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await this.db.transaction(callback);
    } catch (error) {
      // logger.error('Transaction failed:', error);
      throw new AppError('Database operation failed');
    }
  }

  protected logError(error: unknown, context: string): void {
    // logger.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
      throw new AppError(error.message);
    } else {
      throw new AppError('An unexpected error occurred');
    }
  }
} 