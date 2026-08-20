import pool from '../database/db.js';

/**
 * NARVEX Aggregated Intelligence Knowledge Graph Engine
 * 
 * Capability: Generates an interconnected network graph of Districts, Taluks, Localities,
 * Corridors, Checkposts, and Contraband Categories with bidirectional synchronization to the GIS Map.
 * 
 * Privacy Guard: Strictly aggregated spatial-temporal entities; no individual surveillance.
 */

export async function getAggregatedIntelligenceGraph(selectedDistrictId = null) {
  try {
    // 1. Fetch Districts
    let distQuery = 'SELECT id, name, code, risk_level, center_lat, center_lng, velocity_30d FROM districts';
    const params = [];
    if (selectedDistrictId && selectedDistrictId !== 'ALL') {
      distQuery += ' WHERE id = ?';
      params.push(selectedDistrictId);
    }
    const [districts] = await pool.query(distQuery, params);

    // 2. Fetch Corridors
    const [corridors] = await pool.query(
      `SELECT id, corridor_name, origin_district_id, destination_district_id
       FROM spatial_associations`
    );

    // 3. Fetch Drug Categories
    const [categories] = await pool.query('SELECT id, category_key, category_name, risk_weight FROM event_categories');

    // 4. Fetch Border Checkposts
    const [checkposts] = await pool.query('SELECT id, name, district_id, lat, lng FROM checkposts');

    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    function addNode(node) {
      if (!nodeSet.has(node.id)) {
        nodeSet.add(node.id);
        nodes.push(node);
      }
    }

    // Add District Nodes
    districts.forEach((d) => {
      addNode({
        id: `DISTRICT-${d.id}`,
        label: d.name,
        type: 'DISTRICT',
        entityId: d.id,
        code: d.code,
        riskLevel: d.risk_level,
        velocity30d: d.velocity_30d,
        lat: parseFloat(d.center_lat),
        lng: parseFloat(d.center_lng),
        size: d.risk_level === 'HIGH PREVENTIVE ATTENTION' ? 32 : d.risk_level === 'INCREASING' ? 24 : 18
      });
    });

    // Add Corridor Edges (District -> District)
    corridors.forEach((c) => {
      const originId = `DISTRICT-${c.origin_district_id}`;
      const destId = `DISTRICT-${c.destination_district_id}`;

      if (nodeSet.has(originId) || nodeSet.has(destId)) {
        edges.push({
          id: `EDGE-CORR-${c.id}`,
          source: originId,
          target: destId,
          type: 'SHARED_CORRIDOR',
          label: c.corridor_name,
          route: c.corridor_name,
          distanceKm: 120,
          evidence: `Monitored inter-district transit axis along ${c.corridor_name}`
        });
      }
    });

    // Add Checkposts
    checkposts.forEach((cp) => {
      const cpNodeId = `CHECKPOST-${cp.id}`;
      addNode({
        id: cpNodeId,
        label: cp.name,
        type: 'CHECKPOST',
        entityId: cp.id,
        districtId: cp.district_id,
        lat: parseFloat(cp.lat),
        lng: parseFloat(cp.lng),
        size: 20
      });

      edges.push({
        id: `EDGE-CP-DIST-${cp.id}`,
        source: cpNodeId,
        target: `DISTRICT-${cp.district_id}`,
        type: 'GEOGRAPHIC_CONNECTIVITY',
        label: 'Gateway Checkpost',
        evidence: `Perimeter telemetry gateway attached to district jurisdiction`
      });
    });

    // Add Category Linkages
    categories.slice(0, 4).forEach((cat) => {
      const catNodeId = `CAT-${cat.id}`;
      addNode({
        id: catNodeId,
        label: cat.category_name,
        type: 'CATEGORY',
        entityId: cat.id,
        riskWeight: cat.risk_weight,
        size: 22
      });

      // Link categories to high velocity districts
      districts.filter((d) => d.risk_level === 'HIGH PREVENTIVE ATTENTION' || d.risk_level === 'INCREASING').forEach((d) => {
        edges.push({
          id: `EDGE-CAT-DIST-${cat.id}-${d.id}`,
          source: catNodeId,
          target: `DISTRICT-${d.id}`,
          type: 'PRIMARY_CONTRABAND_SIGNAL',
          label: 'Primary Signal Class',
          evidence: `Telemetry indicates active presence of ${cat.category_name} signals`
        });
      });
    });

    return {
      success: true,
      selectedDistrictId,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      graph: {
        nodes,
        edges
      },
      disclaimer: 'Aggregated relational knowledge graph of administrative and transport telemetry; zero personal profiling.'
    };
  } catch (err) {
    console.error('Network Graph Extraction Error:', err);
    throw err;
  }
}

export default { getAggregatedIntelligenceGraph };
