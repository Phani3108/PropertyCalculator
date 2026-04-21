import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  private static instance: Database;
  private db: sqlite3.Database;
  private initialized: boolean = false;

  private constructor() {
    const dbPath = join(__dirname, '../../property_calc.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
    });

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Read and execute schema
      const schemaPath = join(__dirname, '../data/schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf-8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      // Execute each statement in a transaction
      await this.transaction(async () => {
        for (const stmt of statements) {
          await this.run(stmt + ';');
        }
      });

      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Error executing SQL:', sql);
          if (params.length > 0) {
            console.error('Parameters:', params);
          }
          console.error('Error:', err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Error executing SQL:', sql);
          if (params.length > 0) {
            console.error('Parameters:', params);
          }
          console.error('Error:', err);
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error executing SQL:', sql);
          if (params.length > 0) {
            console.error('Parameters:', params);
          }
          console.error('Error:', err);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async exec(sql: string): Promise<void> {
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const stmt of statements) {
      await this.run(stmt + ';');
    }
  }

  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default Database.getInstance(); 