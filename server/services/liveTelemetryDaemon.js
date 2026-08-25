import pool from '../database/db.js';

let sseClients = [];

/**
 * Register a new Server-Sent Events (SSE) client connection
 */
export function registerSSEClient(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connection confirmation
  const initialPayload = {
    type: 'SYSTEM_STATUS',
    message: '⚡ NARVEX Real-Time Intelligence Stream Connected',
    timestamp: new Date().toISOString()
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
}

/**
 * Broadcast real-time event payload to all connected clients
 */
export function broadcastSSEEvent(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(data);
    } catch {
      // client disconnected
    }
  });
}

/**
 * Live Background Daemon: Generates real-time ANPR & Checkpost Telemetry
 */
let daemonInterval = null;

export function startLiveTelemetryDaemon() {
  if (daemonInterval) return;

  const checkposts = [
    { name: 'Zuzuvadi Border Checkpost (Hosur)', districtId: 12, mode: 'ROAD' },
    { name: 'Walayar Border Checkpost (Coimbatore)', districtId: 1, mode: 'ROAD' },
    { name: 'Kaliyakavallai Border (Kanyakumari)', districtId: 14, mode: 'ROAD' },
    { name: 'Serakuppam Checkpost (Cuddalore)', districtId: 6, mode: 'ROAD' },
    { name: 'Thoothukudi Port Container Gate', districtId: 35, mode: 'MARITIME' },
    { name: 'Coimbatore Airport Cargo Gate', districtId: 1, mode: 'AIR' }
  ];

  const vehicleTypes = ['Heavy Freight Container', 'Inter-State Express Van', 'Private SUV', 'Coastal Parcel Bus'];
  const statuses = ['WATCHLIST_MATCH', 'CONVOY_ALERT', 'CLEARED', 'WEIGHT_ANOMALY'];

  daemonInterval = setInterval(async () => {
    if (sseClients.length === 0) return; // Only broadcast when clients are active

    const cp = checkposts[Math.floor(Math.random() * checkposts.length)];
    const vType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stateCode = ['TN', 'KL', 'KA', 'PY', 'AP'][Math.floor(Math.random() * 5)];
    const distNum = String(Math.floor(Math.random() * 38) + 1).padStart(2, '0');
    const charCode = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const plate = `${stateCode}-${distNum}-${charCode}-${randomNum}`;

    const alertMsg = status === 'WATCHLIST_MATCH'
      ? 'ANPR Watchlist Match (Flagged Smuggler Registration)'
      : (status === 'CONVOY_ALERT' ? 'Repeated Border Crossings (4x in 12h)' : (status === 'WEIGHT_ANOMALY' ? 'Weight Telemetry Anomaly (+1.8t excess)' : 'Normal Pass'));

    const eventPayload = {
      type: 'ANPR_TELEMETRY',
      id: `live-${Date.now()}`,
      checkpost: cp.name,
      plate,
      vehicleType: vType,
      status,
      alert: alertMsg,
      districtId: cp.districtId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to SSE clients
    broadcastSSEEvent(eventPayload);

    // Persist to MySQL in background asynchronously
    try {
      await pool.query(
        `INSERT INTO anpr_checkpost_telemetry (checkpost_name, plate_number, vehicle_type, status, alert_reason, district_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [cp.name, plate, vType, status, alertMsg, cp.districtId]
      );
    } catch (err) {
      // ignore transient db write errors in background stream
    }
  }, 7000); // Emits every 7 seconds
}
