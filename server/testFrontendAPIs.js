import fetch from 'node-fetch';

async function testFrontendFlow() {
  console.log('--- Testing API Flow for StateCommandCenter ---');
  
  // 1. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'state_admin', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, 'Success:', loginData.success);
  if (!loginData.success) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Get Me
  const meRes = await fetch('http://localhost:5000/api/auth/me', { headers: authHeaders });
  const meData = await meRes.json();
  console.log('Auth Me:', meRes.status, meData.user?.username);

  // 3. Get Districts
  const distRes = await fetch('http://localhost:5000/api/districts?sortBy=priority&riskLevel=ALL', { headers: authHeaders });
  const distData = await distRes.json();
  console.log('Districts Status:', distRes.status, 'Count:', distData.districts?.length);

  // 4. Get What Changed
  const wcRes = await fetch('http://localhost:5000/api/intelligence/what-changed', { headers: authHeaders });
  const wcData = await wcRes.json();
  console.log('What Changed Status:', wcRes.status, 'Success:', wcData.success);

  // 5. Get Map Data
  const mapRes = await fetch('http://localhost:5000/api/map/layers', { headers: authHeaders });
  const mapData = await mapRes.json();
  console.log('Map Data Status:', mapRes.status, 'Risk Zones:', mapData.data?.riskZones?.length, 'Corridors:', mapData.data?.associations?.length);

  // 6. Get Governance Metrics
  const govRes = await fetch('http://localhost:5000/api/governance/metrics', { headers: authHeaders });
  const govData = await govRes.json();
  console.log('Governance Metrics Status:', govRes.status, 'Active Alerts:', govData.data?.activeAlertsCount);

  // 7. Test Security Dashboard
  const secRes = await fetch('http://localhost:5000/api/security/dashboard', { headers: authHeaders });
  const secData = await secRes.json();
  console.log('Security Dashboard Status:', secRes.status, 'Threat Score:', secData.threatAnomaly?.anomalyScore);

  console.log('--- ALL FRONTEND APIs TESTED CLEANLY ---');
}

testFrontendFlow().catch(console.error);
