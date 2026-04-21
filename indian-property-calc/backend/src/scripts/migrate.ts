import { MigrationService } from '../services/migrationService.js';
import db from '../services/database.js';

async function main() {
  try {
    await db.initialize();
    await MigrationService.migrate();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main(); 