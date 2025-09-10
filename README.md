# yCard
ycard: A internationalized yaml version of iCard and x500 ldap for humans

**yCard** is a human-friendly YAML format for representing **people, org charts, and contacts**.  
It bridges the worlds of **vCard/iCard**, **LDAP/LDIF/X.500**, and modern YAML/JSON workflows —  
with support for **aliases**, **internationalization (i18n)**, and even **multi-hat roles**.

---

## ✨ Why yCard?

- **Readable**: YAML with natural field names (`name`, `email`, `manager`).
- **Compatible**: Bridges to LDAP (`cn`, `sn`, `mail`), vCard (`FN`, `EMAIL`, `TITLE`), CSV, LDIF.
- **Flexible**: Supports "multi-hat" people (jobs array) and dotted-line reporting.
- **Internationalized**: Aliases and i18n fields (`nombre`, `apellido`, `上司`) are supported.
- **Validated**: Zod schema + OpenAPI, with an LSP that checks as you type.
- **Versionable**: Easy to keep in Git and track org changes.

---

## 🚀 Quick Example

### Single-hat person
```yaml
people:
  - uid: alice
    name: "Alice Smith"       # alias → cn
    surname: "Smith"          # alias → sn
    title: "Chief Executive Officer"
    manager: null             # root of org
    email: "alice@example.com"
    org: "Acme Corp"
    org_unit: "Executive"
```

### Multi-hat person

```yaml
people:
  - uid: jordan
    name: "Jordan Kim"
    email: "jordan@example.com"
    org: "Acme Corp"

    jobs:
      - role: "Head of Developer Relations"
        fte: 0.5
        manager: bob
        dotted: [eve]
        org_unit: "Engineering"
        primary: true

      - title: "PM, Platform"
        fte: 0.5
        manager: victor
        dotted: []
        org_unit: "Product"
        primary: false
```

---

## 🌍 Internationalization Example

```yaml
people:
  - uid: bob
    nombre: "Bob Johnson"     # alias for cn (es)
    apellido: "Johnson"       # alias for sn (es)
    puesto: "VP de Ingeniería"
    jefe: alice               # alias for manager (es)
    correo: "bob@example.com" # alias for mail
    org: "Acme Corp"

    i18n:
      displayName:
        en: "Bob Johnson"
        es: "Roberto Johnson"
        ja: "ボブ・ジョンソン"
      title:
        en: "VP of Engineering"
        es: "VP de Ingeniería"
        ja: "エンジニアリング担当副社長"
```

---

## 🔄 Export Bridges

* **yCard → vCard**

  ```vcf
  BEGIN:VCARD
  VERSION:4.0
  UID:jordan
  FN:Jordan Kim
  EMAIL;type=work:jordan@example.com
  TITLE:Head of Developer Relations
  ORG:Acme Corp;Engineering
  X-FTE:0.5
  X-MANAGER-UID:bob
  X-DOTTED-UID:eve
  TITLE:PM, Platform
  ORG:Acme Corp;Product
  X-FTE:0.5
  X-MANAGER-UID:victor
  END:VCARD
  ```

* **yCard → LDIF**

  ```ldif
  dn: uid=alice,ou=People,dc=example,dc=com
  objectClass: inetOrgPerson
  cn: Alice Smith
  sn: Smith
  mail: alice@example.com
  title: Chief Executive Officer
  ```

* **yCard → CSV**

  ```csv
  uid,title,manager,org,org_unit
  alice,Chief Executive Officer,,Acme Corp,Executive
  bob,VP of Engineering,alice,Acme Corp,Engineering
  jordan,Head of Developer Relations,bob,Acme Corp,Engineering
  jordan,PM, Platform,victor,Acme Corp,Product
  ```

---

## 🛠️ Tooling

* **Validation**: `zod` schema validates canonical yCard; aliases are normalized.
* **OpenAPI**: generate an API from the Zod schema (`/normalize`, `/validate`, `/export`).
* **Parser**: YAML → canonical JSON → Tree-sitter nodes for LSP.
* **LSP**:

  * Inline diagnostics (missing fields, unknown uids, cycles).
  * Quick fixes (replace alias with canonical, scaffold missing person).
  * Hover → show spec mappings (LDAP/vCard).

---

## 📂 Repo Layout

```
docs/           # Spec & mappings
packages/
  zod-model/    # Zod schema + normalizer
  openapi/      # OpenAPI generator
  parser/       # Reference parser (YAML + Zod)
  tree-sitter/  # Grammar for yCard
  lsp/          # Stub language server
examples/       # Sample yCard files
conformance/    # Valid & invalid fixtures
```

---

## ✅ Roadmap

* [ ] Spec draft with mapping tables
* [ ] Zod schema + alias normalizer
* [ ] Tree-sitter grammar
* [ ] LSP diagnostics + quick fixes
* [ ] Exporters (vCard, LDIF, CSV)

---

## 🤝 Contributing

* Write new examples in `examples/` (use aliases or i18n!)
* Add edge cases in `conformance/invalid/`
* File issues for missing aliases in other languages

---

**yCard = YAML for People.**
Simple for humans. Powerful for systems.


## the chat
https://chatgpt.com/share/68c10e2e-1858-8004-824c-a8d2cd006305
