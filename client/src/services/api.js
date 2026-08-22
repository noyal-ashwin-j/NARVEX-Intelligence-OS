const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('narvex_auth_token') || localStorage.getItem('nrise_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('narvex_auth_token', token);
  } else {
    localStorage.removeItem('narvex_auth_token');
    localStorage.removeItem('nrise_auth_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Generic GET
  get: (endpoint, options = {}) => request(endpoint, options),

  // Auth
  login: (username, password, totpCode) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password, ...(totpCode ? { totpCode } : {}) }) }),
  logout: (sessionId) => request('/auth/logout', { method: 'POST', body: JSON.stringify({ sessionId }) }),
  getMe: () => request('/auth/me'),
  getSeedAccounts: () => request('/auth/seed-accounts'),

  // Districts & Intelligence
  getDistricts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/districts${qs ? `?${qs}` : ''}`);
  },
  getDistrictById: (id) => request(`/districts/${id}`),
  getEvents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/intelligence/events${qs ? `?${qs}` : ''}`);
  },
  getEventById: (id) => request(`/intelligence/events/${id}`),
  getAnalytics: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/intelligence/analytics${qs ? `?${qs}` : ''}`);
  },
  getWhatChanged: () => request('/intelligence/what-changed'),
  getMetadata: () => request('/intelligence/metadata'),

  // Advanced Modules
  getEntityGraph: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/intelligence/entity-graph${qs ? `?${qs}` : ''}`);
  },
  getANPRStream: () => request('/intelligence/anpr-stream'),
  getPrecursorDiversion: () => request('/intelligence/precursor-diversion'),
  getFinancialSignals: () => request('/intelligence/financial-signals'),
  getWastewaterMetrics: () => request('/intelligence/wastewater-metrics'),

  // GIS Map
  getMapData: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/map/layers${qs ? `?${qs}` : ''}`);
  },

  // Citizen Anonymous Portal
  submitCitizenReport: (data) => request('/citizen/report', { method: 'POST', body: JSON.stringify(data) }),
  trackCitizenReport: (token) => request(`/citizen/track/${encodeURIComponent(token)}`),
  getVerificationQueue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/citizen/queue${qs ? `?${qs}` : ''}`);
  },
  triageCitizenReport: (id, data) => request(`/citizen/triage/${id}`, { method: 'POST', body: JSON.stringify(data) }),

  // Ingestion & Provenance (Universal Multi-Format Feed)
  feedUniversalIntelligence: (formData) => request('/ingest/universal', { method: 'POST', body: formData }),
  previewIngestionFile: (formData) => request('/ingest/preview', { method: 'POST', body: formData }),
  executeBatchIngestion: (data) => request('/ingest/execute', { method: 'POST', body: JSON.stringify(data) }),
  resolveDuplicateSignal: (signalId, data) => request(`/ingest/resolve-duplicate/${signalId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Spatial-Temporal
  getSpatialAssociations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/spatial/associations${qs ? `?${qs}` : ''}`);
  },
  getRouteIntelligence: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/spatial/routes${qs ? `?${qs}` : ''}`);
  },
  getRouteArcs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/intelligence/arcs${qs ? `?${qs}` : ''}`);
  },
  getMapArcs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/map/arcs${qs ? `?${qs}` : ''}`);
  },
  compareCorridors: (id1, id2) => request(`/spatial/compare?id1=${id1}&id2=${id2}`),

  getMapData: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    try {
      const [assocRes, eventsRes, distRes] = await Promise.all([
        request(`/spatial/associations${qs ? `?${qs}` : ''}`).catch(() => ({ associations: [] })),
        request(`/intelligence/events?limit=100${params.districtId ? `&districtId=${params.districtId}` : ''}`).catch(() => ({ events: [] })),
        request(`/districts`).catch(() => ({ districts: [] }))
      ]);

      const districtsList = distRes.districts || [];
      const targetDistricts = params.districtId 
        ? districtsList.filter(d => String(d.id) === String(params.districtId))
        : districtsList;

      const riskZones = (targetDistricts.length > 0 ? targetDistricts : districtsList).map(d => ({
        id: d.id,
        name: d.name,
        center_lat: d.center_lat || 11.0,
        center_lng: d.center_lng || 78.5,
        risk_level: d.risk_level || 'WATCH',
        confidence_level: '85.0%',
        data_coverage: 'GOOD',
        signal_count: d.total_cases || 5,
        verified_count: d.total_cases || 3,
        primary_factors: 'Active checkpost vigilance & transit route corridor'
      }));

      return {
        success: true,
        data: {
          riskZones,
          associations: assocRes.associations || [],
          events: eventsRes.events || [],
          checkposts: [],
          citizenReports: []
        }
      };
    } catch (err) {
      return { success: false, data: { riskZones: [], associations: [], events: [] } };
    }
  },

  // Forecast & Risk Matrix
  getForecastZones: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/forecast/zones${qs ? `?${qs}` : ''}`);
  },
  getRiskConfidenceMatrix: () => request('/forecast/matrix'),

  // Alerts & Action Tickets
  getAlerts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/alerts${qs ? `?${qs}` : ''}`);
  },
  createActionTicket: (data) => request('/actions/tickets', { method: 'POST', body: JSON.stringify(data) }),
  getActionTickets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/actions/tickets${qs ? `?${qs}` : ''}`);
  },
  updateActionTicket: (id, data) => request(`/actions/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Responsible AI Governance & Thresholds
  getGovernanceMetrics: () => request('/governance/metrics'),
  updateRiskThresholds: (data) => request('/governance/thresholds', { method: 'POST', body: JSON.stringify(data) }),

  // Hash-chain Audit Logs
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/audit/logs${qs ? `?${qs}` : ''}`);
  },
  verifyChainIntegrity: () => request('/audit/verify-chain'),

  // Global Search
  search: (query) => request(`/search?q=${encodeURIComponent(query)}`),

  // Centralized N-RISE Intelligence Assistant
  queryAssistant: (data) => request('/assistant/query', { method: 'POST', body: JSON.stringify(data) })
};
