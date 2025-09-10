import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult
} from 'vscode-languageserver/node';

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

import { YCardParser } from './parser';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true
      },
      // Tell the client that this server supports hover.
      hoverProvider: true,
      // Tell the client that this server supports diagnostics.
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      }
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);

  const parser = new YCardParser();
  const text = textDocument.getText();
  const validationResult = parser.parse(text);

  const diagnostics: Diagnostic[] = [];

  if (!validationResult.success) {
    for (const error of validationResult.errors) {
      for (const issue of error.errors) {
        const diagnostic: Diagnostic = {
          severity: DiagnosticSeverity.Error,
          range: {
            start: textDocument.positionAt(0),
            end: textDocument.positionAt(text.length)
          },
          message: issue.message,
          source: 'yCard'
        };
        if (hasDiagnosticRelatedInformationCapability) {
          diagnostic.relatedInformation = [
            {
              location: {
                uri: textDocument.uri,
                range: Object.assign({}, diagnostic.range)
              },
              message: 'yCard validation error'
            }
          ];
        }
        diagnostics.push(diagnostic);
      }
    }
  }

  // Send the computed diagnostics to VS Code.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VS Code
  connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we get the
    // same completion items everywhere.
    return [
      // Core fields
      { label: 'uid', kind: CompletionItemKind.Field, data: 1 },
      { label: 'name', kind: CompletionItemKind.Field, data: 2 },
      { label: 'surname', kind: CompletionItemKind.Field, data: 3 },
      { label: 'title', kind: CompletionItemKind.Field, data: 4 },
      { label: 'email', kind: CompletionItemKind.Field, data: 5 },
      { label: 'org', kind: CompletionItemKind.Field, data: 6 },
      { label: 'org_unit', kind: CompletionItemKind.Field, data: 7 },
      { label: 'manager', kind: CompletionItemKind.Field, data: 8 },
      { label: 'phone', kind: CompletionItemKind.Field, data: 9 },
      { label: 'address', kind: CompletionItemKind.Field, data: 10 },
      { label: 'jobs', kind: CompletionItemKind.Field, data: 11 },
      { label: 'i18n', kind: CompletionItemKind.Field, data: 12 },

      // Aliases
      { label: 'id', kind: CompletionItemKind.Field, data: 13 },
      { label: 'nombre', kind: CompletionItemKind.Field, data: 14 },
      { label: 'apellido', kind: CompletionItemKind.Field, data: 15 },
      { label: 'puesto', kind: CompletionItemKind.Field, data: 16 },
      { label: 'correo', kind: CompletionItemKind.Field, data: 17 },
      { label: 'jefe', kind: CompletionItemKind.Field, data: 18 },
      { label: '上司', kind: CompletionItemKind.Field, data: 19 },
      { label: 'displayName', kind: CompletionItemKind.Field, data: 20 },
      { label: 'lastName', kind: CompletionItemKind.Field, data: 21 },
      { label: 'role', kind: CompletionItemKind.Field, data: 22 },
      { label: 'mail', kind: CompletionItemKind.Field, data: 23 },
      { label: 'organization', kind: CompletionItemKind.Field, data: 24 },
      { label: 'company', kind: CompletionItemKind.Field, data: 25 },
      { label: 'department', kind: CompletionItemKind.Field, data: 26 },
      { label: 'ou', kind: CompletionItemKind.Field, data: 27 },
      { label: 'boss', kind: CompletionItemKind.Field, data: 28 },
      { label: 'tel', kind: CompletionItemKind.Field, data: 29 },
      { label: 'adr', kind: CompletionItemKind.Field, data: 30 },
      { label: 'sn', kind: CompletionItemKind.Field, data: 31 },
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    switch (item.data) {
      case 1:
        item.detail = 'Unique identifier';
        item.documentation = 'A unique identifier for the person';
        break;
      case 2:
        item.detail = 'Full name';
        item.documentation = 'The full name of the person';
        break;
      case 3:
        item.detail = 'Surname/Family name';
        item.documentation = 'The person\'s surname or family name';
        break;
      case 4:
        item.detail = 'Job title';
        item.documentation = 'The person\'s job title or position';
        break;
      case 5:
        item.detail = 'Email address';
        item.documentation = 'Email address for contact (string or array)';
        break;
      case 6:
        item.detail = 'Organization';
        item.documentation = 'The organization the person belongs to';
        break;
      case 7:
        item.detail = 'Organizational unit';
        item.documentation = 'Department or organizational unit';
        break;
      case 8:
        item.detail = 'Manager';
        item.documentation = 'UID of the person\'s manager';
        break;
      case 9:
        item.detail = 'Phone numbers';
        item.documentation = 'Array of phone numbers (string or object format)';
        break;
      case 10:
        item.detail = 'Address';
        item.documentation = 'Physical address information';
        break;
      case 11:
        item.detail = 'Jobs';
        item.documentation = 'Array of job positions for multi-hat roles';
        break;
      case 12:
        item.detail = 'Internationalization';
        item.documentation = 'Internationalized versions of fields by language code';
        break;
      case 13:
        item.detail = 'ID (alias for uid)';
        item.documentation = 'Alternative identifier for the person';
        break;
      case 14:
        item.detail = 'Nombre (Spanish alias for name)';
        item.documentation = 'Spanish: Full name of the person';
        break;
      case 15:
        item.detail = 'Apellido (Spanish alias for surname)';
        item.documentation = 'Spanish: Surname or family name';
        break;
      case 16:
        item.detail = 'Puesto (Spanish alias for title)';
        item.documentation = 'Spanish: Job title or position';
        break;
      case 17:
        item.detail = 'Correo (Spanish alias for email)';
        item.documentation = 'Spanish: Email address';
        break;
      case 18:
        item.detail = 'Jefe (Spanish alias for manager)';
        item.documentation = 'Spanish: Manager\'s UID';
        break;
      case 19:
        item.detail = '上司 (Japanese alias for manager)';
        item.documentation = 'Japanese: Manager\'s UID';
        break;
      case 20:
        item.detail = 'Display name';
        item.documentation = 'Alternative display name format';
        break;
      case 21:
        item.detail = 'Last name (alias for surname)';
        item.documentation = 'Alternative for surname';
        break;
      case 22:
        item.detail = 'Role (alias for title)';
        item.documentation = 'Alternative for job title';
        break;
      case 23:
        item.detail = 'Mail (LDAP alias for email)';
        item.documentation = 'LDAP-style email field';
        break;
      case 24:
        item.detail = 'Organization (alias for org)';
        item.documentation = 'Alternative for organization';
        break;
      case 25:
        item.detail = 'Company (alias for org)';
        item.documentation = 'Alternative for organization';
        break;
      case 26:
        item.detail = 'Department (alias for org_unit)';
        item.documentation = 'Alternative for organizational unit';
        break;
      case 27:
        item.detail = 'OU (LDAP alias for org_unit)';
        item.documentation = 'LDAP-style organizational unit';
        break;
      case 28:
        item.detail = 'Boss (alias for manager)';
        item.documentation = 'Alternative for manager';
        break;
      case 29:
        item.detail = 'Tel (LDAP alias for phone)';
        item.documentation = 'LDAP-style phone field';
        break;
      case 30:
        item.detail = 'ADR (LDAP alias for address)';
        item.documentation = 'LDAP-style address field';
        break;
      case 31:
        item.detail = 'SN (LDAP alias for surname)';
        item.documentation = 'LDAP-style surname field';
        break;
    }
    return item;
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
