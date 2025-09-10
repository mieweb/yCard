import { z } from 'zod';
import * as yaml from 'js-yaml';
import { YCardSchema, PersonSchema, type YCard, type Person } from './zod-spec';

export class YCardParser {
  private schema: z.ZodSchema;

  constructor(schema: z.ZodSchema = YCardSchema) {
    this.schema = schema;
  }

  /**
   * Parse and validate yCard YAML content
   */
  parse(content: string): { success: true; data: YCard } | { success: false; errors: z.ZodError[] } {
    try {
      // Parse YAML
      const yamlData = yaml.load(content);

      // Validate with Zod
      const result = this.schema.safeParse(yamlData);

      if (result.success) {
        return { success: true, data: result.data as YCard };
      } else {
        return { success: false, errors: [result.error] };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: [error] };
      } else {
        // YAML parsing error
        const yamlError = new z.ZodError([{
          code: 'custom',
          message: `YAML parsing error: ${error instanceof Error ? error.message : String(error)}`,
          path: [],
        }]);
        return { success: false, errors: [yamlError] };
      }
    }
  }

  /**
   * Parse a single person entry
   */
  parsePerson(content: string): { success: true; data: Person } | { success: false; errors: z.ZodError[] } {
    try {
      const yamlData = yaml.load(content);
      const result = PersonSchema.safeParse(yamlData);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, errors: [result.error] };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: [error] };
      } else {
        const yamlError = new z.ZodError([{
          code: 'custom',
          message: `YAML parsing error: ${error instanceof Error ? error.message : String(error)}`,
          path: [],
        }]);
        return { success: false, errors: [yamlError] };
      }
    }
  }

  /**
   * Validate content without parsing
   */
  validate(content: string): z.ZodError[] {
    const result = this.parse(content);
    return result.success ? [] : result.errors;
  }

  /**
   * Get detailed error messages
   */
  getErrorMessages(errors: z.ZodError[]): string[] {
    return errors.flatMap(error =>
      error.errors.map(err => {
        const path = err.path.join('.');
        return `${path ? `${path}: ` : ''}${err.message}`;
      })
    );
  }

  /**
   * Extract all UIDs from parsed content
   */
  extractUIDs(data: YCard): string[] {
    return data.people.map(person => person.uid).filter((uid): uid is string => uid !== undefined);
  }

  /**
   * Check for duplicate UIDs
   */
  checkDuplicateUIDs(data: YCard): string[] {
    const uids = this.extractUIDs(data);
    const duplicates: string[] = [];
    const seen = new Set<string>();

    for (const uid of uids) {
      if (seen.has(uid)) {
        duplicates.push(uid);
      } else {
        seen.add(uid);
      }
    }

    return duplicates;
  }

  /**
   * Resolve aliases in parsed data
   */
  resolveAliases(data: YCard): YCard {
    // The Zod schema already handles alias resolution through transforms
    // This method can be used for additional post-processing if needed
    return data;
  }

  /**
   * Extract internationalized content for a specific language
   */
  getLocalizedPerson(person: Person, language: string): Person {
    const localized: any = { ...person };

    if (person.i18n) {
      // Apply internationalization
      Object.keys(person.i18n).forEach(field => {
        const translations = (person.i18n as any)[field];
        if (translations && translations[language]) {
          localized[field] = translations[language];
        }
      });
    }

    return localized;
  }

  /**
   * Validate internationalized content
   */
  validateI18n(data: YCard): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    data.people.forEach((person: Person, index: number) => {
      if (person.i18n) {
        // Check for valid language codes (basic ISO 639-1 validation)
        Object.values(person.i18n).forEach((fieldTranslations: any) => {
          if (fieldTranslations && typeof fieldTranslations === 'object') {
            Object.keys(fieldTranslations).forEach(lang => {
              if (!/^[a-z]{2,3}$/.test(lang)) {
                issues.push(`Person ${index}: Invalid language code '${lang}'`);
              }
            });
          }
        });
      }
    });

    return { valid: issues.length === 0, issues };
  }
}

// Tree-Sitter integration helper
export class TreeSitterHelper {
  static generateGrammar() {
    // This would generate Tree-Sitter grammar rules based on the Zod schema
    // For now, return a basic YAML grammar
    return `
module.exports = grammar({
  name: 'ycard',

  rules: {
    document: $ => seq(
      $.people_section,
      repeat($.comment)
    ),

    people_section: $ => seq(
      'people:',
      $.newline,
      repeat($.person)
    ),

    person: $ => seq(
      '-',
      $.newline,
      repeat($.field)
    ),

    field: $ => seq(
      $.field_name,
      ':',
      $.field_value,
      $.newline
    ),

    field_name: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    field_value: $ => /.*/,

    comment: $ => seq('#', /.*/),
    newline: $ => /\n/
  }
});
    `;
  }
}
