import pool from './db.js';

export async function seedForecasts() {
  console.log('Seeding Automated Early-Warning Forecasts (Future Emerging Risk Zones)...');

  try {
    const [cols] = await pool.query('DESCRIBE forecast_records');
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('location_name')) {
      await pool.query("ALTER TABLE forecast_records ADD COLUMN location_name VARCHAR(150) DEFAULT 'High-Risk Transit Belt'");
    }
    if (!colNames.includes('recommended_action')) {
      await pool.query("ALTER TABLE forecast_records ADD COLUMN recommended_action TEXT");
    }

    await pool.query('DELETE FROM forecast_records');

    const forecasts = [
      // 1. Coimbatore (DT #2) - 30 Day Early Warning
      {
        code: 'FCST-2026-30D-CBE-01',
        districtId: 2,
        talukId: 1,
        location: 'Peelamedu Educational & IT Corridor (Avinashi Road)',
        lat: 11.0250,
        lng: 77.0120,
        radius: 4000,
        days: 30,
        risk: 'HIGH PREVENTIVE ATTENTION',
        conf: 'HIGH',
        coverage: 'GOOD',
        factors: 'Convergence of 4 signals: 42% surge in late-night NH544 freight transit, 3 anonymous tips flagging student drops, rising de-addiction hospital consultations in 18-25 age cohort.',
        action: 'Schedule non-coercive college campus awareness workshops, coordinate preventive student counseling, and intensify late-night highway checkpost weight scans at Karumathampatti.',
        date: '2026-08-01'
      },
      // 2. Coimbatore (DT #2) - 90 Day Early Warning
      {
        code: 'FCST-2026-90D-CBE-02',
        districtId: 2,
        talukId: 2,
        location: 'Walayar Interstate Border & Madukkarai Transit Junction',
        lat: 10.8950,
        lng: 76.9120,
        radius: 5000,
        days: 90,
        risk: 'HIGH PREVENTIVE ATTENTION',
        conf: 'HIGH',
        coverage: 'GOOD',
        factors: 'Historical 3-quarter recurring inter-state freight transit corridor, high density commercial truck transit from Kerala border.',
        action: 'Deploy automated ANPR vehicle scanners at KG Chavadi checkpost, conduct joint inter-agency coordination with state excise authorities.',
        date: '2026-08-01'
      },
      // 3. Chennai (DT #1) - 30 Day Early Warning
      {
        code: 'FCST-2026-30D-CHN-01',
        districtId: 1,
        talukId: 3,
        location: 'Koyambedu Wholesale Terminal & Madhavaram Bypass Belt',
        lat: 13.0720,
        lng: 80.1940,
        radius: 4500,
        days: 30,
        risk: 'HIGH PREVENTIVE ATTENTION',
        conf: 'HIGH',
        coverage: 'GOOD',
        factors: 'High volume inter-district bus traffic, unmanifested courier freight transfers, 4 verified seizure records in surrounding 5km zone.',
        action: 'Establish preventive parcel scanning desk at Koyambedu transit hubs, initiate logistics carrier compliance audits.',
        date: '2026-08-01'
      },
      // 4. Madurai (DT #3) - 30 Day Early Warning
      {
        code: 'FCST-2026-30D-MDU-01',
        districtId: 3,
        talukId: 4,
        location: 'Mattuthavani Inter-City Bus Hub & Ring Road Axis',
        lat: 9.9480,
        lng: 78.1620,
        radius: 3800,
        days: 30,
        risk: 'INCREASING',
        conf: 'MEDIUM',
        coverage: 'MODERATE',
        factors: 'Spike in citizen anonymous observations of passenger transit deliveries, historical southern corridor link from Theni/Tenkasi.',
        action: 'Increase plainclothes preventive surveillance at passenger luggage collection points, deploy community awareness posters.',
        date: '2026-08-01'
      },
      // 5. Salem (DT #4) - 30 Day Early Warning
      {
        code: 'FCST-2026-30D-SLM-01',
        districtId: 4,
        talukId: 5,
        location: 'Sankari Toll Plaza & Steel Plant Highway Crossings',
        lat: 11.4782,
        lng: 77.8760,
        radius: 4200,
        days: 30,
        risk: 'HIGH PREVENTIVE ATTENTION',
        conf: 'HIGH',
        coverage: 'GOOD',
        factors: 'Critical nexus point connecting NH44 (Krishnagiri) and NH544 (Coimbatore) freight routes.',
        action: 'Deploy synchronized multi-point toll checkpoint teams during 22:00–04:00 peak freight transit hours.',
        date: '2026-08-01'
      },
      // 6. Tenkasi (DT #14) - 30 Day Early Warning
      {
        code: 'FCST-2026-30D-TSI-01',
        districtId: 14,
        talukId: 8,
        location: 'Puliyarai Border Checkpost & Shenkottai Ghat Pass',
        lat: 8.9720,
        lng: 77.2150,
        radius: 4000,
        days: 30,
        risk: 'INCREASING',
        conf: 'MEDIUM',
        coverage: 'MODERATE',
        factors: 'Emerging signal burst in last 14 days, sparse historical baseline, border transit terrain vulnerability.',
        action: 'Deploy mobile forest and checkpost patrol units along alternate ghat trails, engage village vigilance committees.',
        date: '2026-08-01'
      },
      // 7. Krishnagiri (DT #10) - 90 Day Early Warning
      {
        code: 'FCST-2026-90D-KRI-01',
        districtId: 10,
        talukId: 5,
        location: 'Hosur Industrial Hub & Zuzuvadi Interstate Toll Post',
        lat: 12.7520,
        lng: 77.8150,
        radius: 5000,
        days: 90,
        risk: 'HIGH PREVENTIVE ATTENTION',
        conf: 'HIGH',
        coverage: 'GOOD',
        factors: 'Persistent multi-quarter checkpost anomalies, heavy industrial freight nexus from Karnataka border.',
        action: 'Collaborate with industrial park associations for worker substance awareness and establish joint interstate intelligence liaison.',
        date: '2026-08-01'
      }
    ];

    for (const f of forecasts) {
      await pool.query(
        `INSERT INTO forecast_records
         (forecast_code, district_id, taluk_id, location_name, center_lat, center_lng, radius_meters, forecast_window_days, risk_level, confidence_level, data_coverage, historical_contributing_factors, recommended_action, model_version, training_date, disclaimer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NRISE-RISK-v1.0', ?, ?)`,
        [
          f.code, f.districtId, f.talukId, f.location, f.lat, f.lng, f.radius, f.days, f.risk, f.conf, f.coverage, f.factors, f.action, f.date,
          'Forecasted Preventive Attention Zone: Decision-support signal for authorized verification and preventive planning; does not independently authorize enforcement action.'
        ]
      );
    }

    console.log(`Successfully populated ${forecasts.length} future emerging risk forecasts in MySQL!`);
  } catch (err) {
    console.error('Error seeding forecasts:', err);
  }
}

if (process.argv[1]?.endsWith('seedForecasts.js')) {
  seedForecasts().then(() => process.exit(0));
}
