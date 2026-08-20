import pool from '../database/db.js';

/**
 * Geographic Resolution & Normalization Service for Tamil Nadu
 * Maps raw textual location mentions, taluks, stations, or coordinates to official 38 TN districts.
 * Strictly adheres to truth-in-data: If location cannot be verified, flags as UNRESOLVED rather than guessing.
 */

// Well-known locality-to-district mappings across Tamil Nadu
const KNOWN_LOCALITY_MAP = {
  // Chennai & Suburbs
  'gandhi nagar': 'Chennai',
  'anna nagar': 'Chennai',
  't nagar': 'Chennai',
  't. nagar': 'Chennai',
  'thyagaraya nagar': 'Chennai',
  'egmore': 'Chennai',
  'chennai central': 'Chennai',
  'guindy': 'Chennai',
  'tambaram': 'Chengalpattu',
  'chromepet': 'Chengalpattu',
  'velachery': 'Chennai',
  'adyar': 'Chennai',
  'mylapore': 'Chennai',
  'royapettah': 'Chennai',
  'broadway': 'Chennai',
  'parrys': 'Chennai',
  'perambur': 'Chennai',
  'madhavaram': 'Chennai',
  'koyambedu': 'Chennai',
  'avadi': 'Tiruvallur',
  'ambattur': 'Chennai',
  'porur': 'Chennai',
  'sholinganallur': 'Chennai',
  'omr': 'Chengalpattu',
  'ecr': 'Chengalpattu',
  'kelambakkam': 'Chengalpattu',
  'mahabalipuram': 'Chengalpattu',
  'mamallapuram': 'Chengalpattu',
  'kanchipuram': 'Kanchipuram',
  'sriperumbudur': 'Kanchipuram',
  'oragadam': 'Kanchipuram',
  'gummidipoondi': 'Tiruvallur',
  'tiruttani': 'Tiruvallur',
  'ponneri': 'Tiruvallur',

  // Coimbatore & Kongu Region
  'gandhipuram': 'Coimbatore',
  'rs puram': 'Coimbatore',
  'r.s. puram': 'Coimbatore',
  'singanallur': 'Coimbatore',
  'peelamedu': 'Coimbatore',
  'saravanampatti': 'Coimbatore',
  'ukkkadam': 'Coimbatore',
  'ukkadam': 'Coimbatore',
  'saibaba colony': 'Coimbatore',
  'thudiyalur': 'Coimbatore',
  'pollachi': 'Coimbatore',
  'mettupalayam': 'Coimbatore',
  'sulur': 'Coimbatore',
  'walayar': 'Coimbatore',
  'walayar checkpost': 'Coimbatore',
  'kg chavadi': 'Coimbatore',
  'madukkarai': 'Coimbatore',
  'kinathukadavu': 'Coimbatore',
  'valparai': 'Coimbatore',
  'annur': 'Coimbatore',
  'karumathampatti': 'Coimbatore',
  'cbe': 'Coimbatore',

  // Tiruppur
  'tirupur': 'Tiruppur',
  'tiruppur': 'Tiruppur',
  'avanshi': 'Tiruppur',
  'avinashi': 'Tiruppur',
  'palladam': 'Tiruppur',
  'dharapuram': 'Tiruppur',
  'kangeyam': 'Tiruppur',
  'udumalpet': 'Tiruppur',
  'udumalaipettai': 'Tiruppur',

  // Erode
  'erode': 'Erode',
  'perundurai': 'Erode',
  'gobichettipalayam': 'Erode',
  'bhavani': 'Erode',
  'sathyamangalam': 'Erode',
  'anthiyur': 'Erode',
  'bannari': 'Erode',
  'kodiveri': 'Erode',

  // Salem
  'salem': 'Salem',
  'salem junction': 'Salem',
  'attur': 'Salem',
  'mettur': 'Salem',
  'omlur': 'Salem',
  'edappadi': 'Salem',
  'sankagiri': 'Salem',
  'yercaud': 'Salem',
  'valapady': 'Salem',
  'shevapet': 'Salem',
  'suramangalam': 'Salem',

  // Krishnagiri & Dharmapuri
  'krishnagiri': 'Krishnagiri',
  'hosur': 'Krishnagiri',
  'zuzuvadi': 'Krishnagiri',
  'attibele border': 'Krishnagiri',
  'pochampalli': 'Krishnagiri',
  'denkanikottai': 'Krishnagiri',
  'bargur': 'Krishnagiri',
  'dharmapuri': 'Dharmapuri',
  'harur': 'Dharmapuri',
  'palacode': 'Dharmapuri',
  'pennagaram': 'Dharmapuri',
  'hogenakkal': 'Dharmapuri',

  // Madurai & South
  'madurai': 'Madurai',
  'mattuthavani': 'Madurai',
  'periyar bus stand': 'Madurai',
  'goripalayam': 'Madurai',
  'simmakkal': 'Madurai',
  'tiruparankundram': 'Madurai',
  'melur': 'Madurai',
  'usilampatti': 'Madurai',
  'vadipatti': 'Madurai',
  'thirumangalam': 'Madurai',
  'sholavandan': 'Madurai',

  // Dindigul & Theni
  'dindigul': 'Dindigul',
  'palani': 'Dindigul',
  'kodaikanal': 'Dindigul',
  'oddanchatram': 'Dindigul',
  'nilakottai': 'Dindigul',
  'natham': 'Dindigul',
  'theni': 'Theni',
  'periyakulam': 'Theni',
  'bodinayakanur': 'Theni',
  'bodi': 'Theni',
  'cumbum': 'Theni',
  'kumily border': 'Theni',
  'chinnalapatti': 'Dindigul',

  // Tiruchirappalli & Central
  'trichy': 'Tiruchirappalli',
  'tiruchirappalli': 'Tiruchirappalli',
  'srirangam': 'Tiruchirappalli',
  'thillai nagar': 'Tiruchirappalli',
  'golden rock': 'Tiruchirappalli',
  'manapparai': 'Tiruchirappalli',
  'thuraiyur': 'Tiruchirappalli',
  'musiri': 'Tiruchirappalli',
  'lalgudi': 'Tiruchirappalli',
  'thanjavur': 'Thanjavur',
  'tanjore': 'Thanjavur',
  'kumbakonam': 'Thanjavur',
  'papanasam': 'Thanjavur',
  'pattukkottai': 'Thanjavur',
  'perambalur': 'Perambalur',
  'ariyalur': 'Ariyalur',
  'karur': 'Karur',
  'kulithalai': 'Karur',
  'pudukkottai': 'Pudukkottai',
  'aranthangi': 'Pudukkottai',

  // Tirunelveli, Tenkasi, Thoothukudi & Kanyakumari
  'tirunelveli': 'Tirunelveli',
  'palayamkottai': 'Tirunelveli',
  'nellai': 'Tirunelveli',
  'ambasamudram': 'Tirunelveli',
  'nanguneri': 'Tirunelveli',
  'valliyur': 'Tirunelveli',
  'tenkasi': 'Tenkasi',
  'courtallam': 'Tenkasi',
  'sengottai': 'Tenkasi',
  'aryankavu border': 'Tenkasi',
  'sankarankovil': 'Tenkasi',
  'puliyangudi': 'Tenkasi',
  'kadayanallur': 'Tenkasi',
  'thoothukudi': 'Thoothukudi',
  'tuticorin': 'Thoothukudi',
  'kovilpatti': 'Thoothukudi',
  'tiruchendur': 'Thoothukudi',
  'kayalpattinam': 'Thoothukudi',
  'kanyakumari': 'Kanyakumari',
  'nagercoil': 'Kanyakumari',
  'marthandam': 'Kanyakumari',
  'thuckalay': 'Kanyakumari',
  'kallakkurichi': 'Kallakurichi',
  'kallakurichi': 'Kallakurichi',
  'ulundurpet': 'Kallakurichi',
  'sankarapuram': 'Kallakurichi',

  // Vellore, Ranipet, Tirupathur, Tiruvannamalai
  'vellore': 'Vellore',
  'katpadi': 'Vellore',
  'gudiyatham': 'Vellore',
  'anaicut': 'Vellore',
  'ranipet': 'Ranipet',
  'arani': 'Tiruvannamalai',
  'aracona': 'Ranipet',
  'arakkonam': 'Ranipet',
  'arcot': 'Ranipet',
  'walajapet': 'Ranipet',
  'tirupathur': 'Tirupathur',
  'tirupattur': 'Tirupathur',
  'ambur': 'Tirupathur',
  'vaniyambadi': 'Tirupathur',
  'yelagiri': 'Tirupathur',
  'tiruvannamalai': 'Tiruvannamalai',
  'chengam': 'Tiruvannamalai',
  'polur': 'Tiruvannamalai',
  'vandavasi': 'Tiruvannamalai',

  // Villupuram & Cuddalore
  'villupuram': 'Viluppuram',
  'viluppuram': 'Viluppuram',
  'tindivanam': 'Viluppuram',
  'gingee': 'Viluppuram',
  'cuddalore': 'Cuddalore',
  'panruti': 'Cuddalore',
  'chidambaram': 'Cuddalore',
  'neyveli': 'Cuddalore',
  'virudhachalam': 'Cuddalore',
  'kattumannarkoil': 'Cuddalore',

  // Delta & Coastal
  'nagapattinam': 'Nagapattinam',
  'velankanni': 'Nagapattinam',
  'vedaranyam': 'Nagapattinam',
  'mayiladuthurai': 'Mayiladuthurai',
  'sirkazhi': 'Mayiladuthurai',
  'tharangambadi': 'Mayiladuthurai',
  'tiruvarur': 'Tiruvarur',
  'mannargudi': 'Tiruvarur',
  'thiruthuraipoondi': 'Tiruvarur',

  // Nilgiris
  'ooty': 'Nilgiris',
  'udhagamandalam': 'Nilgiris',
  'coonoor': 'Nilgiris',
  'kotagiri': 'Nilgiris',
  'gudalur': 'Nilgiris',
  'nilgiris': 'Nilgiris',
  'the nilgiris': 'Nilgiris',

  // Namakkal
  'namakkal': 'Namakkal',
  'rasipuram': 'Namakkal',
  'tiruchengode': 'Namakkal',
  'paramathi velur': 'Namakkal',
  'kolli hills': 'Namakkal',

  // Ramanathapuram, Sivaganga, Virudhunagar
  'ramanathapuram': 'Ramanathapuram',
  'ramnad': 'Ramanathapuram',
  'rameshwaram': 'Ramanathapuram',
  'mandapam': 'Ramanathapuram',
  'paramakudi': 'Ramanathapuram',
  'kilakarai': 'Ramanathapuram',
  'sivaganga': 'Sivaganga',
  'karaikudi': 'Sivaganga',
  'devakottai': 'Sivaganga',
  'manamadurai': 'Sivaganga',
  'virudhunagar': 'Virudhunagar',
  'sivakasi': 'Virudhunagar',
  'rajapalayam': 'Virudhunagar',
  'srivilliputhur': 'Virudhunagar',
  'aruppukottai': 'Virudhunagar'
};

let cachedDistricts = null;

export async function getDistrictDictionary() {
  if (cachedDistricts) return cachedDistricts;

  try {
    const [rows] = await pool.query('SELECT id, code, name, headquarters, center_lat, center_lng FROM districts');
    cachedDistricts = rows;
    return rows;
  } catch (err) {
    console.error('Failed to load districts cache:', err.message);
    return [];
  }
}

/**
 * Resolves location text or coordinates to an official Tamil Nadu district
 */
export async function resolveGeographicLocation({ locationText = '', districtMention = '', lat = null, lng = null }) {
  const districts = await getDistrictDictionary();

  // 1. If explicit valid coordinates provided, find closest TN district
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    // Bounding box check for Tamil Nadu [approx lat 8.0 - 13.6, lng 76.0 - 80.5]
    if (parsedLat >= 7.8 && parsedLat <= 14.0 && parsedLng >= 76.0 && parsedLng <= 81.0) {
      let closestDist = null;
      let minDistance = Infinity;

      for (const dist of districts) {
        const dLat = parsedLat - parseFloat(dist.center_lat);
        const dLng = parsedLng - parseFloat(dist.center_lng);
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < minDistance) {
          minDistance = distSq;
          closestDist = dist;
        }
      }

      if (closestDist && minDistance < 0.5) { // Within reasonable district boundary
        return {
          resolved: true,
          district: closestDist,
          locationName: locationText.trim() || `${closestDist.name} Sector`,
          lat: parsedLat,
          lng: parsedLng,
          resolutionMethod: 'COORDINATE_REVERSE_MATCH',
          confidence: 95.0
        };
      }
    }
  }

  // 2. Direct match on District Name / Code
  const cleanDistrict = (districtMention || '').trim().toLowerCase();
  if (cleanDistrict) {
    const exactDist = districts.find(
      (d) => d.name.toLowerCase() === cleanDistrict || d.code.toLowerCase() === cleanDistrict
    );
    if (exactDist) {
      // Perturb coordinates slightly for unique cluster display
      const jitterLat = parseFloat(exactDist.center_lat) + (Math.random() * 0.03 - 0.015);
      const jitterLng = parseFloat(exactDist.center_lng) + (Math.random() * 0.03 - 0.015);

      return {
        resolved: true,
        district: exactDist,
        locationName: locationText.trim() || exactDist.name,
        lat: jitterLat,
        lng: jitterLng,
        resolutionMethod: 'DIRECT_DISTRICT_FIELD',
        confidence: 92.0
      };
    }
  }

  // 3. Scan location text for known localities, towns, checkposts, taluks
  const lowerText = `${locationText} ${districtMention}`.toLowerCase();

  // A. Check known localities map
  for (const [locality, targetDistName] of Object.entries(KNOWN_LOCALITY_MAP)) {
    const regex = new RegExp(`\\b${locality}\\b`, 'i');
    if (regex.test(lowerText)) {
      const matchedDist = districts.find((d) => d.name.toLowerCase() === targetDistName.toLowerCase());
      if (matchedDist) {
        const jitterLat = parseFloat(matchedDist.center_lat) + (Math.random() * 0.03 - 0.015);
        const jitterLng = parseFloat(matchedDist.center_lng) + (Math.random() * 0.03 - 0.015);

        return {
          resolved: true,
          district: matchedDist,
          locationName: locationText.trim() || locality.toUpperCase(),
          lat: jitterLat,
          lng: jitterLng,
          resolutionMethod: 'KNOWN_LOCALITY_DICTIONARY',
          confidence: 88.0
        };
      }
    }
  }

  // B. Check if any district name appears inside the free text
  for (const dist of districts) {
    const regex = new RegExp(`\\b${dist.name}\\b`, 'i');
    if (regex.test(lowerText)) {
      const jitterLat = parseFloat(dist.center_lat) + (Math.random() * 0.03 - 0.015);
      const jitterLng = parseFloat(dist.center_lng) + (Math.random() * 0.03 - 0.015);

      return {
        resolved: true,
        district: dist,
        locationName: locationText.trim() || dist.name,
        lat: jitterLat,
        lng: jitterLng,
        resolutionMethod: 'FREE_TEXT_DISTRICT_NAME',
        confidence: 85.0
      };
    }
  }

  // 4. Fallback: STRICT UNRESOLVED LOCATION - DO NOT GUESS OR HALLUCINATE
  return {
    resolved: false,
    district: null,
    locationName: locationText.trim() || 'Unresolved Spatial Location',
    lat: null,
    lng: null,
    resolutionMethod: 'UNRESOLVED',
    unresolvedReason: 'LOCATION_VERIFICATION_REQUIRED',
    confidence: 20.0
  };
}
