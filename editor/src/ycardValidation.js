// Minimal yCard validation and completion logic for Monaco Editor
// This is a JS port of your TypeScript parser and completion logic

// Core fields and aliases for completion
export const ycardFields = [
  'uid', 'name', 'surname', 'title', 'email', 'org', 'org_unit', 'manager', 'phone', 'address', 'jobs', 'i18n',
  'id', 'nombre', 'apellido', 'puesto', 'correo', 'jefe', '上司', 'displayName', 'lastName', 'role', 'mail', 'organization', 'company', 'department', 'ou', 'boss', 'tel', 'adr', 'sn'
];

// Simple YAML validation (checks for required fields and structure)
export function validateYCard(yamlText, yamlLib) {
  try {
    // Parse YAML
    const data = yamlLib.load(yamlText);
    if (!data) return [];

    // If 'people' array exists, validate each person
    if (Array.isArray(data.people)) {
      const errors = [];
      data.people.forEach((person, idx) => {
        if (!person.uid) errors.push(`Person ${idx + 1}: Missing uid.`);
        if (!person.name && !person.nombre) errors.push(`Person ${idx + 1}: Missing name (or alias).`);
        if (!person.surname && !person.apellido && !person.sn) errors.push(`Person ${idx + 1}: Missing surname (or alias).`);
      });
      return errors;
    }

    // If it's a single person object (not array)
    if (typeof data === 'object' && (data.uid || data.name || data.surname)) {
      const errors = [];
      if (!data.uid) errors.push('Missing uid.');
      if (!data.name && !data.nombre) errors.push('Missing name (or alias).');
      if (!data.surname && !data.apellido && !data.sn) errors.push('Missing surname (or alias).');
      return errors;
    }

    // Allow empty or other objects as valid
    return [];
  } catch (e) {
    return [e.message || 'YAML parsing error.'];
  }
}
