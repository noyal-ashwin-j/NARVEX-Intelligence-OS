import pool from './db.js';

export async function createAndSeedAdvancedTables() {
  console.log('📦 Creating & Seeding MySQL tables for 5 Advanced Intelligence Modules...');

  // 1. Cartel & Offender Nodes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cartel_network_nodes (
      id VARCHAR(64) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      type VARCHAR(64) NOT NULL,
      risk VARCHAR(32),
      status VARCHAR(64),
      district_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Cartel Links
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cartel_network_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_id VARCHAR(64) NOT NULL,
      target_id VARCHAR(64) NOT NULL,
      relation VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. ANPR Checkpost Telemetry
  await pool.query(`
    CREATE TABLE IF NOT EXISTS anpr_checkpost_telemetry (
      id INT AUTO_INCREMENT PRIMARY KEY,
      checkpost_name VARCHAR(255) NOT NULL,
      plate_number VARCHAR(64) NOT NULL,
      vehicle_type VARCHAR(100) NOT NULL,
      status VARCHAR(64) NOT NULL,
      alert_reason VARCHAR(255) NOT NULL,
      district_id INT,
      scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Precursor Chemical Diversion Leaks
  await pool.query(`
    CREATE TABLE IF NOT EXISTS precursor_chemical_leaks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chemical_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      monthly_normal_batch VARCHAR(100) NOT NULL,
      diverted_batch_estimate VARCHAR(100) NOT NULL,
      primary_distributor VARCHAR(255) NOT NULL,
      status VARCHAR(64) NOT NULL,
      target_taluks JSON,
      district_id INT,
      flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5. Darknet & Micro-Financial UPI Signals
  await pool.query(`
    CREATE TABLE IF NOT EXISTS financial_crypto_signals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      channel VARCHAR(100) NOT NULL,
      pattern VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      risk_level VARCHAR(32) NOT NULL,
      confidence VARCHAR(32) NOT NULL,
      district_id INT,
      detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 6. Wastewater Sewage Epidemiology Metrics
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wastewater_epidemiology_metrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      taluk_name VARCHAR(255) NOT NULL,
      metabolite VARCHAR(255) NOT NULL,
      concentration_mg_per_1k DECIMAL(8,2) NOT NULL,
      baseline_mg_per_1k DECIMAL(8,2) NOT NULL,
      surge_pct VARCHAR(32) NOT NULL,
      status VARCHAR(64) NOT NULL,
      district_id INT,
      sampled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed Nodes
  await pool.query(`
    INSERT IGNORE INTO cartel_network_nodes (id, label, type, risk, status, district_id) VALUES
    ('cartel-1', 'Golden Crescent Syndicate', 'CARTEL', 'HIGH', 'OPERATIONAL', 1),
    ('cartel-2', 'Coastal Bay Smuggling Network', 'CARTEL', 'HIGH', 'ACTIVE', 35),
    ('accused-101', 'R. Kanchipuram (A1)', 'OFFENDER', 'HIGH', 'IN_CUSTODY', 2),
    ('accused-102', 'M. Sulur (A2)', 'OFFENDER', 'MEDIUM', 'BAIL_MONITORED', 1),
    ('accused-103', 'V. Hosur (A3)', 'OFFENDER', 'CRITICAL', 'ABSCONDING', 12),
    ('vehicle-TN37', 'Commercial Freight TN-37-X-9982', 'VEHICLE', 'HIGH', 'FLAGGED', 1),
    ('vehicle-TN01', 'Express Container TN-01-AB-1204', 'VEHICLE', 'MEDIUM', 'MONITORED', 3),
    ('hub-cbe', 'Coimbatore Airport Cargo Terminal', 'HUB', 'HIGH', 'WATCHLIST', 1),
    ('hub-tut', 'Thoothukudi Port Container Yard', 'HUB', 'HIGH', 'MARITIME_CHECK', 35),
    ('visitor-88', 'Visitor V. (Puzhal Prison Log)', 'PRISON_VISITOR', 'HIGH', 'SUSPECTED', 3);
  `);

  // Seed Links
  const [existingLinks] = await pool.query('SELECT COUNT(*) as count FROM cartel_network_links');
  if (existingLinks[0].count === 0) {
    await pool.query(`
      INSERT INTO cartel_network_links (source_id, target_id, relation) VALUES
      ('cartel-1', 'accused-101', 'DIRECTS'),
      ('cartel-1', 'accused-102', 'FINANCES'),
      ('cartel-2', 'accused-103', 'SUPPLIES'),
      ('accused-101', 'vehicle-TN37', 'OPERATES'),
      ('accused-102', 'hub-cbe', 'FREIGHT_LOGISTICS'),
      ('accused-103', 'hub-tut', 'MARITIME_DROP'),
      ('accused-101', 'visitor-88', 'PRISON_CONTACT'),
      ('vehicle-TN37', 'vehicle-TN01', 'CONVOY_CROSSING');
    `);
  }

  // Seed ANPR Telemetry
  const [existingAnpr] = await pool.query('SELECT COUNT(*) as count FROM anpr_checkpost_telemetry');
  if (existingAnpr[0].count === 0) {
    await pool.query(`
      INSERT INTO anpr_checkpost_telemetry (checkpost_name, plate_number, vehicle_type, status, alert_reason, district_id) VALUES
      ('Zuzuvadi Border Checkpost (Hosur)', 'TN-37-BK-8821', 'Heavy Freight Container', 'WATCHLIST_MATCH', 'ANPR Weight Anomaly (1.8t excess)', 12),
      ('Walayar Border Checkpost (Coimbatore)', 'KL-09-AH-4102', 'Inter-State Express Van', 'CLEARED', 'Normal Pass', 1),
      ('Kaliyakavallai Border (Kanyakumari)', 'TN-74-C-9011', 'Private SUV', 'CONVOY_ALERT', 'Repeated Border Crossings (4x in 12h)', 14),
      ('Serakuppam Checkpost (Cuddalore)', 'PY-01-X-3390', 'Coastal Parcel Bus', 'WATCHLIST_MATCH', 'Flagged Transport Registration', 6);
    `);
  }

  // Seed Precursors
  const [existingPrecursors] = await pool.query('SELECT COUNT(*) as count FROM precursor_chemical_leaks');
  if (existingPrecursors[0].count === 0) {
    await pool.query(`
      INSERT INTO precursor_chemical_leaks (chemical_name, category, monthly_normal_batch, diverted_batch_estimate, primary_distributor, status, target_taluks, district_id) VALUES
      ('Codeine Phosphate Syrup', 'SCHEDULE_H1_OPIOID', '12,000 Bottles', '2,400 Bottles', 'North Region Wholesale Hub', 'HIGH_DIVERSION_RISK', '["Peelamedu", "Sulur", "Tambaram"]', 1),
      ('Tramadol 100mg Tablets', 'SYNTHETIC_OPIOID', '50,000 Tablets', '8,500 Tablets', 'Border Supply Corridor', 'CRITICAL_LEAK', '["Hosur Urban", "Attibele"]', 12),
      ('Alprazolam 0.5mg', 'BENZODIAZEPINE', '30,000 Tablets', '1,200 Tablets', 'Metropolitan Logistics', 'WATCH', '["Guindy Industrial", "Velachery"]', 3);
    `);
  }

  // Seed Financial Signals
  const [existingFinancial] = await pool.query('SELECT COUNT(*) as count FROM financial_crypto_signals');
  if (existingFinancial[0].count === 0) {
    await pool.query(`
      INSERT INTO financial_crypto_signals (channel, pattern, location, risk_level, confidence, district_id) VALUES
      ('UPI Micro-Merchant Cluster', '88 Rapid Rs.450 payments to single QR handle within 45 mins', 'Peelamedu Campus Zone', 'HIGH', '92%', 1),
      ('Telegram Bot Drop-Shipping', 'Automated location pin drop channel detected', 'Hosur Industrial Bypass', 'EMERGING', '84%', 12),
      ('USDT Crypto Micro-Wallet', '0.04 BTC wallet transfer linked to darknet drop', 'Chennai Seaport Radius', 'HIGH', '89%', 3);
    `);
  }

  // Seed Wastewater Metrics
  const [existingWastewater] = await pool.query('SELECT COUNT(*) as count FROM wastewater_epidemiology_metrics');
  if (existingWastewater[0].count === 0) {
    await pool.query(`
      INSERT INTO wastewater_epidemiology_metrics (taluk_name, metabolite, concentration_mg_per_1k, baseline_mg_per_1k, surge_pct, status, district_id) VALUES
      ('Peelamedu Urban', 'Benzoylecgonine / Ganja Traces', 48.50, 12.00, '+304%', 'HIGH_PREVALENCE', 1),
      ('Hosur Industrial', 'Methamphetamine / MDMA Residue', 32.10, 8.50, '+277%', 'EMERGING_SURGE', 12),
      ('Guindy Industrial', 'Codeine / Tramadol Metabolites', 64.00, 35.00, '+82%', 'ELEVATED', 3);
    `);
  }

  console.log('✅ All 5 Advanced Intelligence Module tables seeded in MySQL!');
}
