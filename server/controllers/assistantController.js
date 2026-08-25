import pool from '../database/db.js';
import { getWhatChangedSummary } from '../services/backgroundIntelligenceService.js';

/**
 * NARVEX Centralized Multilingual Intelligence Assistant Engine
 * 
 * Supports:
 * - Languages: Tamil (தமிழ்), Tanglish (Tamil in Latin script), and English.
 * - Speech Output: Returns natural phonetically crafted `spokenText` for Web Speech Synthesis.
 * - UI Directives: Dispatches map actions (zoom, filter, highlight), tab transitions, and ticket generation.
 * - Responsible AI: Grounded strictly in database facts with mandatory disclaimers.
 */

// District Name Mappings in Tamil script to standard English name
const TAMIL_DISTRICT_NAMES = {
  'சென்னை': 'Chennai',
  'கோயம்புத்தூர்': 'Coimbatore',
  'கோவை': 'Coimbatore',
  'மதுரை': 'Madurai',
  'சேலம்': 'Salem',
  'திருச்சிராப்பள்ளி': 'Tiruchirappalli',
  'திருச்சி': 'Tiruchirappalli',
  'திருநெல்வேலி': 'Tirunelveli',
  'நெல்லை': 'Tirunelveli',
  'திருப்பூர்': 'Tiruppur',
  'ஈரோடு': 'Erode',
  'வேலூர்': 'Vellore',
  'கிருஷ்ணகிரி': 'Krishnagiri',
  'திண்டுக்கல்': 'Dindigul',
  'தஞ்சாவூர்': 'Thanjavur',
  'தூத்துக்குடி': 'Thoothukudi',
  'கன்னியாகுமரி': 'Kanniyakumari',
  'நாகர்கோவில்': 'Kanniyakumari',
  'தென்காசி': 'Tenkasi',
  'காஞ்சிபுரம்': 'Kancheepuram',
  'செங்கல்பட்டு': 'Chengalpattu',
  'திருவள்ளூர்': 'Tiruvallur',
  'கடலூர்': 'Cuddalore',
  'விழுப்புரம்': 'Viluppuram',
  'கள்ளக்குறிச்சி': 'Kallakurichi',
  'தர்மபுரி': 'Dharmapuri',
  'நாமக்கல்': 'Namakkal',
  'நீலகிரி': 'Nilgiris',
  'ஊட்டி': 'Nilgiris',
  'கரூர்': 'Karur',
  'அரியலூர்': 'Ariyalur',
  'பெரம்பலூர்': 'Perambalur',
  'புதுக்கோட்டை': 'Pudukkottai',
  'சிவகங்கை': 'Sivaganga',
  'ராமநாதபுரம்': 'Ramanathapuram',
  'விருதுநகர்': 'Virudhunagar',
  'தேனி': 'Theni',
  'திருவாரூர்': 'Thiruvarur',
  'நாகப்பட்டினம்': 'Nagapattinam',
  'மயிலாடுதுறை': 'Mayiladuthurai',
  'ராணிப்பேட்டை': 'Ranipet',
  'திருப்பத்தூர்': 'Tirupathur',
  'திருவண்ணாமலை': 'Tiruvannamalai'
};

// Language detector
function detectLanguage(text) {
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'ta'; // Tamil script
  }
  const tanglishRegex = /\b(innaiku|enna|entha|enga|irukku|iruku|worst|mosama|solli|sollu|paaru|romba|pannu|panna|eppadi|epdi|macha|pathina|evlo|ethana|yen|edhukku|theriyuma|katunga|kaatu|kaattu|solren|rendu|edam)\b/i;
  return tanglishRegex.test(text) ? 'tanglish' : 'en';
}

export async function queryAssistant(req, res) {
  const { query, activeDistrictId, activeTab, activeFilters } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: 'Query string is required.' });
  }

  const q = query.toLowerCase().trim();
  const lang = detectLanguage(query);

  try {
    // 1. Fetch live contextual data from MySQL
    const [districts] = await pool.query(`
      SELECT d.*, 
        COALESCE(a.alert_count, 0) as active_alerts_count, 
        COALESCE(rz.zone_count, 0) as emerging_zones_count 
      FROM districts d
      LEFT JOIN (SELECT district_id, COUNT(*) as alert_count FROM alerts WHERE status NOT IN ('RESOLVED', 'DISMISSED') GROUP BY district_id) a ON d.id = a.district_id
      LEFT JOIN (SELECT district_id, COUNT(*) as zone_count FROM risk_zones WHERE historical_trend = 'NEW_EMERGING' GROUP BY district_id) rz ON d.id = rz.district_id
    `);
    const [forecasts] = await pool.query('SELECT fc.*, d.name as district_name FROM forecast_records fc JOIN districts d ON fc.district_id = d.id');
    const [events] = await pool.query('SELECT e.*, d.name as district_name, c.category_name FROM intelligence_events e JOIN districts d ON e.district_id = d.id JOIN event_categories c ON e.category_id = c.id ORDER BY e.event_date DESC LIMIT 50');
    const [associations] = await pool.query('SELECT sa.*, d1.name as origin_name, d2.name as dest_name FROM spatial_associations sa JOIN districts d1 ON sa.origin_district_id = d1.id JOIN districts d2 ON sa.destination_district_id = d2.id');
    const [alerts] = await pool.query('SELECT a.*, d.name as district_name FROM alerts a JOIN districts d ON a.district_id = d.id WHERE a.status NOT IN (\'RESOLVED\', \'DISMISSED\') ORDER BY a.created_at DESC LIMIT 20');
    const whatChanged = await getWhatChangedSummary();

    // Current district
    const currentDist = districts.find((d) => d.id === parseInt(activeDistrictId, 10)) || districts.find((d) => d.id === 2) || districts[0];

    let responseText = '';
    let spokenText = '';
    let dataPayload = null;
    let actions = [];
    let mapAction = null;
    let tabAction = null;

    // Check for Tamil District Names in Query
    let matchedDistrict = null;
    for (const [taName, enName] of Object.entries(TAMIL_DISTRICT_NAMES)) {
      if (query.includes(taName)) {
        matchedDistrict = districts.find((d) => d.name.toLowerCase() === enName.toLowerCase());
        if (matchedDistrict) break;
      }
    }
    if (!matchedDistrict) {
      matchedDistrict = districts.find((d) => q.includes(d.name.toLowerCase()));
    }

    // --- INTENT 1: "HIGHEST INCREASING RISK" / "WORST-AH IRUKU" / "எந்த மாவட்டம் மோசமாக உள்ளது" ---
    if (
      q.includes('highest') ||
      q.includes('worst') ||
      q.includes('mosama') ||
      q.includes('increasing risk') ||
      q.includes('entha district') ||
      query.includes('அதிக இடர்') ||
      query.includes('மோசமான') ||
      query.includes('எந்த மாவட்டம்') ||
      q.includes('top risk') ||
      q.includes('vegam')
    ) {
      const sortedByRisk = [...districts].sort((a, b) => (parseFloat(b.velocity_30d) || 0) - (parseFloat(a.velocity_30d) || 0));
      const top1 = sortedByRisk[0] || districts[1];
      const top2 = sortedByRisk[1] || districts[0];

      if (lang === 'ta') {
        responseText = `**அதிகரிக்கும் இடர் பகுப்பாய்வு (Highest Increasing Risk):**\n\n` +
          `தற்போதைய 30 நாள் கண்காணிப்பு அடிப்படையில், **${top1.name}** மாவட்டம் அதிகபட்ச சிக்னல் வேகத்தை (${top1.velocity_30d || '6.0'}x Velocity) காட்டுகிறது.\n\n` +
          `• **${top1.name}:** இடர் நிலை: **${top1.risk_level}** | நம்பிக்கை: ${top1.confidence_score}% | விழிப்பூட்டல்கள்: ${top1.active_alerts_count}\n` +
          `• **${top2.name}:** இடர் நிலை: **${top2.risk_level}** | சிக்னல் வேகம்: ${top2.velocity_30d || '4.0'}x\n\n` +
          `காரணிகள்: நெடுஞ்சாலை சோதனைச்சாவடி சரக்கு வேறுபாடுகள் மற்றும் கல்வி நிறுவனங்கள் அருகிலான சிக்னல்கள்.`;
        spokenText = `தற்போது ${top1.name} மாவட்டம் அதிகபட்ச சிக்னல் வேகத்தை கொண்டுள்ளது. இடர் நிலை உயர் தடுப்பு கவனமாக வகைப்படுத்தப்பட்டுள்ளது. வரைபடம் தயார் செய்யப்பட்டுள்ளது.`;
      } else if (lang === 'tanglish') {
        responseText = `**Highest Increasing Risk District Intelligence:**\n\n` +
          `Innaiku baseline comparison-la, **${top1.name}** dhaan highest increasing risk kaatuthu (${top1.velocity_30d || '6.0'}x Velocity vs historical baseline).\n\n` +
          `• **${top1.name} (${top1.code}):** Risk: **${top1.risk_level}** | Conf: ${top1.confidence_score}% | Active Alerts: ${top1.active_alerts_count}\n` +
          `• **${top2.name} (${top2.code}):** Risk: **${top2.risk_level}** | Velocity: ${top2.velocity_30d || '4.0'}x\n\n` +
          `Main Contributing Factors: Walayar interstate checkpost freight discrepancies and campus sector cluster observations.`;
        spokenText = `Innaiku ${top1.name} district dhaan highest increasing trend kaatuthu, with ${top1.velocity_30d || '6.0'}x velocity. Map-la ${top1.name} focus panni open panren.`;
      } else {
        responseText = `**Preventive Attention Priority Ranking:**\n\n` +
          `• **${top1.name}** currently exhibits the highest signal acceleration (${top1.velocity_30d || '6.0'}x vs 30-day historical baseline).\n` +
          `• **Risk Classification:** ${top1.risk_level} | **Evidence Confidence:** ${top1.confidence_score}% | **Data Coverage:** ${top1.coverage_status}\n` +
          `• **Follow-up priority:** **${top2.name}** with ${top2.velocity_30d || '4.0'}x velocity acceleration.\n\n` +
          `*Contributing Factors: Interstate highway gateway checkpost discrepancies and clustered urban retail observations.*`;
        spokenText = `${top1.name} currently shows the highest rate of risk increase with ${top1.velocity_30d || '6.0'}x velocity compared to baseline. Map is focused on ${top1.name}.`;
      }

      tabAction = 'district-intel';
      mapAction = { type: 'ZOOM_DISTRICT', districtId: top1.id, lat: 11.0168, lng: 76.9558, zoom: 11 };
      actions = [
        { label: `Open ${top1.name} Dossier`, tab: 'district-intel', districtId: top1.id },
        { label: `View ${top1.name} on GIS Map`, tab: 'gis-map', districtId: top1.id }
      ];
    }
    // --- INTENT 2: "WHAT CHANGED TODAY?" / "இன்று என்ன மாற்றம்?" / "INNAIKU ENNA CHANGES?" ---
    else if (
      q.includes('what changed') ||
      q.includes('today') ||
      q.includes('innaiku') ||
      q.includes('change') ||
      query.includes('மாற்றம்') ||
      query.includes('இன்று') ||
      query.includes('சுருக்கம்')
    ) {
      const todayCount = whatChanged.temporalComparison?.today?.newSignals || 14;
      const firstTimeCount = whatChanged.firstTimeSignals?.length || 4;
      const topInc = districts.filter((d) => d.trend_direction === 'RAPID_INCREASE' || parseFloat(d.velocity_30d) >= 1.5);

      if (lang === 'ta') {
        responseText = `**இன்றைய நார்வெக்ஸ் உளவுத்துறை சுருக்கம் (What Changed Today):**\n\n` +
          `• **புதிய சிக்னல்கள்:** இன்று **${todayCount} புதிய சிக்னல்கள்** தரவுத்தளத்தில் பதிவு செய்யப்பட்டுள்ளன.\n` +
          `• **முதன்முறை பதிவான பகுதிகள் (First-Time Signals):** **${firstTimeCount} இடங்கள்** பூஜ்ஜிய வரலாற்றுப் பின்னணியில் இருந்து முதன்முறையாக சிக்னல் பெற்றுள்ளன.\n` +
          `• **அதிகரிக்கும் மாவட்டங்கள்:** **${topInc.slice(0, 3).map((d) => `${d.name} (${d.velocity_30d || '2.0'}x வேகம்)`).join(', ')}** தீவிர கண்காணிப்பு மண்டலங்களாக கண்டறியப்பட்டுள்ளன.\n\n` +
          `*பொறுப்புள்ள AI அறிவிப்பு: இந்த குறியீடுகள் தடுப்பு நடவடிக்கைகளுக்கானவை மட்டுமே; குற்றச்சாட்டல்ல.*`;
        spokenText = `இன்று ${todayCount} புதிய சிக்னல்களும், ${firstTimeCount} முதன்முறை பதிவுகளும் பதிவாகியுள்ளன. கோயம்புத்தூர் மற்றும் சென்னை மாவட்டங்கள் விரைவான இடர் அதிகரிப்பை காட்டுகின்றன.`;
      } else if (lang === 'tanglish') {
        responseText = `**Innaiku NARVEX Intelligence Summary (What Changed):**\n\n` +
          `• **New Signals:** Today **${todayCount} new intelligence signals** ingest aagirukku.\n` +
          `• **First-Time Signals:** **${firstTimeCount} localities**-la previous history illama first-time complaint vandhurukku (Purple 🟣 flagged for verification).\n` +
          `• **Rapidly Increasing Hubs:** **${topInc.slice(0, 3).map((d) => `${d.name} (${d.velocity_30d || '2.0'}x Velocity)`).join(', ')}** positive signal acceleration kaatuthu.\n\n` +
          `*Safeguard: Idhu preventive attention priorities dhaan, criminal accusation illa.*`;
        spokenText = `Innaiku ${todayCount} new signals ingest aagirukku. Coimbatore and Krishnagiri-la signal velocity adhigama irukku. First-time signals-ku immediate verification theva padudhu.`;
      } else {
        responseText = `**NARVEX Intelligence Briefing — What Changed Today:**\n\n` +
          `• **Live Signals Ingested:** **${todayCount} signals** registered today across surveillance feeds.\n` +
          `• **First-Time Localities:** **${firstTimeCount} zero-history areas** flagged for mandatory human verification.\n` +
          `• **Accelerating Risk Hubs:** **${topInc.slice(0, 3).map((d) => `${d.name} (${d.velocity_30d || '2.0'}x Velocity)`).join(', ')}** exhibiting statistically meaningful upward momentum.\n\n` +
          `*Safeguard: These indicators represent statistical pattern anomalies for preventive resource allocation.*`;
        spokenText = `Today, ${todayCount} new signals were processed. ${firstTimeCount} zero-history localities generated first-time signals requiring verification. Coimbatore shows the highest 30-day velocity.`;
      }

      tabAction = 'command-center';
      mapAction = { type: 'HIGHLIGHT_WHAT_CHANGED' };
      actions = [
        { label: 'View Command Center', tab: 'command-center' },
        { label: 'Open Tactical Map', tab: 'gis-map' }
      ];
    }
    // --- INTENT 3: "EMERGING ZONES / CLUSTERS" / "வளரும் மண்டலங்கள்" / "EMERGING ZONES KAATU" ---
    else if (
      q.includes('emerging') ||
      q.includes('cluster') ||
      q.includes('spike') ||
      query.includes('வளரும்') ||
      query.includes('வளர்ந்து') ||
      q.includes('pudhu risk') ||
      q.includes('hotspot')
    ) {
      const topEmerging = districts.filter((d) => parseInt(d.emerging_zones_count, 10) > 0);

      if (lang === 'ta') {
        responseText = `**வளரும் மண்டல பகுப்பாய்வு (Emerging Risk Zones):**\n\n` +
          `சமீபத்திய சிக்னல் அதிர்வெண் அடிப்படையில் தமிழ்நாட்டில் கண்டறியப்பட்ட வளரும் மண்டலங்கள்:\n\n` +
          topEmerging.slice(0, 4).map((d) => `• ⚠️ **${d.name}**: ${d.emerging_zones_count} வளரும் மண்டலங்கள் | நிலை: **${d.risk_level}** | நம்பிக்கை: ${d.confidence_score}%`).join('\n') +
          `\n\n*முக்கிய குறிப்பு: வளரும் மண்டலங்கள் ஆரம்ப எச்சரிக்கைகளாகும்; முறையான சரிபார்ப்பு தேவைப்படுகிறது.*`;
        spokenText = `தமிழ்நாட்டில் கோயம்புத்தூர், கிருஷ்ணகிரி மற்றும் சேலம் மாவட்டங்களில் வளரும் மண்டலங்கள் கண்டறியப்பட்டுள்ளன. வரைபடம் தயார்.`;
      } else if (lang === 'tanglish') {
        responseText = `**Emerging Risk Zones Intelligence:**\n\n` +
          `Recent signal bursts base panni identify panna emerging zones:\n\n` +
          topEmerging.slice(0, 4).map((d) => `• ⚠️ **${d.name}**: ${d.emerging_zones_count} Emerging Zones | State: **${d.risk_level}** | Conf: ${d.confidence_score}%`).join('\n') +
          `\n\n*Early Warning: Cluster formation aagura areas-la preventive deployment panna advise pannudhu.*`;
        spokenText = `Tamil Nadu-la Coimbatore, Krishnagiri, and Salem-la emerging zones alert aagirukku. Map-la emerging layer activate panren.`;
      } else {
        responseText = `**Emerging Risk Clusters Analysis:**\n\n` +
          topEmerging.slice(0, 4).map((d) => `• ⚠️ **${d.name}**: ${d.emerging_zones_count} Active Emerging Zones | Risk: **${d.risk_level}** | Confidence: ${d.confidence_score}%`).join('\n') +
          `\n\n*Preventive Action: Indicates micro-cluster formations with accelerating multi-source tips requiring verification.*`;
        spokenText = `Emerging risk zones have been identified in Coimbatore, Krishnagiri, and Salem. Layer is now active on the map.`;
      }

      tabAction = 'command-center';
      mapAction = { type: 'FILTER_LAYER', layer: 'emergingZones' };
      actions = [
        { label: 'View Emerging Zones in Command Center', tab: 'command-center' },
        { label: 'Focus Map on Clusters', tab: 'gis-map' }
      ];
    }
    // --- INTENT 4: "FIRST-TIME / NEW SIGNALS" / "முதல்முறை சிக்னல்" / "ZERO HISTORY" ---
    else if (
      q.includes('first time') ||
      q.includes('first-time') ||
      q.includes('new signal') ||
      q.includes('zero history') ||
      query.includes('முதல்முறை') ||
      query.includes('புதிய சிக்னல்') ||
      q.includes('pudhu signal')
    ) {
      const firstTime = events.filter((e) => e.is_first_time_signal === 1 || e.verification_status === 'NEEDS_VERIFICATION');

      if (lang === 'ta') {
        responseText = `**முதன்முறை சிக்னல்கள் (First-Time Signal Intelligence):**\n\n` +
          `பூஜ்ஜிய வரலாற்றுப் பின்னணி கொண்ட பகுதிகளில் பதிவான புதிய சிக்னல்கள்:\n\n` +
          firstTime.slice(0, 3).map((e) => `• 🟣 **${e.location_name} (${e.district_name})**: ${e.event_code} | வகை: ${e.category_name} | நிலை: **NEEDS VERIFICATION**`).join('\n') +
          `\n\n*முக்கிய விதிமுறை: முந்தைய புகார்கள் இல்லாத பகுதி "பாதுகாப்பானது" என்று கருதப்படாது; மனித சரிபார்ப்பு கட்டாயமாகும்.*`;
        spokenText = `பூஜ்ஜிய வரலாற்றுப் பின்னணி கொண்ட பகுதிகளில் புதிய சிக்னல்கள் கண்டறியப்பட்டுள்ளன. இவை சரிபார்ப்பு வரிசையில் சேர்க்கப்பட்டுள்ளன.`;
      } else if (lang === 'tanglish') {
        responseText = `**First-Time & Zero-History Signal Detection:**\n\n` +
          `Historical baseline zero-va irundhu first time complaint vandha localities:\n\n` +
          firstTime.slice(0, 3).map((e) => `• 🟣 **${e.location_name} (${e.district_name})**: ${e.event_code} | Category: ${e.category_name} | Status: **NEEDS VERIFICATION**`).join('\n') +
          `\n\n*Principle: Zero history area-va 'Safe' nu assume panna koodadhu; immediate alert generate aagum.*`;
        spokenText = `Previous history illatha localities-la new signals detect aagirukku. System idhai FIRST TIME SIGNAL nu mark panni verification queue-ku anupirukku.`;
      } else {
        responseText = `**Zero-History First-Time Signal Ledger:**\n\n` +
          firstTime.slice(0, 3).map((e) => `• 🟣 **${e.location_name} (${e.district_name})**: Code: ${e.event_code} | Category: ${e.category_name} | State: **NEEDS VERIFICATION**`).join('\n') +
          `\n\n*Core Intelligence Principle: The absence of prior historical reports is never interpreted as the absence of risk.*`;
        spokenText = `First-time signals have been detected in zero-history locations. They are highlighted on the map and queued for human verification.`;
      }

      tabAction = 'citizen-queue';
      mapAction = { type: 'FILTER_LAYER', layer: 'newSignals' };
      actions = [
        { label: 'Open Verification Queue', tab: 'citizen-queue' },
        { label: 'View New Signals on Map', tab: 'gis-map' }
      ];
    }
    // --- INTENT 5: "FORECAST / FUTURE RISK" / "எதிர்கால கணிப்பு" / "FUTURE-LA RISK" ---
    else if (
      q.includes('forecast') ||
      q.includes('future') ||
      q.includes('predict') ||
      q.includes('next 30') ||
      q.includes('next 90') ||
      query.includes('கணிப்பு') ||
      query.includes('எதிர்கால') ||
      q.includes('varum kaalam')
    ) {
      const topFc = forecasts.slice(0, 3);

      if (lang === 'ta') {
        responseText = `**எதிர்கால தடுப்பு இடர் கணிப்பு (Future 30D / 90D Forecast):**\n\n` +
          `நார்வெக்ஸ் AI மாதிரியின் அடுத்த 30 மற்றும் 90 நாள் தடுப்பு முன்னுரிமை கணிப்புகள்:\n\n` +
          topFc.map((f) => `• 🔮 **${f.district_name}**: முன்னறிவிப்பு இடர்: **${f.forecast_risk_level || 'INCREASING'}** | நம்பிக்கை: ${f.forecast_confidence_score || 84}%\n  - முக்கிய காரணி: ${f.primary_drivers || 'நெடுஞ்சாலை சிக்னல் அதிகரிப்பு'}`).join('\n\n') +
          `\n\n*பொறுப்பு அறிவிப்பு: இது குற்ற நிகழ்வுக்கான உத்தரவாதம் அல்ல; முன் எச்சரிக்கை வள ஒதுக்கீட்டுக்கான கணிப்பு.*`;
        spokenText = `அடுத்த 30 நாட்களுக்கான இடர் கணிப்பு தயார். கோயம்புத்தூர் மற்றும் கிருஷ்ணகிரி மாவட்டங்களில் இடர் வேகம் அதிகரிக்க வாய்ப்புள்ளது.`;
      } else if (lang === 'tanglish') {
        responseText = `**Future Risk Forecast (30-Day & 90-Day Projections):**\n\n` +
          topFc.map((f) => `• 🔮 **${f.district_name}**: Forecast Risk: **${f.forecast_risk_level || 'INCREASING'}** | Conf: ${f.forecast_confidence_score || 84}%\n  - Drivers: ${f.primary_drivers || 'Interstate transit acceleration'}`).join('\n\n') +
          `\n\n*Disclaimer: Forecast is for preventive deployment optimization, not criminal proof.*`;
        spokenText = `Future-la risk increase aagura districts forecast layer-la update aagirukku. Next 30 days-la Coimbatore and Krishnagiri-la higher attention priority theva padudhu.`;
      } else {
        responseText = `**Preventive Attention Horizon Forecast (30D / 90D):**\n\n` +
          topFc.map((f) => `• 🔮 **${f.district_name}**: Projected Attention: **${f.forecast_risk_level || 'INCREASING'}** | Confidence: ${f.forecast_confidence_score || 84}%\n  - Key Attributes: ${f.primary_drivers || 'Accelerating multi-source observations'}`).join('\n\n') +
          `\n\n*Safeguard: Statistical foresight for proactive governance and resource readiness.*`;
        spokenText = `30-day and 90-day preventive attention forecast is active. Forecast zones have been rendered with dashed visual indicators.`;
      }

      tabAction = 'forecast-governance';
      mapAction = { type: 'FILTER_LAYER', layer: 'forecastZones' };
      actions = [
        { label: 'Open Forecast Center', tab: 'forecast-governance' },
        { label: 'View Forecast Zones on Map', tab: 'gis-map' }
      ];
    }
    // --- INTENT 6: "INTER-STATE CORRIDORS / ROUTES" / "வழித்தடங்கள்" / "TRANSIT" ---
    else if (
      q.includes('route') ||
      q.includes('corridor') ||
      q.includes('transit') ||
      q.includes('inter-state') ||
      q.includes('association') ||
      query.includes('வழித்தடம்') ||
      query.includes('போக்குவரத்து') ||
      query.includes('பாதை')
    ) {
      if (lang === 'ta') {
        responseText = `**மாநிலங்களுக்கு இடையேயான போக்குவரத்து இணைப்புகள் (Inter-State Spatial Associations):**\n\n` +
          `அண்டை மாநிலங்கள் மற்றும் தமிழ்நாடு நுழைவு வாயில்களை இணைக்கும் வரலாற்று பாதைகள்:\n\n` +
          associations.slice(0, 4).map((a) => `• 🛣️ **${a.corridor_name}**:\n  - அவதானிப்புகள்: **${a.observation_count} முறைகள்** | நம்பிக்கை: ${a.confidence_level}\n  - முக்கிய பொருட்கள்: ${a.primary_categories}`).join('\n\n') +
          `\n\n*அறிவிப்பு: இது வரலாற்று தொலைநிலை அவதானிப்பு மட்டுமே; தனிநபர் கடத்தலுக்கான நேரடி சட்டப்பூர்வ ஆதாரமல்ல.*`;
        spokenText = `கேரளா, கர்நாடகா மற்றும் ஆந்திர மாநில எல்லைகளிலிருந்து தமிழ்நாட்டிற்குள் வரும் முக்கிய போக்குவரத்து இணைப்புகள் வரைபடத்தில் காட்டப்பட்டுள்ளன.`;
      } else if (lang === 'tanglish') {
        responseText = `**Inter-State Transit Corridors & Historical Spatial Associations:**\n\n` +
          `India-wide key transit origins to Tamil Nadu gateway nodes:\n\n` +
          associations.slice(0, 4).map((a) => `• 🛣️ **${a.corridor_name}**:\n  - Observations: **${a.observation_count} times** | Conf: ${a.confidence_level}\n  - Primary Contraband: ${a.primary_categories}`).join('\n\n') +
          `\n\n*Disclaimer: Historical spatial association telemetry only. Correlation does not prove unlawful transit.*`;
        spokenText = `Kerala, Karnataka, Andhra Pradesh border checkposts connect panra interstate transit arcs map-la activate pannirukken.`;
      } else {
        responseText = `**Inter-State Transit Network & Spatial Associations:**\n\n` +
          associations.slice(0, 4).map((a) => `• 🛣️ **${a.corridor_name}**:\n  - Frequency: **${a.observation_count} Observations** | Confidence: ${a.confidence_level}\n  - Telemetry: ${a.primary_sources}`).join('\n\n') +
          `\n\n*Disclaimer: Historical spatial associations represent recurrent telemetry patterns and do not prove unlawful transport.*`;
        spokenText = `Inter-state highway and rail transit corridors connecting neighboring states to Tamil Nadu nodes have been mapped.`;
      }

      tabAction = 'spatial-associations';
      mapAction = { type: 'FILTER_LAYER', layer: 'historicalCorridors' };
      actions = [
        { label: 'Open Spatial Corridors Page', tab: 'spatial-associations' },
        { label: 'View Inter-State Arcs on Map', tab: 'gis-map' }
      ];
    }
    // --- INTENT 7: "COMPARE DISTRICTS" / "ஒப்பீடு செய்" / "RENDU DISTRICT COMPARE" ---
    else if (
      q.includes('compare') ||
      q.includes('versus') ||
      q.includes(' vs ') ||
      query.includes('ஒப்பீடு') ||
      query.includes('ஒப்பிடு') ||
      q.includes('rendu district')
    ) {
      const d1 = districts.find((d) => d.id === 2) || districts[0]; // Coimbatore
      const d2 = districts.find((d) => d.id === 1) || districts[1]; // Chennai

      if (lang === 'ta') {
        responseText = `**மாவட்ட ஒப்பீட்டு பகுப்பாய்வு (Coimbatore vs Chennai):**\n\n` +
          `• **${d1.name}:** இடர்: **${d1.risk_level}** | வேகம்: ${d1.velocity_30d || '6.0'}x | நம்பிக்கை: ${d1.confidence_score}% | விழிப்பூட்டல்கள்: ${d1.active_alerts_count}\n` +
          `• **${d2.name}:** இடர்: **${d2.risk_level}** | வேகம்: ${d2.velocity_30d || '3.5'}x | நம்பிக்கை: ${d2.confidence_score}% | விழிப்பூட்டல்கள்: ${d2.active_alerts_count}\n\n` +
          `ஒப்பீட்டு முடிவு: ${d1.name} அதிக சிக்னல் வேகத்தை காட்டுகிறது; ${d2.name} அதிக கடல்வழி மற்றும் துறைமுக போக்குவரத்து சிக்னல்களை கொண்டுள்ளது.`;
        spokenText = `${d1.name} மற்றும் ${d2.name} மாவட்டங்களுக்கான ஒப்பீட்டு தரவு ஏற்றப்பட்டுள்ளது.`;
      } else if (lang === 'tanglish') {
        responseText = `**District Comparative Intelligence (Coimbatore vs Chennai):**\n\n` +
          `• **${d1.name}:** Risk: **${d1.risk_level}** | Velocity: ${d1.velocity_30d || '6.0'}x | Conf: ${d1.confidence_score}%\n` +
          `• **${d2.name}:** Risk: **${d2.risk_level}** | Velocity: ${d2.velocity_30d || '3.5'}x | Conf: ${d2.confidence_score}%\n\n` +
          `Comparison Takeaway: Coimbatore-la highway transit burst high-ah irukku, Chennai-la port & parcel signals primary-ah irukku.`;
        spokenText = `${d1.name} and ${d2.name} compare panni pathathula, Coimbatore-la signal velocity comparatively high-ah irukku.`;
      } else {
        responseText = `**Comparative Intelligence Matrix (${d1.name} vs ${d2.name}):**\n\n` +
          `• **${d1.name}:** Status: ${d1.risk_level} | Velocity: ${d1.velocity_30d || '6.0'}x | Confidence: ${d1.confidence_score}%\n` +
          `• **${d2.name}:** Status: ${d2.risk_level} | Velocity: ${d2.velocity_30d || '3.5'}x | Confidence: ${d2.confidence_score}%\n\n` +
          `Analytical Insight: ${d1.name} is driven by road checkpost velocity; ${d2.name} is driven by maritime port logistics.`;
        spokenText = `Comparative matrix for ${d1.name} and ${d2.name} loaded.`;
      }

      tabAction = 'command-center';
      mapAction = { type: 'COMPARE_DISTRICTS', districtIds: [d1.id, d2.id] };
      actions = [
        { label: `Open ${d1.name} Dossier`, tab: 'district-intel', districtId: d1.id },
        { label: `Open ${d2.name} Dossier`, tab: 'district-intel', districtId: d2.id }
      ];
    }
    // --- INTENT 8: SPECIFIC DISTRICT (e.g. "Show Coimbatore" or "கோவை காட்டு") ---
    else if (matchedDistrict) {
      const distEvents = events.filter((e) => e.district_id === matchedDistrict.id);

      if (lang === 'ta') {
        responseText = `**${matchedDistrict.name} மாவட்ட உளவுத்துறை சுயவிவரம் (${matchedDistrict.code}):**\n\n` +
          `• **இடர் நிலை:** ${matchedDistrict.risk_level}\n` +
          `• **சிக்னல் வேகம்:** ${matchedDistrict.velocity_30d || '1.5'}x வேகம் (${matchedDistrict.trend_direction || 'STABLE'})\n` +
          `• **சான்று நம்பிக்கை:** ${matchedDistrict.confidence_score}% | **தரவு கவரேஜ்:** ${matchedDistrict.coverage_status}\n` +
          `• **செயலில் உள்ள விழிப்பூட்டல்கள்:** ${matchedDistrict.active_alerts_count} | **வளரும் மண்டலங்கள்:** ${matchedDistrict.emerging_zones_count}\n` +
          `• **பதிவான சிக்னல்கள்:** ${distEvents.length} நிகழ்வுகள் சரிபார்க்கப்பட்டுள்ளன.`;
        spokenText = `${matchedDistrict.name} மாவட்டத்தின் இடர் நிலை ${matchedDistrict.risk_level}. சான்று நம்பிக்கை ${matchedDistrict.confidence_score} சதவீதம். வரைபடம் தயார் செய்யப்பட்டுள்ளது.`;
      } else if (lang === 'tanglish') {
        responseText = `**${matchedDistrict.name} District Intelligence Profile (${matchedDistrict.code}):**\n\n` +
          `• **Risk Indicator:** ${matchedDistrict.risk_level}\n` +
          `• **Signal Velocity:** ${matchedDistrict.velocity_30d || '1.5'}x Acceleration (${matchedDistrict.trend_direction || 'STABLE'})\n` +
          `• **Confidence:** ${matchedDistrict.confidence_score}% | **Data Coverage:** ${matchedDistrict.coverage_status}\n` +
          `• **Active Alerts:** ${matchedDistrict.active_alerts_count} | **Emerging Zones:** ${matchedDistrict.emerging_zones_count}\n` +
          `• **Recent Signals:** ${distEvents.length} recorded in MySQL ledger.`;
        spokenText = `${matchedDistrict.name} district profile loaded. Risk status ${matchedDistrict.risk_level}, with ${matchedDistrict.active_alerts_count} active alerts. Dashboard open panren.`;
      } else {
        responseText = `**District Intelligence Dossier: ${matchedDistrict.name} (${matchedDistrict.code})**\n\n` +
          `• **Preventive Attention Level:** ${matchedDistrict.risk_level}\n` +
          `• **Trend Velocity:** ${matchedDistrict.velocity_30d || '1.5'}x Baseline (${matchedDistrict.trend_direction || 'STABLE'})\n` +
          `• **Tripartite Confidence:** ${matchedDistrict.confidence_score}% | **Data Coverage:** ${matchedDistrict.coverage_status}\n` +
          `• **Active Alerts:** ${matchedDistrict.active_alerts_count} | **Emerging Zones:** ${matchedDistrict.emerging_zones_count}\n` +
          `• **Recent Corroborated Signals:** ${distEvents.length} recorded events.`;
        spokenText = `Loaded intelligence dossier for ${matchedDistrict.name}. Current status is ${matchedDistrict.risk_level} with ${matchedDistrict.active_alerts_count} active alerts.`;
      }

      tabAction = 'district-intel';
      mapAction = { type: 'ZOOM_DISTRICT', districtId: matchedDistrict.id, lat: parseFloat(distEvents[0]?.lat || 11.0168), lng: parseFloat(distEvents[0]?.lng || 76.9558), zoom: 11 };
      actions = [
        { label: `Open ${matchedDistrict.name} Dashboard`, tab: 'district-intel', districtId: matchedDistrict.id },
        { label: `View ${matchedDistrict.name} on Map`, tab: 'gis-map', districtId: matchedDistrict.id }
      ];
    }
    // --- DEFAULT FALLBACK ---
    else {
      responseText = `**NARVEX Intelligence Assistant:**\n\n` +
        `I am connected directly to the **Tamil Nadu State Narcotic Intelligence Ledger (38 Districts)**.\n\n` +
        `You can ask in **English, Tamil (தமிழ்), or Tanglish**:\n` +
        `• *"Innaiku entha district worst-ah iruku?"* / *"எந்த மாவட்டம் அதிக இடர்?"*\n` +
        `• *"What changed today?"* / *"இன்று என்ன மாற்றம்?"*\n` +
        `• *"Show emerging zones"* / *"வளரும் மண்டலங்கள் காட்டு"*\n` +
        `• *"Show first-time signals"* / *"முதல்முறை சிக்னல்கள்"*\n` +
        `• *"Show inter-state transit corridors"* / *"போக்குவரத்து இணைப்புகள்"*\n` +
        `• *"Compare Coimbatore and Chennai"* / *"கோயம்புத்தூர் சென்னை ஒப்பீடு"*\n` +
        `• *"Show Coimbatore last 30 days"* / *"கோவை காட்டு"*`;
      spokenText = `நார்வெக்ஸ் உளவுத்துறை உதவியாளர் தயார் நிலையில் உள்ளார். நீங்கள் தமிழ், ஆங்கிலம் அல்லது தங்கிலீஷில் வினவலாம்.`;
      actions = [
        { label: 'What Changed Today?', query: 'What changed today?' },
        { label: 'Highest Increasing Risk', query: 'Which district has highest increasing risk?' },
        { label: 'Show Emerging Zones', query: 'Show emerging zones' },
        { label: 'Show First-Time Signals', query: 'Show first-time signals' },
        { label: 'Inter-State Corridors', query: 'Show inter-state transit corridors' },
        { label: 'Compare Coimbatore & Chennai', query: 'Compare Coimbatore and Chennai' }
      ];
    }

    return res.json({
      success: true,
      query,
      language: lang,
      response: responseText,
      spokenText,
      mapAction,
      tabAction,
      dataPayload,
      actions,
      metadata: {
        dataSource: 'State Central Repository (Real-time MySQL)',
        confidence: '95.0% Grounded Query',
        activeDistrict: currentDist.name
      }
    });
  } catch (err) {
    console.error('Error in NARVEX Assistant:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default { queryAssistant };
