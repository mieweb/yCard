import { parse as parseVCard4, VCARD } from 'vcard4';

// vCard 4.0 parser and serializer using vcard4 library
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
 * Parse a vCard 4.0 string into VCard objects using vcard4 library
 * @param vcfString - The vCard content as a string
 * @returns Array of parsed VCard objects
 */
export function parseVCard(vcfString: string): VCard[] {
  // Normalize line endings to CRLF as required by vcard4
  const normalizedVcfString = vcfString.replace(/\r?\n/g, '\r\n');
  
  try {
    const parsed = parseVCard4(normalizedVcfString);
    
    // Handle both single vCard and array of vCards
    const parsedCards = Array.isArray(parsed) ? parsed : [parsed];
    
    return parsedCards.map(parsedVCard => convertParsedVCardToVCard(parsedVCard));
  } catch (error) {
    throw new Error(`vCard parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert a parsed vCard object from vcard4 library to our VCard interface
 */
function convertParsedVCardToVCard(parsedVCard: any): VCard {
  const card: VCard = {
    version: '4.0'
  };

  // Helper function to get property value
  const getPropertyValue = (propName: string): string | undefined => {
    const props = parsedVCard.getProperty(propName.toLowerCase());
    return props && props.length > 0 ? props[0].value : undefined;
  };

  // Helper function to get all property values
  const getPropertyValues = (propName: string): Array<{ value: string; parameters: Record<string, string> }> => {
    const props = parsedVCard.getProperty(propName.toLowerCase());
    return props ? props.map((prop: any) => ({
      value: prop.value,
      parameters: prop.parameters || {}
    })) : [];
  };

  // Extract basic properties
  card.uid = getPropertyValue('uid');
  card.fn = getPropertyValue('fn');
  card.title = getPropertyValue('title');
  card.note = getPropertyValue('note');

  // Handle N property (name components)
  const nValue = getPropertyValue('n');
  if (nValue) {
    if (typeof nValue === 'string') {
      // Handle string format (fallback)
      card.n = nValue.split(';');
    } else if (typeof nValue === 'object' && nValue !== null) {
      // Handle vcard4 structured format
      const n = nValue as any;
      card.n = [
        n.familyNames || '',
        n.givenNames || '',
        n.additionalNames || '',
        n.honorificPrefixes || '',
        n.honorificSuffixes || ''
      ];
    }
  }

  // Handle ORG property (organization)
  const orgValue = getPropertyValue('org');
  if (orgValue) {
    if (Array.isArray(orgValue)) {
      // Handle vcard4 array format
      card.org = orgValue;
    } else if (typeof orgValue === 'string') {
      // Handle string format (fallback)
      card.org = orgValue.split(';');
    }
  }

  // Handle EMAIL properties
  const emailProps = getPropertyValues('email');
  if (emailProps.length > 0) {
    card.email = emailProps.map(prop => ({
      value: prop.value,
      type: prop.parameters.TYPE
    }));
  }

  // Handle TEL properties
  const telProps = getPropertyValues('tel');
  if (telProps.length > 0) {
    card.tel = telProps.map(prop => ({
      value: prop.value,
      type: prop.parameters.TYPE
    }));
  }

  // Handle ADR properties
  const adrProps = getPropertyValues('adr');
  if (adrProps.length > 0) {
    card.adr = adrProps.map(prop => {
      let value: string[];
      
      if (typeof prop.value === 'string') {
        // Handle string format (fallback)
        value = prop.value.split(';');
      } else if (typeof prop.value === 'object' && prop.value !== null) {
        // Handle vcard4 structured format
        const adr = prop.value as any;
        value = [
          adr.postOfficeBox || '',
          adr.extendedAddress || '',
          adr.streetAddress || '',
          adr.locality || '',
          adr.region || '',
          adr.postalCode || '',
          adr.countryName || ''
        ];
      } else {
        value = [];
      }
      
      return {
        value,
        type: prop.parameters.TYPE
      };
    });
  }

  // Handle URL properties
  const urlProps = getPropertyValues('url');
  if (urlProps.length > 0) {
    card.url = urlProps.map(prop => prop.value);
  }

  // Handle CATEGORIES
  const categoriesValue = getPropertyValue('categories');
  if (categoriesValue) {
    if (Array.isArray(categoriesValue)) {
      // Handle vcard4 array format
      card.categories = categoriesValue;
    } else if (typeof categoriesValue === 'string') {
      // Handle string format (fallback)
      card.categories = categoriesValue.split(',').map(cat => cat.trim());
    }
  }

  return card;
}

/**
 * Convert VCard objects to vCard 4.0 text using vcard4 library
 * @param cards - Array of VCard objects to serialize
 * @returns vCard 4.0 formatted string
 */
export function stringifyVCard(cards: VCard[]): string {
  try {
    return cards.map(card => {
      // Create properties array for VCARD constructor
      const properties: any[] = [];

      // Add UID if present
      if (card.uid) {
        const { UIDProperty } = require('vcard4');
        properties.push(new UIDProperty({ value: card.uid }));
      }

      // Add FN (Full Name) if present
      if (card.fn) {
        const { FNProperty } = require('vcard4');
        properties.push(new FNProperty({ value: card.fn }));
      }

      // Add N (Name components) if present
      if (card.n && card.n.length > 0) {
        const { NProperty } = require('vcard4');
        properties.push(new NProperty({ value: card.n }));
      }

      // Add TITLE if present
      if (card.title) {
        const { TitleProperty } = require('vcard4');
        properties.push(new TitleProperty({ value: card.title }));
      }

      // Add ORG if present
      if (card.org && card.org.length > 0) {
        const { OrgProperty } = require('vcard4');
        properties.push(new OrgProperty({ value: card.org }));
      }

      // Add EMAIL properties
      if (card.email) {
        const { EmailProperty } = require('vcard4');
        card.email.forEach(email => {
          const params: any = {};
          if (email.type) {
            const { TypeParameter } = require('vcard4');
            params.type = new TypeParameter({ value: email.type });
          }
          properties.push(new EmailProperty({ value: email.value, parameters: params }));
        });
      }

      // Add TEL properties
      if (card.tel) {
        const { TelProperty } = require('vcard4');
        card.tel.forEach(tel => {
          const params: any = {};
          if (tel.type) {
            const { TypeParameter } = require('vcard4');
            params.type = new TypeParameter({ value: tel.type });
          }
          properties.push(new TelProperty({ value: tel.value, parameters: params }));
        });
      }

      // Add ADR properties
      if (card.adr) {
        const { AdrProperty } = require('vcard4');
        card.adr.forEach(adr => {
          const params: any = {};
          if (adr.type) {
            const { TypeParameter } = require('vcard4');
            params.type = new TypeParameter({ value: adr.type });
          }
          properties.push(new AdrProperty({ value: adr.value, parameters: params }));
        });
      }

      // Add URL properties
      if (card.url) {
        const { URLProperty } = require('vcard4');
        card.url.forEach(url => {
          properties.push(new URLProperty({ value: url }));
        });
      }

      // Add NOTE if present
      if (card.note) {
        const { NoteProperty } = require('vcard4');
        properties.push(new NoteProperty({ value: card.note }));
      }

      // Add CATEGORIES if present
      if (card.categories && card.categories.length > 0) {
        const { CategoriesProperty } = require('vcard4');
        properties.push(new CategoriesProperty({ value: card.categories }));
      }

      // Create VCARD with properties array
      const vcard = new VCARD(properties);
      return vcard.repr();
    }).join('\r\n\r\n');
  } catch (error) {
    // Fallback to simple string concatenation if vcard4 creation fails
    return cards.map(card => createVCardStringFallback(card)).join('\r\n\r\n');
  }
}

/**
 * Fallback method to create vCard string without vcard4 library
 */
function createVCardStringFallback(card: VCard): string {
  const lines = ['BEGIN:VCARD', 'VERSION:4.0'];

  if (card.uid) lines.push(`UID:${escapeVCardValue(card.uid)}`);
  if (card.fn) lines.push(`FN:${escapeVCardValue(card.fn)}`);
  
  if (card.n && card.n.length > 0) {
    lines.push(`N:${card.n.map(escapeVCardValue).join(';')}`);
  }

  if (card.title) lines.push(`TITLE:${escapeVCardValue(card.title)}`);

  if (card.org && card.org.length > 0) {
    lines.push(`ORG:${card.org.map(escapeVCardValue).join(';')}`);
  }

  if (card.email) {
    card.email.forEach(email => {
      const type = email.type ? `;TYPE=${email.type}` : '';
      lines.push(`EMAIL${type}:${email.value}`);
    });
  }

  if (card.tel) {
    card.tel.forEach(tel => {
      const type = tel.type ? `;TYPE=${tel.type}` : '';
      lines.push(`TEL${type}:${tel.value}`);
    });
  }

  if (card.adr) {
    card.adr.forEach(adr => {
      const type = adr.type ? `;TYPE=${adr.type}` : '';
      lines.push(`ADR${type}:${adr.value.map(escapeVCardValue).join(';')}`);
    });
  }

  if (card.url) {
    card.url.forEach(url => lines.push(`URL:${url}`));
  }

  if (card.note) lines.push(`NOTE:${escapeVCardValue(card.note)}`);

  if (card.categories && card.categories.length > 0) {
    lines.push(`CATEGORIES:${card.categories.join(',')}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}
