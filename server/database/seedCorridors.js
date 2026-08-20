import pool from './db.js';

export async function seedTransitCorridors() {
  console.log('Seeding Transport Transit Corridors (Inter-District & Intra-District)...');

  try {
    const [cols] = await pool.query('DESCRIBE spatial_associations');
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('transport_mode')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN transport_mode VARCHAR(50) DEFAULT 'ROAD_HIGHWAY'");
    }
    if (!colNames.includes('route_type')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN route_type VARCHAR(50) DEFAULT 'INTER_DISTRICT'");
    }
    if (!colNames.includes('primary_contraband')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN primary_contraband VARCHAR(100) DEFAULT 'Synthetic Narcotics / MDMA'");
    }
    if (!colNames.includes('risk_intensity')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN risk_intensity VARCHAR(50) DEFAULT 'ELEVATED'");
    }
    if (!colNames.includes('checkposts_on_route')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN checkposts_on_route TEXT");
    }
    if (!colNames.includes('average_transit_time_hrs')) {
      await pool.query("ALTER TABLE spatial_associations ADD COLUMN average_transit_time_hrs DECIMAL(4,1) DEFAULT 2.0");
    }

    await pool.query('DELETE FROM spatial_associations');

    const sampleRoutes = [
      // 1. Inter-District Road: Krishnagiri -> Salem
      {
        origin: 10, dest: 4, name: 'NH44 Interstate Freight Axis (Krishnagiri ➔ Salem)',
        count: 48, conf: 'HIGH', cats: 'Transit, Supply', sources: 'Checkpost, STF Unit', trend: 'RISING',
        mode: 'ROAD_HIGHWAY', type: 'INTER_DISTRICT', contraband: 'Synthetic Pills & Methamphetamine',
        risk: 'CRITICAL', checkposts: 'Zuzuvadi Checkpost, Thoppur Toll Plaza, Omalur Checkpost', time: 2.5,
        waypoints: JSON.stringify([[12.5186, 78.2137], [12.2856, 78.1632], [11.9680, 78.0820], [11.6643, 78.1460]]),
        date: '2026-08-16'
      },
      // 2. Inter-District Road: Salem -> Coimbatore
      {
        origin: 4, dest: 2, name: 'NH544 Kongu Express Cargo Corridor (Salem ➔ Coimbatore)',
        count: 64, conf: 'HIGH', cats: 'Transit, Seizure', sources: 'Checkpost, STF Unit', trend: 'RISING',
        mode: 'ROAD_HIGHWAY', type: 'INTER_DISTRICT', contraband: 'Commercial Ganja Consignments',
        risk: 'CRITICAL', checkposts: 'Sankari Toll, Vijayamangalam Toll, Karumathampatti Checkpost', time: 3.2,
        waypoints: JSON.stringify([[11.6643, 78.1460], [11.4782, 77.8760], [11.3410, 77.7172], [11.1085, 77.3411], [11.0168, 76.9558]]),
        date: '2026-08-17'
      },
      // 3. Inter-District Railway: Chennai Central -> Coimbatore Jn
      {
        origin: 1, dest: 2, name: 'Southern Railway Express Transit (Chennai ➔ Coimbatore)',
        count: 38, conf: 'HIGH', cats: 'Transit, Railway Intercept', sources: 'RPF, GRP Police', trend: 'RISING',
        mode: 'RAILWAY', type: 'INTER_DISTRICT', contraband: 'Prescription Opioids & Synthetic Tablets',
        risk: 'ELEVATED', checkposts: 'Chennai Central Parcel Yard, Salem Jn Platform 4, Coimbatore Jn Goods Shed', time: 7.5,
        waypoints: JSON.stringify([[13.0827, 80.2707], [12.9815, 79.9725], [12.6820, 78.5910], [11.6643, 78.1460], [11.3410, 77.7172], [11.0168, 76.9558]]),
        date: '2026-08-15'
      },
      // 4. Inter-District Coastal: Thoothukudi -> Ramanathapuram
      {
        origin: 16, dest: 18, name: 'Gulf of Mannar Coastal Maritime Route (Thoothukudi ➔ Rameswaram)',
        count: 29, conf: 'MEDIUM', cats: 'Maritime Transit, Coast Guard Alert', sources: 'Coastal Security Group, Marine Police', trend: 'RISING',
        mode: 'COASTAL_MARITIME', type: 'INTER_DISTRICT', contraband: 'High-Purity Ganja & Hashish',
        risk: 'CRITICAL', checkposts: 'Thoothukudi VOC Port, Vembar Coastal Post, Rameswaram Jetty', time: 4.0,
        waypoints: JSON.stringify([[8.7642, 78.1348], [9.1020, 78.3410], [9.2882, 79.1240], [9.2876, 79.3129]]),
        date: '2026-08-16'
      },
      // 5. Inter-District Road: Madurai -> Tenkasi
      {
        origin: 3, dest: 14, name: 'Southern Ghat Interstate Route (Madurai ➔ Tenkasi / Kerala Border)',
        count: 27, conf: 'MEDIUM', cats: 'Transit, Intercept', sources: 'Citizen Tip, Checkpost', trend: 'RISING',
        mode: 'ROAD_HIGHWAY', type: 'INTER_DISTRICT', contraband: 'Multiple Ganja Packets',
        risk: 'ELEVATED', checkposts: 'Kappalur Toll, Rajapalayam Checkpost, Puliyarai Border Post', time: 2.8,
        waypoints: JSON.stringify([[9.9252, 78.1198], [9.6710, 77.8240], [9.4530, 77.5520], [8.9594, 77.3152]]),
        date: '2026-08-14'
      },
      // 6. Inter-District Air Cargo: Bangalore / Hosur Hub -> Chennai Airport
      {
        origin: 10, dest: 1, name: 'Bangalore-Chennai Expressway Courier Line (Hosur ➔ Chennai)',
        count: 22, conf: 'HIGH', cats: 'Express Courier, Logistics', sources: 'Customs, STF Unit', trend: 'STABLE',
        mode: 'AIR_CARGO', type: 'INTER_DISTRICT', contraband: 'Synthetic MDMA & Designer Stimulants',
        risk: 'ELEVATED', checkposts: 'Hosur SIPCOT Hub, Sriperumbudur Logistics Park, Meenambakkam Cargo Terminal', time: 5.0,
        waypoints: JSON.stringify([[12.7409, 77.8253], [12.8340, 79.7040], [12.9815, 79.9725], [13.0827, 80.2707]]),
        date: '2026-08-12'
      },
      
      // === INTRA-DISTRICT ROUTES (Inside Specific Districts) ===
      
      // 7. Intra-District Coimbatore: Walayar Border -> Gandhipuram
      {
        origin: 2, dest: 2, name: 'Walayar Checkpost ➔ Madukkarai ➔ Gandhipuram Central Hub',
        count: 41, conf: 'HIGH', cats: 'Local Transit, Urban Distribution', sources: 'Checkpost, City Patrol', trend: 'RISING',
        mode: 'ROAD_HIGHWAY', type: 'INTRA_DISTRICT', contraband: 'Synthetic MDMA & Weed Parcels',
        risk: 'CRITICAL', checkposts: 'Walayar Toll Plaza, KG Chavadi Checkpost, Ukkadam Roundabout', time: 0.8,
        waypoints: JSON.stringify([[10.8350, 76.8520], [10.9020, 76.9210], [10.9950, 76.9600], [11.0180, 76.9680]]),
        date: '2026-08-17'
      },
      // 8. Intra-District Coimbatore: Coimbatore Jn Rail -> College Peelamedu Zone
      {
        origin: 2, dest: 2, name: 'Coimbatore Jn Railway Hub ➔ Peelamedu College Zone Belt',
        count: 33, conf: 'HIGH', cats: 'Railway Parcel, Student Zone Delivery', sources: 'RPF, STF Unit', trend: 'RISING',
        mode: 'RAILWAY', type: 'INTRA_DISTRICT', contraband: 'Synthetic Vape Cartridges & MDMA Tablets',
        risk: 'CRITICAL', checkposts: 'Coimbatore Jn Parcel Gate, Avinashi Road Flyover, Peelamedu Junction', time: 0.5,
        waypoints: JSON.stringify([[10.9980, 76.9620], [11.0110, 76.9850], [11.0250, 77.0120], [11.0310, 77.0340]]),
        date: '2026-08-16'
      },
      // 9. Intra-District Coimbatore: Pollachi Checkpost -> Ukkadam
      {
        origin: 2, dest: 2, name: 'Pollachi Southern Checkpost ➔ Ukkadam Bus Terminal Route',
        count: 26, conf: 'MEDIUM', cats: 'Inter-Taluk Bus Transit', sources: 'Taluk Police, Helpline', trend: 'STABLE',
        mode: 'BUS_TRANSIT', type: 'INTRA_DISTRICT', contraband: 'Compressed Ganja Slabs',
        risk: 'ELEVATED', checkposts: 'Achipatti Checkpost, Kinathukadavu Toll, Sundarapuram', time: 1.1,
        waypoints: JSON.stringify([[10.6610, 77.0080], [10.8210, 76.9940], [10.9420, 76.9720], [10.9910, 76.9610]]),
        date: '2026-08-15'
      },
      // 10. Intra-District Chennai: Chennai Port -> Koyambedu
      {
        origin: 1, dest: 1, name: 'Chennai Port Container Terminal ➔ Koyambedu Wholesale Market',
        count: 36, conf: 'HIGH', cats: 'Heavy Logistics, Wholesaler Link', sources: 'Customs, Police FIR', trend: 'RISING',
        mode: 'ROAD_HIGHWAY', type: 'INTRA_DISTRICT', contraband: 'Commercial Consignments',
        risk: 'CRITICAL', checkposts: 'Port Gate 4, Madhavaram Bypass, Koyambedu Terminal', time: 0.9,
        waypoints: JSON.stringify([[13.0980, 80.2980], [13.1210, 80.2450], [13.0720, 80.1940]]),
        date: '2026-08-17'
      },
      // 11. Intra-District Chennai: Egmore Railway -> T. Nagar / Guindy
      {
        origin: 1, dest: 1, name: 'Chennai Egmore Rail Hub ➔ T. Nagar / Guindy Commercial Hub',
        count: 28, conf: 'HIGH', cats: 'Passenger Rail Transit, Courier', sources: 'GRP, Local Police', trend: 'STABLE',
        mode: 'RAILWAY', type: 'INTRA_DISTRICT', contraband: 'Synthetic Tablets & Meth',
        risk: 'ELEVATED', checkposts: 'Egmore Parcel Yard, Anna Salai Junction, Guindy Circle', time: 0.6,
        waypoints: JSON.stringify([[13.0800, 80.2610], [13.0410, 80.2330], [13.0060, 80.2010]]),
        date: '2026-08-14'
      },
      // 12. Intra-District Madurai: Madurai Jn Rail -> Mattuthavani Bus Stand
      {
        origin: 3, dest: 3, name: 'Madurai Jn Station ➔ Mattuthavani Inter-City Bus Stand',
        count: 24, conf: 'MEDIUM', cats: 'Interchange Delivery, Bus Carrier', sources: 'Police Station, Citizen Tip', trend: 'RISING',
        mode: 'BUS_TRANSIT', type: 'INTRA_DISTRICT', contraband: 'Ganja Packets',
        risk: 'ELEVATED', checkposts: 'Madurai Jn RPF Outpost, Goripalayam Bridge, Mattuthavani Bus Terminus', time: 0.4,
        waypoints: JSON.stringify([[9.9190, 78.1120], [9.9320, 78.1340], [9.9480, 78.1620]]),
        date: '2026-08-16'
      }
    ];

    for (const r of sampleRoutes) {
      await pool.query(
        `INSERT INTO spatial_associations 
         (origin_district_id, destination_district_id, corridor_name, observation_count, confidence_level, 
          primary_categories, primary_sources, trend_direction, waypoints_json, last_observed_date, disclaimer,
          transport_mode, route_type, primary_contraband, risk_intensity, checkposts_on_route, average_transit_time_hrs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.origin, r.dest, r.name, r.count, r.conf, r.cats, r.sources, r.trend, r.waypoints, r.date,
          'Historical spatial association observed based on available records. Does not establish confirmed trafficking without case-specific evidence.',
          r.mode, r.type, r.contraband, r.risk, r.checkposts, r.time
        ]
      );
    }

    console.log(`Successfully populated ${sampleRoutes.length} detailed transport corridors in MySQL database!`);
  } catch (err) {
    console.error('Error seeding corridors:', err);
  }
}

if (process.argv[1]?.endsWith('seedCorridors.js')) {
  seedTransitCorridors().then(() => process.exit(0));
}
