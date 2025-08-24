import Editor, { loader } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";

// ---
// Configuração do loader para carregar apenas o essencial de um CDN.
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs',
  },
});
// ---

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Funções de tema movidas para fora do componente para evitar recriação
function getPrimaryColor(): string {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  const primaryValue = style.getPropertyValue('--primary').trim();
  
  if (primaryValue && primaryValue.startsWith('#')) {
    return primaryValue;
  }
  
  return '#d87943';
}

function createCustomTheme(isDark: boolean): any {
  const primaryColor = getPrimaryColor();
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  const getHexColor = (property: string): string => {
    const value = style.getPropertyValue(property).trim();
    if (value && value.startsWith('#')) {
      return value;
    }
    return '';
  };

  const backgroundColor = getHexColor('--background');
  const foregroundColor = getHexColor('--foreground');
  const mutedColor = getHexColor('--muted-foreground');
  
  const baseColors = {
    background: backgroundColor || (isDark ? '#121113' : '#ffffff'),
    foreground: foregroundColor || (isDark ? '#c1c1c1' : '#111827'),
    primary: primaryColor,
    muted: mutedColor || (isDark ? '#888888' : '#6b7280'),
    selection: isDark ? '#264f78' : '#0969da'
  };

  return {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      { token: 'string.value.json', foreground: isDark ? '9ecbff' : '0550ae' },
      { token: 'number.json', foreground: baseColors.primary.replace('#', '') },
      { token: 'keyword.json', foreground: isDark ? 'ff7b72' : 'cf222e' },
      { token: 'string.key.json', foreground: baseColors.foreground.replace('#', ''), fontStyle: 'bold' },
      { token: 'delimiter.bracket.json', foreground: baseColors.primary.replace('#', ''), fontStyle: 'bold' },
      { token: 'delimiter.array.json', foreground: baseColors.primary.replace('#', ''), fontStyle: 'bold' },
      { token: 'delimiter.colon.json', foreground: baseColors.muted.replace('#', '') },
      { token: 'delimiter.comma.json', foreground: baseColors.muted.replace('#', '') },
    ],
    colors: {
      'editor.background': baseColors.background,
      'editor.foreground': baseColors.foreground,
      'editor.lineHighlightBackground': baseColors.background === '#ffffff' ? '#f8f9fa' : 
                                        baseColors.background === '#1e1e1e' ? '#2d2d2d' : 
                                        baseColors.background + '40',
      'editor.selectionBackground': baseColors.primary + '40',
      'editor.inactiveSelectionBackground': baseColors.primary + '20',
      'editorLineNumber.foreground': baseColors.muted,
      'editorLineNumber.activeForeground': baseColors.foreground,
      'editorCursor.foreground': baseColors.primary,
      'editorWidget.background': baseColors.background,
      'editorWidget.border': baseColors.muted + '40',
    }
  };
}

export function JsonEditor({ value, onChange, placeholder, className }: JsonEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  // Salvamos a instância do Monaco para poder usá-la em outros lugares
  const [monacoInstance, setMonacoInstance] = useState<any | null>(null);

  // UseEffect para aplicar o tema quando o editor e o tema estiverem prontos
  useEffect(() => {
    if (isEditorReady && monacoInstance) {
      try {
        const isDark = theme === 'dark' || theme === 'cyberpunk';
        const customTheme = createCustomTheme(isDark);
        // Usamos a instância salva para definir o tema
        monacoInstance.editor.defineTheme('json-viewer-theme', customTheme);
        monacoInstance.editor.setTheme('json-viewer-theme');
      } catch (error) {
        console.warn('Error applying Monaco theme:', error);
        monacoInstance.editor.setTheme(theme === 'dark' || theme === 'cyberpunk' ? 'vs-dark' : 'vs');
      }
    }
  }, [theme, isEditorReady, monacoInstance]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (isEditorReady && monacoInstance) {
        try {
          const isDark = theme === 'dark' || theme === 'cyberpunk';
          const customTheme = createCustomTheme(isDark);
          monacoInstance.editor.defineTheme('json-viewer-theme', customTheme);
          monacoInstance.editor.setTheme('json-viewer-theme');
        } catch (error) {
          console.warn('Error applying Monaco theme on mutation:', error);
          monacoInstance.editor.setTheme(theme === 'dark' || theme === 'cyberpunk' ? 'vs-dark' : 'vs');
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [theme, isEditorReady, monacoInstance]);

  // A função onMount agora nos dá o objeto monaco como segundo argumento.
  // Salvamos a instância e a usamos em vez do import global.
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setMonacoInstance(monaco); // Salva a instância do monaco no estado
    setIsEditorReady(true);

    // Otimização: define o validador de JSON uma única vez.
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [],
      enableSchemaRequest: true,
    });
    
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true,
      },
    });

    // Adiciona validação para JSON
    const model = editor.getModel();
    if (model) {
      const validateJson = () => {
        const content = model.getValue();
        if (!content.trim()) {
          // Usa a instância monaco passada pelo onMount
          monaco.editor.setModelMarkers(model, 'json', []);
          return;
        }

        try {
          JSON.parse(content);
          monaco.editor.setModelMarkers(model, 'json', []);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
          const match = errorMessage.match(/at position (\d+)/);
          const position = match ? parseInt(match[1]) : 0;
          const pos = model.getPositionAt(position);
          
          monaco.editor.setModelMarkers(model, 'json', [{
            severity: monaco.MarkerSeverity.Error,
            message: errorMessage,
            startLineNumber: pos.lineNumber,
            startColumn: pos.column,
            endLineNumber: pos.lineNumber,
            endColumn: pos.column + 1
          }]);
        }
      };

      let validationTimeout: NodeJS.Timeout;
      model.onDidChangeContent(() => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validateJson, 500);
      });

      validateJson();
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className={`relative ${className}`}>
      <Editor
        height="100%"
        defaultLanguage="json"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="json-viewer-theme"
        options={{
          placeholder: placeholder || 'Paste your JSON here...',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
        }}
      />
    </div>
  );
}