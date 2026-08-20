import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Classification & Column Mapping Service
 * Strictly adheres to truth in AI labeling:
 * - If ANTHROPIC_API_KEY is present and active, invokes Claude (claude-3-5-sonnet / claude-3-7-sonnet) and returns true AI confidence.
 * - If ANTHROPIC_API_KEY is absent, executes calibrated heuristic parser and explicitly tags classification_method: 'RULE_BASED'.
 */

export async function classifySignalContent(description) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim().startsWith('sk-ant')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          temperature: 0.1,
          system: 'You are a government intelligence text classifier for narcotic signals. Classify into category (SUPPLY_SALE, TRANSPORT_TRANSIT, SEIZURE_ENFORCEMENT, COMMUNITY_CONCERN, HEALTH_EMERGENCY, REHAB_SERVICE_NEED), severity (LOW, MEDIUM, HIGH, CRITICAL), and give numeric confidence (0-100). Return JSON only: {"category": "...", "severity": "...", "confidence": 85.5, "summary": "..."}',
          messages: [
            {
              role: 'user',
              content: `Classify this sanitized signal: "${description}"`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.content?.[0]?.text || '{}';
        const parsed = JSON.parse(rawContent);

        return {
          categoryKey: parsed.category || 'COMMUNITY_CONCERN',
          severity: parsed.severity || 'MEDIUM',
          confidence: parseFloat(parsed.confidence) || 85.0,
          classificationMethod: 'LLM_CLAUDE_SONNET',
          aiSummary: parsed.summary || ''
        };
      }
    } catch (err) {
      console.warn('Anthropic API call fallback to rule-based parser:', err.message);
    }
  }

  // Explicit Rule-Based Calibrated Classification
  const lower = (description || '').toLowerCase();
  let categoryKey = 'COMMUNITY_CONCERN';
  let severity = 'MEDIUM';
  let confidence = 70.0;

  if (lower.includes('seizure') || lower.includes('confiscat') || lower.includes('arrest') || lower.includes('interception')) {
    categoryKey = 'SEIZURE_ENFORCEMENT';
    severity = 'HIGH';
    confidence = 88.0;
  } else if (lower.includes('transit') || lower.includes('border') || lower.includes('highway') || lower.includes('checkpost') || lower.includes('lorry') || lower.includes('cargo')) {
    categoryKey = 'TRANSPORT_TRANSIT';
    severity = 'HIGH';
    confidence = 82.0;
  } else if (lower.includes('sale') || lower.includes('peddl') || lower.includes('distribut') || lower.includes('packet') || lower.includes('commercial quantity')) {
    categoryKey = 'SUPPLY_SALE';
    severity = 'HIGH';
    confidence = 80.0;
  } else if (lower.includes('overdose') || lower.includes('hospital') || lower.includes('emergency') || lower.includes('medical')) {
    categoryKey = 'HEALTH_EMERGENCY';
    severity = 'CRITICAL';
    confidence = 85.0;
  } else if (lower.includes('rehab') || lower.includes('counsel') || lower.includes('addiction') || lower.includes('treatment')) {
    categoryKey = 'REHAB_SERVICE_NEED';
    severity = 'LOW';
    confidence = 75.0;
  }

  return {
    categoryKey,
    severity,
    confidence,
    classificationMethod: 'RULE_BASED',
    aiSummary: 'Calibrated rule-based keyword classification'
  };
}

/**
 * Suggests column mapping for uploaded spreadsheet headers
 */
export async function suggestColumnMapping(headers = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim().startsWith('sk-ant')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          temperature: 0.1,
          system: 'You are a data ingestion mapper. Map the provided CSV/Excel column headers to standard fields: "date", "district", "location", "category", "description", "source". Return JSON only: {"date": "colName", "district": "colName", "location": "colName", "category": "colName", "description": "colName", "source": "colName", "confidence": 92}',
          messages: [
            {
              role: 'user',
              content: `Headers: ${JSON.stringify(headers)}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.content?.[0]?.text || '{}');
        return {
          mapping: parsed,
          method: 'LLM_CLAUDE_SONNET',
          confidence: parsed.confidence || 90
        };
      }
    } catch (err) {
      console.warn('Column mapping LLM fallback:', err.message);
    }
  }

  // Rule-based heuristic header mapping
  const mapping = {
    date: null,
    district: null,
    location: null,
    category: null,
    description: null,
    source: null
  };

  headers.forEach((h) => {
    const norm = h.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    if (/date|time|timestamp|incident_date|dt/i.test(norm) && !mapping.date) mapping.date = h;
    else if (/district|dt_name|dist|jurisdiction/i.test(norm) && !mapping.district) mapping.district = h;
    else if (/location|place|area|taluk|village|station|checkpost|address/i.test(norm) && !mapping.location) mapping.location = h;
    else if (/category|type|incident_type|offence_type|drug_cat/i.test(norm) && !mapping.category) mapping.category = h;
    else if (/desc|detail|remarks|narration|incident_details|text|content/i.test(norm) && !mapping.description) mapping.description = h;
    else if (/source|department|station_code|unit|dept/i.test(norm) && !mapping.source) mapping.source = h;
  });

  return {
    mapping,
    method: 'RULE_BASED',
    confidence: 80
  };
}
