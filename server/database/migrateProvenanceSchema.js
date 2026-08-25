import pool from './db.js';

export async function ensureProvenanceSchema() {
  try {
    const [cols] = await pool.query('DESCRIBE event_provenance');
    const existing = cols.map((c) => c.Field);

    // Make legacy strict columns optional or default to CURRENT_TIMESTAMP
    const timestampCols = ['observed_at', 'reported_at', 'ingested_at'];
    for (const tsCol of timestampCols) {
      if (existing.includes(tsCol)) {
        await pool.query(`ALTER TABLE event_provenance MODIFY COLUMN ${tsCol} DATETIME DEFAULT CURRENT_TIMESTAMP`);
      }
    }

    if (existing.includes('event_ref')) {
      await pool.query('ALTER TABLE event_provenance MODIFY COLUMN event_ref VARCHAR(100) DEFAULT NULL');
    }
    if (existing.includes('source_id')) {
      await pool.query('ALTER TABLE event_provenance MODIFY COLUMN source_id INT DEFAULT 3');
    }
    if (existing.includes('district_id')) {
      await pool.query('ALTER TABLE event_provenance MODIFY COLUMN district_id INT DEFAULT NULL');
    }
    if (existing.includes('description')) {
      await pool.query('ALTER TABLE event_provenance MODIFY COLUMN description TEXT DEFAULT NULL');
    }

    const neededCols = [
      { name: 'sheet_name', type: "VARCHAR(100) DEFAULT 'Sheet1'" },
      { name: 'source_row_number', type: 'INT DEFAULT 1' },
      { name: 'batch_id', type: 'INT DEFAULT NULL' },
      { name: 'raw_payload_hash', type: 'VARCHAR(128) DEFAULT NULL' },
      { name: 'extraction_confidence', type: 'DECIMAL(5,2) DEFAULT 85.00' },
      { name: 'human_reviewer_id', type: 'INT DEFAULT NULL' },
      { name: 'review_timestamp', type: 'DATETIME DEFAULT NULL' },
      { name: 'transformation_log', type: 'TEXT DEFAULT NULL' }
    ];

    for (const col of neededCols) {
      if (!existing.includes(col.name)) {
        await pool.query(`ALTER TABLE event_provenance ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Auto-migrated event_provenance column: ${col.name}`);
      }
    }
  } catch (err) {
    console.warn('Provenance schema auto-migration warning:', err.message);
  }
}
