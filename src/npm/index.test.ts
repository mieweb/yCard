import { describe, it, expect } from '@jest/globals';
import { parseYCard, stringifyYCard, yCardToVCard, stringifyVCard, vCardToYCard } from './index';

describe('yCard Package', () => {
  const sampleYaml = `
people:
  - uid: john-doe
    name: John
    surname: Doe
    title: Software Engineer
    email: john.doe@example.com
    org: Example Corp
    phone:
      - type: work
        number: "+1-555-0123"
`;

  it('should parse and stringify yCard', () => {
    const org = parseYCard(sampleYaml);
    expect(org.people).toHaveLength(1);
    expect(org.people[0].name).toBe('John');

    const yaml = stringifyYCard(org);
    expect(yaml).toContain('name: John');
  });

  it('should convert yCard to vCard', () => {
    const org = parseYCard(sampleYaml);
    const cards = yCardToVCard(org);
    expect(cards).toHaveLength(1);

    const vcf = stringifyVCard(cards);
    expect(vcf).toContain('BEGIN:VCARD');
    expect(vcf).toContain('FN:John Doe');
  });

  it('should convert vCard back to yCard', () => {
    const org = parseYCard(sampleYaml);
    const cards = yCardToVCard(org);
    const vcf = stringifyVCard(cards);

    const parsedCards = require('./parsers/vcard').parseVCard(vcf);
    const convertedOrg = vCardToYCard(parsedCards);

    expect(convertedOrg.people).toHaveLength(1);
    expect(convertedOrg.people[0].name).toBe('John');
  });
});
