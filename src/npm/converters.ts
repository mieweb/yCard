import { Person, YCard, Job } from './types';
import { VCard } from './parsers/vcard';

/**
 * Convert a YCardPerson to a VCard
 * Multi-hat support: jobs are expanded as multiple TITLE entries
 * @param person - The yCard person to convert
 * @param orgName - Optional organization name override
 * @returns VCard object
 */
export function yCardPersonToVCard(person: Person, orgName?: string): VCard {
  const card: VCard = {
    version: '4.0',
    uid: person.uid,
  };

  // Full name
  if (person.name && person.surname) {
    card.fn = `${person.name} ${person.surname}`;
  } else if (person.name) {
    card.fn = person.name;
  } else if (person.surname) {
    card.fn = person.surname;
  }

  // Name components [family, given, additional, prefixes, suffixes]
  if (person.surname || person.name) {
    card.n = [
      person.surname || '', // Family name
      person.name || '',    // Given name
      '',                   // Additional names
      '',                   // Honorific prefixes
      ''                    // Honorific suffixes
    ];
  }

  // Primary title/role
  if (person.title) {
    card.title = person.title;
  }

  // Organization
  const org = orgName || person.org;
  if (org) {
    card.org = [org];
    if (person.org_unit) {
      card.org.push(person.org_unit);
    }
  }

  // Email addresses
  if (person.email) {
    card.email = [];
    const emails = Array.isArray(person.email) ? person.email : [person.email];
    emails.forEach((email: string, index: number) => {
      card.email!.push({
        value: email,
        type: index === 0 ? 'work' : undefined
      });
    });
  }

  // Phone numbers
  if (person.phone) {
    card.tel = [];
    person.phone.forEach((phone: any) => {
      const phoneObj = typeof phone === 'string' ? { number: phone, type: 'work' } : phone;
      card.tel!.push({
        value: phoneObj.number,
        type: phoneObj.type
      });
    });
  }

  // Address
  if (person.address) {
    card.adr = [{
      value: [
        '', // Post office box
        '', // Extended address
        person.address.street || '',
        person.address.city || '',
        person.address.state || '',
        person.address.postal_code || '',
        person.address.country || ''
      ],
      type: 'work'
    }];
  }

  return card;
}

/**
 * Convert a complete YCard organization to an array of VCards
 * @param org - The yCard organization to convert
 * @returns Array of VCard objects
 */
export function yCardToVCard(org: YCard): VCard[] {
  const cards: VCard[] = [];
  const orgName = org.people.find(p => p.org)?.org;

  org.people.forEach(person => {
    // Primary card for the person
    const primaryCard = yCardPersonToVCard(person, orgName);
    cards.push(primaryCard);

    // Additional cards for multi-hat jobs
    if (person.jobs) {
      for (let index = 0; index < person.jobs.length; index++) {
        const job: Job = person.jobs[index];
        if (index === 0 && !person.title) continue; // Skip if already covered by primary

        const jobCard = yCardPersonToVCard({
          ...person,
          title: job.role || job.title,
          org: job.org || person.org,
          org_unit: job.org_unit || person.org_unit,
          manager: job.manager || person.manager
        }, orgName);

        // Add job-specific UID suffix
        if (jobCard.uid) {
          jobCard.uid = `${jobCard.uid}-job-${index}`;
        }

        cards.push(jobCard);
      }
    }
  });

  return cards;
}

/**
 * Convert a VCard to a YCardPerson
 * Multi-hat support: multiple TITLE entries become jobs array
 * @param card - The VCard to convert
 * @returns YCardPerson object
 */
export function vCardToYCardPerson(card: VCard): Person {
  const person: any = {
    uid: card.uid || `vcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  // Name parsing
  if (card.n && card.n.length >= 2) {
    person.surname = card.n[0] || undefined; // Family name
    person.name = card.n[1] || undefined; // Given name
  } else if (card.fn) {
    // Fallback to full name if structured name not available
    const nameParts = card.fn.trim().split(' ');
    if (nameParts.length >= 2) {
      person.name = nameParts[0];
      person.surname = nameParts.slice(1).join(' ');
    } else {
      person.name = card.fn;
    }
  }

  // Title/Role
  if (card.title) {
    person.title = card.title;
  }

  // Organization
  if (card.org && card.org.length > 0) {
    person.org = card.org[0];
    if (card.org.length > 1) {
      person.org_unit = card.org[1];
    }
  }

  // Email addresses
  if (card.email && card.email.length > 0) {
    if (card.email.length === 1) {
      person.email = card.email[0].value;
    } else {
      person.email = card.email.map(e => e.value);
    }
  }

  // Phone numbers
  if (card.tel && card.tel.length > 0) {
    person.phone = card.tel.map(t => ({
      type: t.type || 'work',
      number: t.value
    }));
  }

  // Address
  if (card.adr && card.adr.length > 0) {
    const adr = card.adr[0];
    if (adr.value && adr.value.length >= 7) {
      person.address = {
        street: adr.value[2] || undefined,
        city: adr.value[3] || undefined,
        state: adr.value[4] || undefined,
        postal_code: adr.value[5] || undefined,
        country: adr.value[6] || undefined
      };
    }
  }

  return person;
}

/**
 * Convert multiple VCards to a YCardOrg
 * @param cards - Array of VCard objects to convert
 * @returns YCardOrg object
 */
export function vCardToYCard(cards: VCard[]): YCard {
  const people: Person[] = cards.map(card => vCardToYCardPerson(card));

  return {
    people
  };
}
