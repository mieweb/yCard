# yCard Specification

## Overview

yCard is a YAML-based format for representing contact information, organizational structures, and personal data. It is designed to be human-readable, internationalized, and compatible with existing standards like vCard, LDAP, and LDIF.

## Major Elements

### Core Properties

- **uid**: Unique identifier for the person or entity (string)
- **name**: Full name or display name (string)
- **surname**: Family name or last name (string)
- **title**: Job title or position (string)
- **email**: Email address (string or array of strings)
- **org**: Organization name (string)
- **org_unit**: Organizational unit or department (string)
- **manager**: Manager's UID (string)
- **phone**: Phone number (string or array of objects with type and number)
- **address**: Physical address (object with street, city, state, postal_code, country)

### Multi-hat Support

- **jobs**: Array of job objects for people with multiple roles
  - **role**: Job title for this position
  - **fte**: Full-time equivalent (number between 0 and 1)
  - **manager**: Manager for this role
  - **dotted**: Array of dotted-line managers
  - **org_unit**: Department for this role
  - **primary**: Whether this is the primary role (boolean)

### Internationalization

- **i18n**: Object containing internationalized versions of fields
  - **displayName**: Object with language codes as keys and translated names as values
  - **title**: Object with language codes as keys and translated titles as values

### Aliases

yCard supports aliases for field names to accommodate different languages and conventions:
- `nombre` → `name` (Spanish)
- `apellido` → `surname` (Spanish)
- `puesto` → `title` (Spanish)
- `jefe` → `manager` (Spanish)
- `correo` → `email` (Spanish)
- `上司` → `manager` (Japanese)

## Data Types

- **String**: Text values
- **Number**: Numeric values (integers or floats)
- **Boolean**: True/false values
- **Array**: Lists of values
- **Object**: Nested structures

## Validation Rules

- UID must be unique across all entries
- Email addresses should be valid email format
- FTE values must be between 0 and 1
- Manager references must point to valid UIDs
- Internationalization objects should use standard language codes (ISO 639-1)

## Export Compatibility

yCard is designed to be easily converted to:
- vCard format
- LDAP LDIF format
- CSV format
- JSON format

## Example Structure

```yaml
people:
  - uid: example
    name: "John Doe"
    surname: "Doe"
    title: "Software Engineer"
    email: "john.doe@example.com"
    org: "Example Corp"
    org_unit: "Engineering"
    manager: "boss_uid"
    phone:
      - type: "work"
        number: "+1-555-0123"
    address:
      street: "123 Main St"
      city: "Anytown"
      state: "CA"
      postal_code: "12345"
      country: "USA"
    jobs:
      - role: "Senior Engineer"
        fte: 0.8
        primary: true
      - role: "Tech Lead"
        fte: 0.2
        primary: false
    i18n:
      displayName:
        en: "John Doe"
        es: "Juan Doe"
        ja: "ジョン・ドゥ"
```
