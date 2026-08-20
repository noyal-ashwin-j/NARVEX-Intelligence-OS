/**
 * PII Redaction & Sanitization Service
 * Ensures privacy compliance for public & ingested intelligence text.
 */
export function redactPII(text) {
  if (!text || typeof text !== 'string') return { sanitizedText: '', piiDetectedCount: 0, piiTypes: [] };

  let count = 0;
  const detectedTypes = [];
  let sanitized = text;

  // 1. Phone numbers (10 digits, +91, dashes, spaces)
  const phoneRegex = /(?:\+91[\-\s]?)?[6789]\d{9}\b|(?:\+91[\-\s]?)?[6789]\d{4}[\-\s]?\d{5}\b/g;
  if (phoneRegex.test(sanitized)) {
    detectedTypes.push('PHONE_NUMBER');
    sanitized = sanitized.replace(phoneRegex, () => {
      count++;
      return '[REDACTED_PHONE]';
    });
  }

  // 2. Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(sanitized)) {
    detectedTypes.push('EMAIL');
    sanitized = sanitized.replace(emailRegex, () => {
      count++;
      return '[REDACTED_EMAIL]';
    });
  }

  // 3. Indian Aadhaar / UID number patterns (4 digits space 4 digits space 4 digits)
  const aadhaarRegex = /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g;
  if (aadhaarRegex.test(sanitized)) {
    detectedTypes.push('AADHAAR_ID_PATTERN');
    sanitized = sanitized.replace(aadhaarRegex, () => {
      count++;
      return '[REDACTED_NATIONAL_ID]';
    });
  }

  // 4. Vehicle Registration numbers (e.g. TN 38 AB 1234, TN-01-C-9999)
  const vehicleRegex = /\b(?:TN|KL|KA|AP|PY)[\s\-]?[0-9]{1,2}[\s\-]?[A-Z]{1,3}[\s\-]?[0-9]{1,4}\b/gi;
  if (vehicleRegex.test(sanitized)) {
    detectedTypes.push('VEHICLE_REGISTRATION');
    sanitized = sanitized.replace(vehicleRegex, () => {
      count++;
      return '[REDACTED_VEHICLE_NUM]';
    });
  }

  return {
    sanitizedText: sanitized,
    piiDetectedCount: count,
    piiTypes: detectedTypes
  };
}
