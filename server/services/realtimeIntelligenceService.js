/**
 * NARVEX Real-Time Command Mesh Service (SSE / Live Broadcast)
 * 
 * Capability: Broadcasts live telemetry updates, newly ingested signals,
 * alert notifications, and background intelligence recalculations to connected dashboards in real time.
 */

const clients = new Set();

export function handleSseConnection(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = `CLIENT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const newClient = { id: clientId, res };
  clients.add(newClient);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    clientId,
    status: 'DATA_STREAM_ACTIVE',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: new Date().toISOString() })}\n\n`);
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(newClient);
  });
}

export function broadcastIntelligenceEvent(eventType, payload) {
  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    try {
      client.res.write(`data: ${message}\n\n`);
    } catch (err) {
      clients.delete(client);
    }
  }
}

export function getActiveConnectionsCount() {
  return clients.size;
}

export default {
  handleSseConnection,
  broadcastIntelligenceEvent,
  getActiveConnectionsCount
};
