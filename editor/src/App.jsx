
import { useState } from 'react';

const exampleYCard = `# Example yCard\npeople:\n  - uid: user-001\n    name: Alice\n    surname: Smith\n    title: Engineer\n    org: ExampleCorp\n    email: alice.smith@example.com\n    phone:\n      - number: \"+1-555-1234\"\n        type: work\n    address:\n      street: \"123 Main St\"\n      city: \"Metropolis\"\n      state: \"CA\"\n      postal_code: \"90210\"\n      country: \"USA\"\n`;
import MonacoEditor from '@monaco-editor/react';
import { validateYCard, ycardFields } from './ycardValidation';
import yaml from 'js-yaml';
import './App.css';

function App() {
  const [code, setCode] = useState('// Type your yCard or vCard here...');
  const [lspOutput, setLspOutput] = useState('LSP output will appear here.');
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(prefersDark);

  // Real validation handler
  const handleEditorChange = (value) => {
    setCode(value);
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
      </div>
    </div>
  );
}

export default App;
