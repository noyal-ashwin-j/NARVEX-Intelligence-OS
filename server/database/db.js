import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Ragunath5160',
  database: process.env.DB_NAME || 'narvex',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

// Quick connectivity verification
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS connection_test');
    connection.release();
    return { ok: true, message: 'MySQL connection established to database narvex' };
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    return { ok: false, error: error.message };
  }
}

export default pool;
