import fs from 'fs';
import path from 'path';
import pool from './db.js';

async function applySchema() {
  console.log('⚡ Applying Phase 1 Database Schema to MySQL narvex...');
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'database', 'PHASE1_SCHEMA.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments
    const cleanSql = sqlContent.replace(/--.*$/gm, '');

    // Split SQL by semicolon safely
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const connection = await pool.getConnection();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const stmt of statements) {
      if (stmt.length > 5) {
        await connection.query(stmt);
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    console.log('✅ Phase 1 Database Schema applied successfully! 32 Dataset tables & derived intelligence tables ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to apply Phase 1 Schema:', err.message);
    process.exit(1);
  }
}

applySchema();
