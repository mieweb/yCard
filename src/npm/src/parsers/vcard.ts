// vCard 4.0 parser and serializer
export interface VCardProperty {
  name: string;
  value: string;
  parameters?: Record<string, string>;
}

export interface VCard {
  version: string;
  uid?: string;
  fn?: string; // Full name
  n?: string[]; // Name components [family, given, additional, prefixes, suffixes]
  title?: string;
  org?: string[];
  email?: Array<{ value: string; type?: string }>;
  tel?: Array<{ value: string; type?: string }>;
  adr?: Array<{ value: string[]; type?: string }>;
  url?: string[];
  note?: string;
  categories?: string[];
  [key: string]: any;
}

/**
 * Parse a vCard 4.0 string into VCard objects
 * @param vcfString - The vCard content as a string
 * @returns Array of parsed VCard objects
 */
export function parseVCard(vcfString: string): VCard[] {
  const cards: VCard[] = [];
  const lines = vcfString.split('\n').map(line => line.trim());

  let currentCard: Partial<VCard> = {};
  let inCard = false;

  for (const line of lines) {
    if (line === 'BEGIN:VCARD') {
      currentCard = { version: '4.0' };
      inCard = true;
      continue;
    }

    if (line === 'END:VCARD') {
      if (currentCard && Object.keys(currentCard).length > 1) {
        cards.push(currentCard as VCard);
      }
      inCard = false;
      continue;
    }

    if (!inCard || !line || line.startsWith('#')) continue;

    const property = parseVCardProperty(line);
    if (property) {
      addPropertyToCard(currentCard, property);
    }
  }

  return cards;
}

/**
 * Convert VCard objects to vCard 4.0 text
 * @param cards - Array of VCard objects to serialize
 * @returns vCard 4.0 formatted string
 */
export function stringifyVCard(cards: VCard[], version: '2.1' | '3.0' | '4.0' = '4.0'): string {
  return cards.map(card => {
    const lines = ['BEGIN:VCARD', `VERSION:${version}`];

    // UID (not in v2.1)
    if (card.uid && version !== '2.1') {
      lines.push(`UID:${card.uid}`);
    }

    // Full name
    if (card.fn) lines.push(`FN:${escapeVCardValue(card.fn)}`);

    // Name components
    if (card.n && card.n.length > 0) {
      lines.push(`N:${card.n.map(escapeVCardValue).join(';')}`);
    }

    // Title
    if (card.title) lines.push(`TITLE:${escapeVCardValue(card.title)}`);

    // Organization
    if (card.org && card.org.length > 0) {
      lines.push(`ORG:${card.org.map(escapeVCardValue).join(';')}`);
    }

    // Email addresses
    if (card.email) {
      card.email.forEach(email => {
        if (version === '2.1') {
          // v2.1 format: EMAIL;INTERNET;HOME:email@example.com
          const type = email.type ? `;${email.type.toUpperCase()}` : '';
          lines.push(`EMAIL;INTERNET${type}:${email.value}`);
        } else if (version === '3.0') {
          // v3.0 format: EMAIL;TYPE=HOME,INTERNET:email@example.com
          const type = email.type ? `;TYPE=${email.type.toUpperCase()}` : '';
          lines.push(`EMAIL${type}:${email.value}`);
        } else {
          // v4.0 format: EMAIL;TYPE=home:email@example.com (lowercase)
          const type = email.type ? `;TYPE=${email.type.toLowerCase()}` : '';
          lines.push(`EMAIL${type}:${email.value}`);
        }
      });
    }

    // Phone numbers
    if (card.tel) {
      card.tel.forEach(tel => {
        if (version === '2.1') {
          const type = tel.type ? `;${tel.type.toUpperCase()}` : '';
          lines.push(`TEL${type}:${tel.value}`);
        } else if (version === '3.0') {
          const type = tel.type ? `;TYPE=${tel.type.toUpperCase()}` : '';
          lines.push(`TEL${type}:${tel.value}`);
        } else {
          const type = tel.type ? `;TYPE=${tel.type.toLowerCase()}` : '';
          lines.push(`TEL${type}:${tel.value}`);
        }
      });
    }

    // Addresses
    if (card.adr) {
      card.adr.forEach(adr => {
        if (version === '2.1') {
          const type = adr.type ? `;${adr.type.toUpperCase()}` : '';
          lines.push(`ADR${type}:${adr.value.map(escapeVCardValue).join(';')}`);
        } else if (version === '3.0') {
          const type = adr.type ? `;TYPE=${adr.type.toUpperCase()}` : '';
          lines.push(`ADR${type}:${adr.value.map(escapeVCardValue).join(';')}`);
        } else {
          const type = adr.type ? `;TYPE=${adr.type.toLowerCase()}` : '';
          lines.push(`ADR${type}:${adr.value.map(escapeVCardValue).join(';')}`);
        }
      });
    }

    // URLs
    if (card.url) {
      card.url.forEach(url => lines.push(`URL:${url}`));
    }

    // Note
    if (card.note) lines.push(`NOTE:${escapeVCardValue(card.note)}`);

    // Categories
    if (card.categories && card.categories.length > 0) {
      lines.push(`CATEGORIES:${card.categories.join(',')}`);
    }

    lines.push('END:VCARD');
    return lines.join('\r\n');
  }).join('\r\n\r\n');
}

function parseVCardProperty(line: string): VCardProperty | null {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;

  const beforeColon = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  // Parse property name and parameters
  const parts = beforeColon.split(';');
  const name = parts[0].toUpperCase();

  const parameters: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const param = parts[i];
    const equalIndex = param.indexOf('=');
    if (equalIndex !== -1) {
      const paramName = param.substring(0, equalIndex);
      const paramValue = param.substring(equalIndex + 1);
      parameters[paramName] = paramValue;
    }
  }

  return { name, value, parameters };
}

function addPropertyToCard(card: Partial<VCard>, property: VCardProperty): void {
  const { name, value, parameters } = property;

  switch (name) {
    case 'VERSION':
      card.version = value;
      break;
    case 'UID':
      card.uid = value;
      break;
    case 'FN':
      card.fn = unescapeVCardValue(value);
      break;
    case 'N':
      card.n = value.split(';').map(unescapeVCardValue);
      break;
    case 'TITLE':
      card.title = unescapeVCardValue(value);
      break;
    case 'ORG':
      card.org = value.split(';').map(unescapeVCardValue);
      break;
    case 'EMAIL':
      if (!card.email) card.email = [];
      card.email.push({
        value: value,
        type: parameters?.TYPE
      });
      break;
    case 'TEL':
      if (!card.tel) card.tel = [];
      card.tel.push({
        value: value,
        type: parameters?.TYPE
      });
      break;
    case 'ADR':
      if (!card.adr) card.adr = [];
      card.adr.push({
        value: value.split(';').map(unescapeVCardValue),
        type: parameters?.TYPE
      });
      break;
    case 'URL':
      if (!card.url) card.url = [];
      card.url.push(value);
      break;
    case 'NOTE':
      card.note = unescapeVCardValue(value);
      break;
    case 'CATEGORIES':
      card.categories = value.split(',').map(s => s.trim());
      break;
  }
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function unescapeVCardValue(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\;/g, ';')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\');
}
