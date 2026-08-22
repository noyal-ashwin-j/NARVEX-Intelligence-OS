import pool from './db.js';

export async function seedRichMultiScopeRoutes() {
  console.log('🌱 Seeding Rich Multi-Scope Routes for WORLD, INDIA, and TAMIL NADU...');

  const conn = await pool.getConnection();
  try {
    const routeItems = [
      // ------------------------------------------------------------------------
      // 1. WORLD SCOPE ROUTES (International -> Tamil Nadu/India)
      // ------------------------------------------------------------------------
      // AIR
      { ref: 'SEED-W-AIR-1', origin: 'Dubai Maritime & Aviation Hub', olat: 25.2048, olng: 55.2708, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'EMERGING', count: 12 },
      { ref: 'SEED-W-AIR-2', origin: 'Golden Triangle (Myanmar Air Link)', olat: 21.0000, olng: 98.0000, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'EMERGING', count: 8 },
      { ref: 'SEED-W-AIR-3', origin: 'Golden Crescent (Afghanistan Air Corridor)', olat: 33.0000, olng: 65.0000, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'EMERGING', count: 15 },
      { ref: 'SEED-W-AIR-4', origin: 'London Heathrow European Hub', olat: 51.5074, olng: -0.1276, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'FORECAST', count: 5 },
      { ref: 'SEED-W-AIR-5', origin: 'Tokyo Narita Asia Axis', olat: 35.6895, olng: 139.6917, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'FORECAST', count: 4 },
      { ref: 'SEED-W-AIR-6', origin: 'New York JFK Transatlantic Line', olat: 40.7128, olng: -74.0060, dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'WORLD', status: 'HISTORICAL_OBSERVED', count: 6 },
      
      // MARITIME
      { ref: 'SEED-W-SEA-1', origin: 'Singapore Shipping Strait', olat: 1.3521, olng: 103.8198, dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'WORLD', status: 'EMERGING', count: 18 },
      { ref: 'SEED-W-SEA-2', origin: 'Colombo Palk Strait Axis (Sri Lanka)', olat: 6.9271, olng: 79.8612, dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'WORLD', status: 'HISTORICAL_OBSERVED', count: 14 },
      { ref: 'SEED-W-SEA-3', origin: 'Cape Town South Africa Deep Sea Route', olat: -33.9249, olng: 18.4241, dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'WORLD', status: 'FORECAST', count: 7 },
      { ref: 'SEED-W-SEA-4', origin: 'Rotterdam Port European Maritime Hub', olat: 51.9244, olng: 4.4777, dest: 'Chennai Container Terminal', dlat: 13.0827, dlng: 80.2707, mode: 'MARITIME', tier: 'WORLD', status: 'HISTORICAL_OBSERVED', count: 9 },

      // ------------------------------------------------------------------------
      // 2. INDIA SCOPE ROUTES (Other Indian States -> Tamil Nadu)
      // ------------------------------------------------------------------------
      // AIR
      { ref: 'SEED-I-AIR-1', origin: 'Delhi NCR Aviation Command', olat: 28.6139, olng: 77.2090, dest: 'Chennai Central Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'INDIA', status: 'EMERGING', count: 16 },
      { ref: 'SEED-I-AIR-2', origin: 'Mumbai International Air Hub', olat: 19.0760, olng: 72.8777, dest: 'Chennai Central Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'INDIA', status: 'HISTORICAL_OBSERVED', count: 12 },
      { ref: 'SEED-I-AIR-3', origin: 'Kolkata Netaji Subhash Air Hub', olat: 22.5726, olng: 88.3639, dest: 'Chennai Central Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'INDIA', status: 'FORECAST', count: 6 },
      { ref: 'SEED-I-AIR-4', origin: 'Hyderabad Rajiv Gandhi Airport', olat: 17.3850, olng: 78.4867, dest: 'Coimbatore Airport Line', dlat: 11.0168, dlng: 76.9558, mode: 'AIR', tier: 'INDIA', status: 'EMERGING', count: 10 },

      // MARITIME
      { ref: 'SEED-I-SEA-1', origin: 'Mundra Port Gujarat Maritime Hub', olat: 22.8396, olng: 69.7042, dest: 'Chennai Container Terminal', dlat: 13.0827, dlng: 80.2707, mode: 'MARITIME', tier: 'INDIA', status: 'EMERGING', count: 14 },
      { ref: 'SEED-I-SEA-2', origin: 'Visakhapatnam Port Andhra Line', olat: 17.6868, olng: 83.2185, dest: 'Thoothukudi VO Chidambaranar Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'INDIA', status: 'HISTORICAL_OBSERVED', count: 11 },
      { ref: 'SEED-I-SEA-3', origin: 'Cochin Port Kerala Sea Route', olat: 9.9312, olng: 76.2673, dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'INDIA', status: 'FORECAST', count: 5 },

      // ROAD
      { ref: 'SEED-I-ROAD-1', origin: 'Bengaluru Interstate Freight Interchange', olat: 12.9716, olng: 77.5946, dest: 'Hosur-Zuzuvadi Border Checkpost', dlat: 12.7409, dlng: 77.8298, mode: 'ROAD', tier: 'INDIA', status: 'EMERGING', count: 28 },
      { ref: 'SEED-I-ROAD-2', origin: 'Kerala Walayar Border Corridor', olat: 10.8354, olng: 76.8483, dest: 'Coimbatore Walayar Highway', dlat: 11.0168, dlng: 76.9558, mode: 'ROAD', tier: 'INDIA', status: 'HISTORICAL_OBSERVED', count: 24 },
      { ref: 'SEED-I-ROAD-3', origin: 'Andhra Border Chittoor Highway', olat: 13.2172, olng: 79.1003, dest: 'Vellore Katpadi Gateway', dlat: 12.9165, dlng: 79.1325, mode: 'ROAD', tier: 'INDIA', status: 'FORECAST', count: 8 },

      // RAIL
      { ref: 'SEED-I-RAIL-1', origin: 'Howrah Kolkata Rail Junction', olat: 22.5839, olng: 88.3426, dest: 'Chennai Central Rail Terminal', dlat: 13.0827, dlng: 80.2707, mode: 'RAIL', tier: 'INDIA', status: 'EMERGING', count: 19 },
      { ref: 'SEED-I-RAIL-2', origin: 'Nizamuddin Delhi Rail Line', olat: 28.5891, olng: 77.2514, dest: 'Chennai Central Rail Terminal', dlat: 13.0827, dlng: 80.2707, mode: 'RAIL', tier: 'INDIA', status: 'HISTORICAL_OBSERVED', count: 15 },
      { ref: 'SEED-I-RAIL-3', origin: 'CSMT Mumbai Express Line', olat: 18.9400, olng: 72.8353, dest: 'Coimbatore Rail Junction', dlat: 11.0168, dlng: 76.9558, mode: 'RAIL', tier: 'INDIA', status: 'FORECAST', count: 7 },

      // ------------------------------------------------------------------------
      // 3. TAMIL NADU SCOPE ROUTES (Inter-District Tamil Nadu Corridors)
      // ------------------------------------------------------------------------
      // ROAD
      { ref: 'SEED-TN-ROAD-1', origin: 'Coimbatore Industrial Sector', olat: 11.0168, olng: 76.9558, dest: 'Tiruppur Textile Corridor', dlat: 11.1085, dlng: 77.3411, mode: 'ROAD', tier: 'TAMILNADU', status: 'EMERGING', count: 32 },
      { ref: 'SEED-TN-ROAD-2', origin: 'Chennai Port Container Sector', olat: 13.0827, olng: 80.2707, dest: 'Kanchipuram Highway', dlat: 12.8342, dlng: 79.7036, mode: 'ROAD', tier: 'TAMILNADU', status: 'HISTORICAL_OBSERVED', count: 22 },
      { ref: 'SEED-TN-ROAD-3', origin: 'Hosur Industrial Hub', olat: 12.7409, olng: 77.8298, dest: 'Salem Junction Corridor', dlat: 11.6643, dlng: 78.1460, mode: 'ROAD', tier: 'TAMILNADU', status: 'FORECAST', count: 10 },

      // RAIL
      { ref: 'SEED-TN-RAIL-1', origin: 'Chennai Central Rail Terminal', olat: 13.0827, olng: 80.2707, dest: 'Coimbatore Rail Junction', dlat: 11.0168, dlng: 76.9558, mode: 'RAIL', tier: 'TAMILNADU', status: 'EMERGING', count: 21 },
      { ref: 'SEED-TN-RAIL-2', origin: 'Trichy Junction Railway Node', olat: 10.7905, olng: 78.7047, dest: 'Madurai Rail Junction', dlat: 9.9252, dlng: 78.1198, mode: 'RAIL', tier: 'TAMILNADU', status: 'HISTORICAL_OBSERVED', count: 17 },
      { ref: 'SEED-TN-RAIL-3', origin: 'Erode Junction Rail Line', olat: 11.3410, olng: 77.7172, dest: 'Salem Rail Junction', dlat: 11.6643, dlng: 78.1460, mode: 'RAIL', tier: 'TAMILNADU', status: 'FORECAST', count: 9 },

      // AIR
      { ref: 'SEED-TN-AIR-1', origin: 'Chennai International Airport', olat: 13.0827, olng: 80.2707, dest: 'Coimbatore Airport Command', dlat: 11.0168, dlng: 76.9558, mode: 'AIR', tier: 'TAMILNADU', status: 'EMERGING', count: 16 },
      { ref: 'SEED-TN-AIR-2', origin: 'Trichy International Airport', olat: 10.7905, olng: 78.7047, dest: 'Chennai International Airport', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'TAMILNADU', status: 'HISTORICAL_OBSERVED', count: 14 },
      { ref: 'SEED-TN-AIR-3', origin: 'Madurai Domestic Air Sector', olat: 9.9252, olng: 78.1198, dest: 'Chennai Airport Command', dlat: 13.0827, dlng: 80.2707, mode: 'AIR', tier: 'TAMILNADU', status: 'FORECAST', count: 6 },

      // MARITIME
      { ref: 'SEED-TN-SEA-1', origin: 'Chennai Port Container Command', olat: 13.0827, olng: 80.2707, dest: 'Thoothukudi VO Chidambaranar Port', dlat: 8.7642, dlng: 78.1348, mode: 'MARITIME', tier: 'TAMILNADU', status: 'EMERGING', count: 25 },
      { ref: 'SEED-TN-SEA-2', origin: 'Ennore Port Shipping Link', olat: 13.2573, olng: 80.3235, dest: 'Kattupalli Harbor Route', dlat: 13.3150, dlng: 80.3340, mode: 'MARITIME', tier: 'TAMILNADU', status: 'HISTORICAL_OBSERVED', count: 13 },
      { ref: 'SEED-TN-SEA-3', origin: 'Nagapattinam Harbor Sector', olat: 10.7656, olng: 79.8447, dest: 'Cuddalore Port Axis', dlat: 11.7480, dlng: 79.7714, mode: 'MARITIME', tier: 'TAMILNADU', status: 'FORECAST', count: 7 }
    ];

    for (const item of routeItems) {
      for (let i = 0; i < item.count; i++) {
        const obsRef = `${item.ref}-OBS-${i + 1}`;
        const obsDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000)
          .toISOString().slice(0, 19).replace('T', ' ');

        await conn.query(
          `INSERT INTO route_observations 
            (route_ref, district_id, corridor_id, origin_name, origin_country, origin_state, origin_lat, origin_lng, dest_name, destination_state, dest_lat, dest_lng, transport_mode, scope_tier, verification_status, observed_at)
           VALUES (?, 2, 1, ?, 'India', 'State', ?, ?, ?, 'Tamil Nadu', ?, ?, ?, ?, 'VERIFIED', ?)
           ON DUPLICATE KEY UPDATE observed_at = VALUES(observed_at)`,
          [obsRef, item.origin, item.olat, item.olng, item.dest, item.dlat, item.dlng, item.mode, item.tier, obsDate]
        );
      }

      // Also upsert into route_intelligence directly to guarantee complete coverage
      const routeId = `RT-${item.tier}-${item.origin.replace(/\s+/g, '_')}-TO-${item.dest.replace(/\s+/g, '_')}`;
      const velocity = item.status === 'EMERGING' ? 1.85 : item.status === 'FORECAST' ? 0.65 : 0.95;
      const confidence = item.status === 'EMERGING' ? 0.92 : item.status === 'FORECAST' ? 0.84 : 0.78;

      await conn.query(
        `INSERT INTO route_intelligence
          (route_id, origin_region, destination_region, origin_lat, origin_lng, destination_lat, destination_lng, transport_mode, scope_tier, observation_count, verified_event_count, unique_sources, historical_frequency, recent_velocity, trend_direction, evidence_confidence, derived_state, arc_status, first_observed_at, last_observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
          observation_count = VALUES(observation_count),
          verified_event_count = VALUES(verified_event_count),
          arc_status = VALUES(arc_status),
          evidence_confidence = VALUES(evidence_confidence),
          recent_velocity = VALUES(recent_velocity)`,
        [
          routeId,
          item.origin,
          item.dest,
          item.olat,
          item.olng,
          item.dlat,
          item.dlng,
          item.mode,
          item.tier,
          item.count,
          Math.ceil(item.count * 0.8),
          3,
          (item.count / 12).toFixed(4),
          velocity,
          item.status === 'EMERGING' ? 'INCREASING' : 'STABLE',
          confidence,
          item.status === 'EMERGING' ? 'EMERGING_ASSOCIATION' : item.status === 'FORECAST' ? 'MONITORED' : 'OBSERVED',
          item.status
        ]
      );
    }

    console.log('✅ Multi-Scope Routes Seeded Successfully!');
  } finally {
    conn.release();
  }
}

// Execute if called directly
if (process.argv[1].includes('seedRichMultiScopeRoutes.js')) {
  seedRichMultiScopeRoutes().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
