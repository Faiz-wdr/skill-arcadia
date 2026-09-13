/**
 * Precision date parser and timer utility for Webinar Landing Page & Admin.
 * Targets IST (+05:30) for consistent epoch calculation across all devices and locales.
 */

export const DEFAULT_WEBINAR_TARGET_MS = new Date('2026-09-23T19:30:00+05:30').getTime();

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

/**
 * Parse any date string and optional time string into millisecond epoch timestamp targeting IST.
 * 
 * Supports:
 * - 'September 30, 2026'
 * - 'September 30th, 2026'
 * - '30 September 2026'
 * - '30th September 2026'
 * - '30-09-2026', '30/09/2026', '30.09.2026'
 * - '2026-09-30', '2026/09/30'
 * - 'Sep 30, 2026'
 */
export function parseWebinarTarget(dateStr, timeStr = '7:30 PM IST') {
  if (!dateStr || typeof dateStr !== 'string') {
    return DEFAULT_WEBINAR_TARGET_MS;
  }

  let clean = dateStr.trim();
  // Strip ordinal suffixes: 30th -> 30, 1st -> 1, 2nd -> 2, 3rd -> 3
  clean = clean.replace(/(\d+)(?:st|nd|rd|th)/gi, '$1');

  // Extract hours and minutes from timeStr (defaults to 19:30 IST)
  let hours = 19;
  let minutes = 30;
  if (timeStr && typeof timeStr === 'string') {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const meridian = timeMatch[4] ? timeMatch[4].toLowerCase() : null;
      if (meridian === 'pm' && h < 12) h += 12;
      if (meridian === 'am' && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  let year = null;
  let month = null;
  let day = null;

  // Pattern 1: ISO formats YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  }

  // Pattern 2: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  if (year === null) {
    const dmyMatch = clean.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10) - 1;
      year = parseInt(dmyMatch[3], 10);
    }
  }

  // Pattern 3: Month DD, YYYY or Month DD YYYY (e.g. September 30, 2026)
  if (year === null) {
    const mdyMatch = clean.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (mdyMatch && MONTH_MAP[mdyMatch[1].toLowerCase()] !== undefined) {
      month = MONTH_MAP[mdyMatch[1].toLowerCase()];
      day = parseInt(mdyMatch[2], 10);
      year = parseInt(mdyMatch[3], 10);
    }
  }

  // Pattern 4: DD Month YYYY (e.g. 30 September 2026)
  if (year === null) {
    const dmyWordMatch = clean.match(/^(\d{1,2})\s+([a-zA-Z]+),?\s+(\d{4})/);
    if (dmyWordMatch && MONTH_MAP[dmyWordMatch[2].toLowerCase()] !== undefined) {
      day = parseInt(dmyWordMatch[1], 10);
      month = MONTH_MAP[dmyWordMatch[2].toLowerCase()];
      year = parseInt(dmyWordMatch[3], 10);
    }
  }

  // If structured date was identified, compute UTC offset for IST (+05:30)
  if (year !== null && month !== null && day !== null) {
    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const epochMs = Date.UTC(year, month, day, hours, minutes, 0) - istOffsetMs;
    if (!isNaN(epochMs)) return epochMs;
  }

  // Fallback to Date.parse with IST timezone specifier
  const withTimezone = `${clean} 19:30:00 GMT+0530`;
  const parsedWithTz = Date.parse(withTimezone);
  if (!isNaN(parsedWithTz)) return parsedWithTz;

  const directParsed = Date.parse(clean);
  if (!isNaN(directParsed)) return directParsed;

  return DEFAULT_WEBINAR_TARGET_MS;
}

/**
 * Calculate time left breakdown from target timestamp and reference timestamp.
 */
export function calculateTimeRemaining(targetTimestamp, nowMs = Date.now()) {
  const distance = Math.max(0, targetTimestamp - nowMs);

  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: String(d).padStart(2, '0'),
    hours: String(h).padStart(2, '0'),
    mins: String(m).padStart(2, '0'),
    secs: String(s).padStart(2, '0'),
    distanceMs: distance,
    isExpired: distance <= 0
  };
}

/**
 * Convenience helper to calculate whole days remaining from a date string.
 */
export function calculateDaysRemaining(dateStr, timeStr = '7:30 PM IST') {
  const target = parseWebinarTarget(dateStr, timeStr);
  const diff = target - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
