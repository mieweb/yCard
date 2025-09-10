import { YCard, Person, YCardSchema } from './types';

/**
 * Convert YCard organization to LDIF format
 * @param org - The yCard organization
 * @param baseDn - Base DN for the LDIF entries
 * @returns LDIF formatted string
 */
export function yCardToLDIF(org: YCard, baseDn: string): string {
  const entries: string[] = [];

  org.people.forEach(person => {
    const dn = `uid=${person.uid},${baseDn}`;
    const attributes: string[] = [];

    attributes.push(`dn: ${dn}`);
    attributes.push(`objectClass: inetOrgPerson`);
    attributes.push(`objectClass: organizationalPerson`);
    attributes.push(`objectClass: person`);
    attributes.push(`objectClass: top`);
    attributes.push(`uid: ${person.uid}`);

    if (person.name) attributes.push(`givenName: ${person.name}`);
    if (person.surname) attributes.push(`sn: ${person.surname}`);
    if (person.name && person.surname) {
      attributes.push(`cn: ${person.name} ${person.surname}`);
    }

    if (person.title) attributes.push(`title: ${person.title}`);
    if (person.org) attributes.push(`o: ${person.org}`);
    if (person.org_unit) attributes.push(`ou: ${person.org_unit}`);
    if (person.manager) attributes.push(`manager: ${person.manager}`);

    if (person.email) {
      const emails = Array.isArray(person.email) ? person.email : [person.email];
      emails.forEach((email: string) => attributes.push(`mail: ${email}`));
    }

    if (person.phone) {
      person.phone.forEach((phone: any) => {
        const phoneStr = typeof phone === 'string' ? phone : phone.number;
        attributes.push(`telephoneNumber: ${phoneStr}`);
      });
    }

    entries.push(attributes.join('\n'));
  });

  return entries.join('\n\n') + '\n';
}

/**
 * Convert YCard organization to CSV format
 * @param org - The yCard organization
 * @returns CSV formatted string
 */
export function yCardToCSV(org: YCard): string {
  const headers = [
    'UID', 'Name', 'Surname', 'Title', 'Email', 'Phone',
    'Organization', 'Org Unit', 'Manager'
  ];

  const rows: string[] = [headers.join(',')];

  org.people.forEach(person => {
    const email = person.email
      ? (Array.isArray(person.email) ? person.email.join(';') : person.email)
      : '';

    const phone = person.phone
      ? person.phone.map((p: any) => typeof p === 'string' ? p : p.number).join(';')
      : '';

    const row = [
      person.uid,
      person.name || '',
      person.surname || '',
      person.title || '',
      email,
      phone,
      person.org || '',
      person.org_unit || '',
      person.manager || ''
    ].map(field => `"${(field || '').replace(/"/g, '""')}"`);

    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Normalize yCard input by resolving aliases and ensuring canonical format
 * @param input - Raw yCard data (object or parsed)
 * @returns Normalized YCard organization
 */
export function normalizeYCard(input: unknown): YCard {
  // If it's already a YCard, validate and return
  if (typeof input === 'object' && input !== null && 'people' in input) {
    return YCardSchema.parse(input);
  }

  // Try to parse as YCard
  return YCardSchema.parse(input);
}

/**
 * Validate yCard data and return validation results
 * @param org - The yCard data to validate
 * @returns Validation result with success status and error messages
 */
export function validateYCard(org: unknown): { valid: boolean; errors?: string[] } {
  try {
    YCardSchema.parse(org);
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      // Try to extract detailed error messages from Zod
      const errors = error.message.split('\n').filter(line => line.trim());
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Get a summary of the yCard organization
 * @param org - The yCard organization
 * @returns Summary statistics
 */
export function getYCardSummary(org: YCard): {
  totalPeople: number;
  organizations: string[];
  titles: string[];
  hasMultiHat: boolean;
} {
  const organizations = new Set<string>();
  const titles = new Set<string>();
  let hasMultiHat = false;

  org.people.forEach(person => {
    if (person.org) organizations.add(person.org);
    if (person.title) titles.add(person.title);
    if (person.jobs && person.jobs.length > 1) hasMultiHat = true;
  });

  return {
    totalPeople: org.people.length,
    organizations: Array.from(organizations),
    titles: Array.from(titles),
    hasMultiHat
  };
}
