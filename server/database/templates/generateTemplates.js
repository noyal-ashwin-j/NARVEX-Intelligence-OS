import fs from 'fs';
import path from 'path';

const templateDir = 'server/database/templates';
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// 1. Police FIR & Seizure Log Template
const policeTemplate = `event_date,district_name,taluk_name,location_name,category,severity,source_department,description
2026-08-15,Coimbatore,Coimbatore North,Gandhipuram Cross Cut Road,SEIZURE_ENFORCEMENT,HIGH,State Police STF,Commercial consignment intercept containing synthetic stimulant tablets.
2026-08-16,Chennai,Egmore,Egmore Railway Goods Terminal,SEIZURE_ENFORCEMENT,HIGH,RPF & City Police,Seizure of unmanifested parcel crates containing prescription narcotics.
2026-08-17,Salem,Salem South,Sankari Toll Plaza Highway,TRANSIT_CORRIDOR,MEDIUM,Highway Patrol,Intercepted inter-district freight vehicle carrying concealed contraband.`;

// 2. Checkpost Intercept Telemetry Template
const checkpostTemplate = `event_date,district_name,checkpost_name,border_type,transport_mode,contraband_type,description
2026-08-14,Krishnagiri,Zuzuvadi Interstate Checkpost,INTER_STATE,ROAD_HIGHWAY,Synthetic Pills,Vehicle inspection flagged suspicious hidden floor compartment.
2026-08-16,Coimbatore,Walayar Border Toll Post,INTER_STATE,ROAD_HIGHWAY,Commercial Ganja,Heavy goods carrier detained during routine automated weight scan.
2026-08-17,Tenkasi,Puliyarai Border Checkpost,INTER_STATE,BUS_TRANSIT,Prescription Opioids,Interstate passenger bus baggage screening alert.`;

// 3. Hospital / De-Addiction Aggregate Registry Template
const hospitalTemplate = `report_date,district_name,hospital_name,patient_age_group,primary_substance,intake_count,description
2026-08-10,Coimbatore,Coimbatore Medical College Hospital,18-25,SYNTHETIC_MDMA,7,Aggregate admissions flagged for acute synthetic stimulant intoxication.
2026-08-12,Chennai,Kilpauk Institute of Mental Health,19-28,PRESCRIPTION_OPIOIDS,12,Spike in weekly voluntary counseling and withdrawal admissions.
2026-08-15,Madurai,Rajaji Government Hospital,20-30,CANNABIS,9,Community de-addiction outpatient registry aggregated count.`;

fs.writeFileSync(path.join(templateDir, 'police_fir_seizures.csv'), policeTemplate);
fs.writeFileSync(path.join(templateDir, 'checkpost_intercept_telemetry.csv'), checkpostTemplate);
fs.writeFileSync(path.join(templateDir, 'hospital_deaddiction_registry.csv'), hospitalTemplate);

console.log('Sample standard templates created successfully!');
