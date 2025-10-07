
import { useState } from 'react';

const exampleYCard = `# Example yCard\npeople:\n  - uid: user-001\n    name: Alice\n    surname: Smith\n    title: Engineer\n    org: ExampleCorp\n    email: alice.smith@example.com\n    phone:\n      - number: \"+1-555-1234\"\n        type: work\n    address:\n      street: \"123 Main St\"\n      city: \"Metropolis\"\n      state: \"CA\"\n      postal_code: \"90210\"\n      country: \"USA\"\n`;
import MonacoEditor from '@monaco-editor/react';
import { validateYCard, ycardFields } from './ycardValidation';
import yaml from 'js-yaml';
import './App.css';

import { yCardPersonToVCard } from '../../src/npm/converters';
import { stringifyVCard } from '../../src/npm/parsers/vcard';

// Simple card component for yCard/person
function YCardPersonCard({ person, darkMode }) {
  if (!person) return null;
  
  // Function to download person data as vCard (.vcf)
  const handleDownload = () => {
    // Use existing converter functions
    const vCardObject = yCardPersonToVCard(person);
    const vcfContent = stringifyVCard([vCardObject]);
    
    // Download the file
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${person.name || person.nombre || 'person'}_${person.surname || person.apellido || 'card'}.vcf`;
    link.download = filename.replace(/\s+/g, '_');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div style={{
      background: darkMode ? '#23272e' : '#fff',
      color: darkMode ? '#ffd700' : '#222',
      border: '1px solid #bbb',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '1rem',
      marginBottom: '1rem',
      maxWidth: 350,
      fontSize: 16,
    }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{person.name || person.nombre || 'No Name'} {person.surname || person.apellido || ''}</div>
      {person.title && <div style={{ fontStyle: 'italic', marginBottom: 4 }}>{person.title}</div>}
      {person.org && <div style={{ marginBottom: 4 }}>Org: {person.org}</div>}
      {person.email && <div style={{ marginBottom: 4 }}>Email: {Array.isArray(person.email) ? person.email.join(', ') : person.email}</div>}
      {person.phone && <div style={{ marginBottom: 4 }}>Phone: {Array.isArray(person.phone) ? person.phone.map(p => typeof p === 'string' ? p : p.number).join(', ') : typeof person.phone === 'string' ? person.phone : person.phone.number}</div>}
      {person.address && <div style={{ marginBottom: 4 }}>
        Address: {[person.address.street, person.address.city, person.address.state, person.address.postal_code, person.address.country].filter(Boolean).join(', ')}
      </div>}
      {person.manager && <div style={{ marginBottom: 4 }}>Manager: {person.manager}</div>}
      {person.jobs && Array.isArray(person.jobs) && person.jobs.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          Jobs:
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {person.jobs.map((job, i) => <li key={i}>{job.role || job.title || 'No Role'} {job.org && `@ ${job.org}`}</li>)}
          </ul>
        </div>
      )}
      <button
        onClick={handleDownload}
        style={{
          marginTop: '0.75rem',
          background: darkMode ? '#ffd700' : '#007bff',
          color: darkMode ? '#23272e' : '#fff',
          border: 'none',
          padding: '0.5em 1em',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 14,
          width: '100%',
          outline: darkMode ? '2px solid #ffd700' : '2px solid #007bff'
        }}
        tabIndex={0}
      >
         Download Card
      </button>
    </div>
  );
}

function App() {
  const [code, setCode] = useState('// Type your yCard or vCard here...');
  const [lspOutput, setLspOutput] = useState('LSP output will appear here.');
  const [cardData, setCardData] = useState(null);
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(prefersDark);

  // Real validation handler
  const handleEditorChange = (value) => {
    setCode(value);
    let parsed = null;
    try {
      parsed = yaml.load(value);
    } catch {}
    setCardData(parsed);
    const errors = validateYCard(value, yaml);
    if (errors.length === 0) {
      setLspOutput('No errors. yCard is valid!');
    } else {
      setLspOutput(errors.map((e, i) => `Error ${i + 1}: ${e}`).join('\n'));
    }
  };

  // Register completion provider for yCard fields using Monaco's onMount
  const handleEditorMount = (editor, monacoInstance) => {
    monacoInstance.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: () => {
        const suggestions = ycardFields.map(field => ({
          label: field,
          kind: monacoInstance.languages.CompletionItemKind.Field,
          insertText: field + ': ',
        }));
        return { suggestions };
      },
    });
  };

  // ADA-compliant dark mode colors
  const darkBg = '#23272e'; // not pure black
  const darkPanel = '#2c313a';
  const darkText = '#f4f6fb'; // off-white
  const darkAccent = '#ffd700'; // high-contrast accent

  return (
    <div className={`editor-layout${darkMode ? ' dark-mode' : ''}`} style={darkMode ? { background: darkBg, color: darkText } : {}}>
      <div className="editor-main" style={darkMode ? { background: darkPanel, color: darkText } : {}}>
        <div style={{ padding: '1rem', background: darkMode ? darkBg : '#f0f4fa', borderBottom: '1px solid #eee', color: darkMode ? darkText : undefined }}>
          <h1 style={darkMode ? { color: darkAccent } : {}}>yCard Playground</h1>
          <p>
            Type or paste your <b>yCard</b> or <b>vCard</b> YAML in the editor below.<br />
            Use the side panel to see diagnostics and LSP features.<br />
            <button
              style={{ marginTop: '0.5rem', background: darkMode ? darkAccent : '#007bff', color: darkMode ? '#23272e' : '#fff', border: 'none', padding: '0.5em 1em', borderRadius: 4, outline: '2px solid #222', fontWeight: 600 }}
              onClick={() => handleEditorChange(exampleYCard)}
              tabIndex={0}
            >
              Load Example
            </button>
            <button
              style={{ marginLeft: '1em', background: darkMode ? darkPanel : '#eee', color: darkMode ? darkAccent : '#222', border: '1px solid #888', padding: '0.5em 1em', borderRadius: 4, outline: '2px solid #222', fontWeight: 600 }}
              onClick={() => setDarkMode(!darkMode)}
              tabIndex={0}
              aria-pressed={darkMode}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </p>
          <p>
            <a href="https://github.com/mieweb/yCard" target="_blank" rel="noopener noreferrer" style={darkMode ? { color: darkAccent, textDecoration: 'underline' } : {}}>
              View on GitHub
            </a>
          </p>
        </div>
        <MonacoEditor
          height="calc(100vh - 120px)"
          width="100%"
          defaultLanguage="yaml"
          value={code}
          onChange={handleEditorChange}
          theme={darkMode ? 'vs-dark' : 'light'}
          options={{ fontSize: 16, minimap: { enabled: false } }}
          onMount={handleEditorMount}
        />
      </div>
      <div className="editor-sidepanel" style={darkMode ? { background: darkPanel, color: darkText, borderLeft: '1px solid #444' } : {}}>
        <h2 style={darkMode ? { color: darkAccent } : {}}>LSP Panel</h2>
        <pre style={{ whiteSpace: 'pre-wrap', color: darkMode ? darkText : undefined }}>{lspOutput}</pre>
        {cardData && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={darkMode ? { color: darkAccent } : {}}>Preview Card</h2>
            {Array.isArray(cardData.people)
              ? cardData.people.map((person, idx) => <YCardPersonCard key={idx} person={person} darkMode={darkMode} />)
              : (cardData.uid || cardData.name || cardData.surname)
                ? <YCardPersonCard person={cardData} darkMode={darkMode} />
                : <div style={{ color: '#888' }}>No person data to preview.</div>
            }
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
