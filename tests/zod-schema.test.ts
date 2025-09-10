import { PersonSchema, YCardSchema, JobSchema } from '../src/zod-spec';

describe('Zod Schema Tests', () => {
  describe('PersonSchema', () => {
    it('should validate a basic person with required fields', () => {
      const validPerson = {
        uid: 'test-user',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = PersonSchema.safeParse(validPerson);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uid).toBe('test-user');
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should resolve Spanish aliases to canonical fields', () => {
      const personWithSpanishAliases = {
        uid: 'test-user',
        nombre: 'Juan Pérez', // Spanish alias for name
        apellido: 'Pérez',    // Spanish alias for surname
        puesto: 'Desarrollador', // Spanish alias for title
        correo: 'juan@example.com', // Spanish alias for email
        jefe: 'manager-uid' // Spanish alias for manager
      };

      const result = PersonSchema.safeParse(personWithSpanishAliases);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Juan Pérez');
        expect(result.data.surname).toBe('Pérez');
        expect(result.data.title).toBe('Desarrollador');
        expect(result.data.email).toBe('juan@example.com');
        expect(result.data.manager).toBe('manager-uid');
      }
    });

    it('should resolve Japanese aliases', () => {
      const personWithJapaneseAliases = {
        uid: 'test-user',
        name: 'Tanaka',
        上司: 'manager-uid' // Japanese alias for manager
      };

      const result = PersonSchema.safeParse(personWithJapaneseAliases);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.manager).toBe('manager-uid');
      }
    });

    it('should resolve LDAP aliases', () => {
      const personWithLDAPAliases = {
        uid: 'test-user',
        name: 'John Doe',
        sn: 'Doe',        // LDAP alias for surname
        ou: 'Engineering', // LDAP alias for org_unit
        mail: 'john@example.com' // LDAP alias for email
      };

      const result = PersonSchema.safeParse(personWithLDAPAliases);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.surname).toBe('Doe');
        expect(result.data.org_unit).toBe('Engineering');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should handle multiple aliases with priority', () => {
      const personWithMultipleAliases = {
        uid: 'test-user',
        name: 'John',           // canonical
        nombre: 'Juan',         // Spanish alias (should not override)
        displayName: 'Johnny',  // alternative (should not override)
        email: 'john@example.com', // canonical
        correo: 'juan@example.com' // Spanish alias (should not override)
      };

      const result = PersonSchema.safeParse(personWithMultipleAliases);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John'); // canonical takes priority
        expect(result.data.email).toBe('john@example.com'); // canonical takes priority
      }
    });

    it('should validate required uid field', () => {
      const personWithoutUid = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = PersonSchema.safeParse(personWithoutUid);
      expect(result.success).toBe(false);
    });

    it('should handle internationalization fields', () => {
      const personWithI18n = {
        uid: 'test-user',
        name: 'John Doe',
        email: 'john@example.com',
        i18n: {
          displayName: {
            en: 'John Doe',
            es: 'Juan Pérez',
            ja: 'ジョン・ドゥ'
          },
          title: {
            en: 'Developer',
            es: 'Desarrollador'
          }
        }
      };

      const result = PersonSchema.safeParse(personWithI18n);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.i18n?.displayName?.en).toBe('John Doe');
        expect(result.data.i18n?.displayName?.es).toBe('Juan Pérez');
      }
    });
  });

  describe('JobSchema', () => {
    it('should validate a basic job', () => {
      const validJob = {
        role: 'Senior Developer',
        fte: 1.0,
        manager: 'manager-uid'
      };

      const result = JobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should resolve job aliases', () => {
      const jobWithAliases = {
        title: 'Senior Developer', // alias for role
        fte: 0.8,
        jefe: 'manager-uid' // Spanish alias for manager
      };

      const result = JobSchema.safeParse(jobWithAliases);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('Senior Developer');
        expect(result.data.manager).toBe('manager-uid');
      }
    });

    it('should validate FTE range', () => {
      const jobWithInvalidFte = {
        role: 'Developer',
        fte: 1.5 // Invalid: should be 0-1
      };

      const result = JobSchema.safeParse(jobWithInvalidFte);
      expect(result.success).toBe(false);
    });
  });

  describe('YCardSchema', () => {
    it('should validate a complete yCard document', () => {
      const validYCard = {
        people: [
          {
            uid: 'user1',
            name: 'Alice Smith',
            email: 'alice@example.com',
            title: 'Developer'
          },
          {
            uid: 'user2',
            nombre: 'Bob Johnson', // Spanish alias
            correo: 'bob@example.com', // Spanish alias
            puesto: 'Manager' // Spanish alias
          }
        ]
      };

      const result = YCardSchema.safeParse(validYCard);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.people).toHaveLength(2);
        expect(result.data.people[0].name).toBe('Alice Smith');
        expect(result.data.people[1].name).toBe('Bob Johnson'); // resolved from nombre
      }
    });
  });
});
