import * as yaml from 'js-yaml';
import { YCardSchema, YCard } from '../types';

/**
 * Parse a YAML string into a YCard organization structure
 * @param yamlString - The YAML content as a string
 * @returns Parsed YCard organization
 * @throws Error if parsing or validation fails
 */
export function parseYCard(yamlString: string): YCard {
  try {
    const data = yaml.load(yamlString) as any;
    return YCardSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse yCard: ${error.message}`);
    }
    throw new Error('Failed to parse yCard: Unknown error');
  }
}

/**
 * Convert a YCard organization structure to YAML string
 * @param org - The YCard organization to stringify
 * @returns YAML representation of the organization
 */
export function stringifyYCard(org: YCard): string {
  return yaml.dump(org, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: true
  });
}
