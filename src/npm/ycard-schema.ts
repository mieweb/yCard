import { z } from 'zod';

// Utility function for alias resolution
export function resolveAlias<T>(primary: T, ...aliases: (T | undefined)[]): T | undefined {
  return primary ?? aliases.find(alias => alias != null);
}

// Utility function for string array fields with aliases
export function stringOrArrayField() {
  return z.union([z.string(), z.array(z.string())]).optional();
}

// Basic address schema
const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

// Phone schema - supports both string and object formats
const PhoneSchema = z.union([
  z.string(), // Simple string format
  z.object({
    type: z.string().default('work'),
    number: z.string(),
  })
]);

// Job schema for multi-hat support
export const JobSchema = z.object({
  role: z.string().optional(),
  title: z.string().optional(), // Alias for role
  fte: z.number().min(0).max(1).default(1),
  manager: z.string().optional(),
  jefe: z.string().optional(), // Spanish alias for manager
  dotted: z.array(z.string()).default([]),
  org_unit: z.string().optional(),
  org: z.string().optional(), // Organization for this role
  primary: z.boolean().default(false),
}).transform((job: { role?: string; title?: string; fte: number; manager?: string; jefe?: string; dotted: string[]; org_unit?: string; org?: string; primary: boolean }) => ({
  ...job,
  role: job.role || job.title, // Use title as role if role not provided
  manager: job.manager || job.jefe, // Use jefe as manager if manager not provided
}));

// Enhanced internationalization schema
const I18nSchema = z.object({
  displayName: z.record(z.string()).optional(),
  name: z.record(z.string()).optional(),
  title: z.record(z.string()).optional(),
  puesto: z.record(z.string()).optional(), // Spanish alias for title
  org: z.record(z.string()).optional(),
  org_unit: z.record(z.string()).optional(),
  surname: z.record(z.string()).optional(),
  apellido: z.record(z.string()).optional(), // Spanish alias for surname
}).optional();

// Main person schema with alias support
export const PersonSchema = z.object({
  // Core identifiers
  uid: z.string(),
  id: z.string().optional(), // Alternative to uid

  // Name fields with aliases
  name: z.string().optional(),
  nombre: z.string().optional(), // Spanish alias
  displayName: z.string().optional(), // Alternative name format

  surname: z.string().optional(),
  apellido: z.string().optional(), // Spanish alias
  sn: z.string().optional(), // LDAP alias
  lastName: z.string().optional(), // Alternative

  // Title/position with aliases
  title: z.string().optional(),
  puesto: z.string().optional(), // Spanish alias
  role: z.string().optional(), // Alternative

  // Contact information with aliases
  email: z.union([z.string(), z.array(z.string())]).optional(),
  correo: z.union([z.string(), z.array(z.string())]).optional(), // Spanish alias
  mail: z.string().optional(), // LDAP alias

  // Organization with aliases
  org: z.string().optional(),
  organization: z.string().optional(), // Alternative
  company: z.string().optional(), // Alternative

  org_unit: z.string().optional(),
  department: z.string().optional(), // Alternative
  ou: z.string().optional(), // LDAP alias

  // Management with aliases
  manager: z.string().nullable().optional(),
  jefe: z.string().nullable().optional(), // Spanish alias
  上司: z.string().nullable().optional(), // Japanese alias
  boss: z.string().nullable().optional(), // Alternative

  // Contact details
  phone: z.array(PhoneSchema).optional(),
  tel: z.array(PhoneSchema).optional(), // LDAP alias

  address: AddressSchema.optional(),
  adr: AddressSchema.optional(), // LDAP alias

  // Multi-hat support
  jobs: z.array(JobSchema).optional(),

  // Internationalization
  i18n: I18nSchema,
}).transform((person: {
  uid: string;
  id?: string;
  name?: string;
  nombre?: string;
  displayName?: string;
  surname?: string;
  apellido?: string;
  sn?: string;
  lastName?: string;
  title?: string;
  puesto?: string;
  role?: string;
  email?: string | string[];
  correo?: string | string[];
  mail?: string;
  org?: string;
  organization?: string;
  company?: string;
  org_unit?: string;
  department?: string;
  ou?: string;
  manager?: string | null;
  jefe?: string | null;
  '上司'?: string | null;
  boss?: string | null;
  phone?: (string | { type: string; number: string })[];
  tel?: (string | { type: string; number: string })[];
  address?: { street?: string; city?: string; state?: string; postal_code?: string; country?: string };
  adr?: { street?: string; city?: string; state?: string; postal_code?: string; country?: string };
  jobs?: any[];
  i18n?: any;
}) => ({
  ...person,
  // Resolve aliases to canonical fields
  uid: person.uid || person.id,
  name: person.name || person.nombre || person.displayName,
  surname: person.surname || person.apellido || person.sn || person.lastName,
  title: person.title || person.puesto || person.role,
  email: person.email || person.correo || person.mail,
  org: person.org || person.organization || person.company,
  org_unit: person.org_unit || person.department || person.ou,
  manager: person.manager || person.jefe || person['上司'] || person.boss,
  phone: person.phone || person.tel,
  address: person.address || person.adr,
}));

// Root schema for yCard document
export const YCardSchema = z.object({
  people: z.array(PersonSchema),
});

// Type exports
export type Address = z.infer<typeof AddressSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Job = z.infer<typeof JobSchema>;
export type I18n = z.infer<typeof I18nSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type YCard = z.infer<typeof YCardSchema>;

// OpenAPI generation helper
export function generateOpenAPISchema() {
  // Helper function to convert Zod schema to JSON schema
  const zodToJsonSchema = (schema: any): any => {
    // Handle transform schemas by getting the inner schema
    if (schema._def.typeName === 'ZodEffects' && schema._def.schema) {
      return zodToJsonSchema(schema._def.schema);
    }

    // This is a basic conversion - for production, consider using a library like zod-to-json-schema
    if (schema._def.typeName === 'ZodObject') {
      const shape = schema._def.shape();
      const properties: any = {};
      const required: string[] = [];

      Object.entries(shape).forEach(([key, fieldSchema]: [string, any]) => {
        properties[key] = zodToJsonSchema(fieldSchema);
        // Check if field is required (not optional)
        if (fieldSchema._def.typeName !== 'ZodOptional' &&
            fieldSchema._def.typeName !== 'ZodNullable' &&
            !fieldSchema._def.defaultValue) {
          required.push(key);
        }
      });

      return {
        type: 'object',
        properties,
        ...(required.length > 0 && { required })
      };
    }

    if (schema._def.typeName === 'ZodString') {
      return { type: 'string' };
    }

    if (schema._def.typeName === 'ZodNumber') {
      const result: any = { type: 'number' };
      if (schema._def.checks) {
        schema._def.checks.forEach((check: any) => {
          if (check.kind === 'min') result.minimum = check.value;
          if (check.kind === 'max') result.maximum = check.value;
        });
      }
      return result;
    }

    if (schema._def.typeName === 'ZodBoolean') {
      return { type: 'boolean' };
    }

    if (schema._def.typeName === 'ZodArray') {
      return {
        type: 'array',
        items: zodToJsonSchema(schema._def.type)
      };
    }

    if (schema._def.typeName === 'ZodUnion') {
      return {
        oneOf: schema._def.options.map(zodToJsonSchema)
      };
    }

    if (schema._def.typeName === 'ZodOptional' || schema._def.typeName === 'ZodNullable') {
      return zodToJsonSchema(schema._def.innerType);
    }

    if (schema._def.typeName === 'ZodRecord') {
      return {
        type: 'object',
        additionalProperties: zodToJsonSchema(schema._def.valueType)
      };
    }

    // Default fallback
    return { type: 'string' };
  };

  return {
    openapi: '3.0.0',
    info: {
      title: 'yCard Schema',
      version: '1.0.0',
      description: 'Type definitions for yCard contact management',
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Example API server'
      }
    ],
    paths: {},
    components: {
      schemas: {
        Address: zodToJsonSchema(AddressSchema),
        Phone: zodToJsonSchema(PhoneSchema),
        Job: zodToJsonSchema(JobSchema),
        I18n: zodToJsonSchema(I18nSchema),
        Person: zodToJsonSchema(PersonSchema),
        YCard: zodToJsonSchema(YCardSchema),
      },
    },
  };
}
