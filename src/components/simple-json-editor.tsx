import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";

interface SimpleJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleJsonEditor({ value, onChange, placeholder, className }: SimpleJsonEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();

  // Função para converter HSL para HEX
  const hslToHex = (hslString: string): string => {
    const values = hslString.split(/\s+/);
    if (values.length < 3) return '#ffffff';
    
    const h = parseInt(values[0]) / 360;
    const s = parseInt(values[1]) / 100;
    const l = parseInt(values[2]) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  };

  // Função para obter cor CSS em hex
  const getCSSColor = (property: string): string => {
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    return hslToHex(cssValue);
  };

  const handleBeforeMount = (monaco: any) => {
    // Cyberpunk Theme - Neon colors with purple/magenta/cyan palette
    monaco.editor.defineTheme('cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.value.json', foreground: '00ffff' },           // Cyan for string values
        { token: 'string.key.json', foreground: 'ff0080' },            // Hot pink for keys
        { token: 'number', foreground: 'ff00ff' },                     // Magenta for numbers
        { token: 'keyword.json', foreground: '9d4edd' },               // Purple for true/false/null
        { token: 'comment', foreground: '808080' },                    // Gray for comments
        { token: 'delimiter.bracket', foreground: '00ff80' },          // Bright green for []
        { token: 'delimiter.curly', foreground: 'ff4081' },            // Pink for {}
        { token: 'delimiter.comma', foreground: 'e0e0e0' },            // Light for commas
        { token: 'delimiter.colon', foreground: 'ffd700' },            // Gold for colons
        { token: 'string', foreground: '00ffff' },                     // Fallback string color
        { token: 'delimiter', foreground: '00ff80' },                  // Fallback delimiter
      ],
      colors: {
        'editor.background': '#1E1E3F',
        'editor.foreground': '#e0c3fc',
        'editorLineNumber.foreground': '#805ad5',
        'editorCursor.foreground': '#ff00ff',
        'editor.selectionBackground': '#4a1a5c',
        'editor.lineHighlightBackground': '#2A2A4F',
        'editorBracketMatch.background': '#ff008040',
        'editorBracketMatch.border': '#ff0080',
      }
    });

    // Light Theme - Warm orange/brown palette with good contrast
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'string.value.json', foreground: 'd97706' },          // Orange for string values
        { token: 'string.key.json', foreground: '92400e' },            // Dark orange for keys
        { token: 'number', foreground: 'dc2626' },                     // Red for numbers
        { token: 'keyword.json', foreground: '059669' },               // Green for true/false/null
        { token: 'comment', foreground: '6b7280' },                    // Gray for comments
        { token: 'delimiter.bracket', foreground: '7c3aed' },          // Purple for []
        { token: 'delimiter.curly', foreground: 'db2777' },            // Pink for {}
        { token: 'delimiter.comma', foreground: '374151' },            // Dark gray for commas
        { token: 'delimiter.colon', foreground: '1f2937' },            // Very dark for colons
        { token: 'string', foreground: 'd97706' },                     // Fallback string color
        { token: 'delimiter', foreground: '7c3aed' },                  // Fallback delimiter
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#262626',
        'editorLineNumber.foreground': '#6b7280',
        'editorCursor.foreground': '#d97706',
        'editor.selectionBackground': '#fef3c7',
        'editor.lineHighlightBackground': '#fffbeb',
        'editorBracketMatch.background': '#fef3c740',
        'editorBracketMatch.border': '#d97706',
      }
    });

    // Dark Theme - Vibrant orange palette with good dark contrast  
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark', 
      inherit: true,
      rules: [
        { token: 'string.value.json', foreground: 'fbbf24' },          // Bright yellow for string values
        { token: 'string.key.json', foreground: 'f97316' },            // Orange for keys
        { token: 'number', foreground: 'ef4444' },                     // Red for numbers
        { token: 'keyword.json', foreground: '10b981' },               // Green for true/false/null
        { token: 'comment', foreground: '9ca3af' },                    // Light gray for comments
        { token: 'delimiter.bracket', foreground: 'a855f7' },          // Purple for []
        { token: 'delimiter.curly', foreground: 'ec4899' },            // Pink for {}
        { token: 'delimiter.comma', foreground: 'd1d5db' },            // Light gray for commas
        { token: 'delimiter.colon', foreground: 'e5e7eb' },            // Very light for colons
        { token: 'string', foreground: 'fbbf24' },                     // Fallback string color
        { token: 'delimiter', foreground: 'a855f7' },                  // Fallback delimiter
      ],
      colors: {
        'editor.background': '#0c0c0e',
        'editor.foreground': '#e5e7eb',
        'editorLineNumber.foreground': '#9ca3af',
        'editorCursor.foreground': '#f97316',
        'editor.selectionBackground': '#374151',
        'editor.lineHighlightBackground': '#1f2937',
        'editorBracketMatch.background': '#f9731640',
        'editorBracketMatch.border': '#f97316',
      }
    });
  };
  
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      // Redefinir temas com cores atuais das variáveis CSS
      
      // Light Theme - usando variáveis CSS
      monaco.editor.defineTheme('custom-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'string.value.json', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'string.key.json', foreground: getCSSColor('--json-key').substring(1) },
          { token: 'number', foreground: getCSSColor('--json-number').substring(1) },
          { token: 'keyword.json', foreground: getCSSColor('--json-boolean').substring(1) },
          { token: 'comment', foreground: getCSSColor('--muted-foreground').substring(1) },
          { token: 'delimiter.bracket', foreground: getCSSColor('--chart-2').substring(1) },
          { token: 'delimiter.curly', foreground: getCSSColor('--json-bracket').substring(1) },
          { token: 'delimiter.comma', foreground: getCSSColor('--json-punctuation').substring(1) },
          { token: 'delimiter.colon', foreground: getCSSColor('--muted-foreground').substring(1) },
          { token: 'string', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'delimiter', foreground: getCSSColor('--json-bracket').substring(1) },
        ],
        colors: {
          'editor.background': getCSSColor('--background'),
          'editor.foreground': getCSSColor('--foreground'),
          'editorLineNumber.foreground': getCSSColor('--muted-foreground'),
          'editorCursor.foreground': getCSSColor('--primary'),
          'editor.selectionBackground': getCSSColor('--accent'),
          'editor.lineHighlightBackground': getCSSColor('--muted'),
          'editorBracketMatch.background': getCSSColor('--accent'),
          'editorBracketMatch.border': getCSSColor('--primary'),
        }
      });

      // Dark Theme - usando variáveis CSS  
      monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark', 
        inherit: true,
        rules: [
          { token: 'string.value.json', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'string.key.json', foreground: getCSSColor('--json-key').substring(1) },
          { token: 'number', foreground: getCSSColor('--json-number').substring(1) },
          { token: 'keyword.json', foreground: getCSSColor('--json-boolean').substring(1) },
          { token: 'comment', foreground: getCSSColor('--muted-foreground').substring(1) },
          { token: 'delimiter.bracket', foreground: getCSSColor('--chart-2').substring(1) },
          { token: 'delimiter.curly', foreground: getCSSColor('--json-bracket').substring(1) },
          { token: 'delimiter.comma', foreground: getCSSColor('--json-punctuation').substring(1) },
          { token: 'delimiter.colon', foreground: getCSSColor('--muted-foreground').substring(1) },
          { token: 'string', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'delimiter', foreground: getCSSColor('--json-bracket').substring(1) },
        ],
        colors: {
          'editor.background': getCSSColor('--background'),
          'editor.foreground': getCSSColor('--foreground'),
          'editorLineNumber.foreground': getCSSColor('--muted-foreground'),
          'editorCursor.foreground': getCSSColor('--primary'),
          'editor.selectionBackground': getCSSColor('--accent'),
          'editor.lineHighlightBackground': getCSSColor('--muted'),
          'editorBracketMatch.background': getCSSColor('--accent'),
          'editorBracketMatch.border': getCSSColor('--primary'),
        }
      });

      // Cyberpunk Theme - usando variáveis CSS cyberpunk
      monaco.editor.defineTheme('cyberpunk', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string.value.json', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'string.key.json', foreground: getCSSColor('--json-key').substring(1) },
          { token: 'number', foreground: getCSSColor('--json-number').substring(1) },
          { token: 'keyword.json', foreground: getCSSColor('--json-boolean').substring(1) },
          { token: 'comment', foreground: getCSSColor('--muted-foreground').substring(1) },
          { token: 'delimiter.bracket', foreground: getCSSColor('--chart-4').substring(1) },
          { token: 'delimiter.curly', foreground: getCSSColor('--json-bracket').substring(1) },
          { token: 'delimiter.comma', foreground: getCSSColor('--json-punctuation').substring(1) },
          { token: 'delimiter.colon', foreground: getCSSColor('--accent').substring(1) },
          { token: 'string', foreground: getCSSColor('--json-string').substring(1) },
          { token: 'delimiter', foreground: getCSSColor('--json-bracket').substring(1) },
        ],
        colors: {
          'editor.background': '#1E1E3F',
          'editor.foreground': getCSSColor('--foreground'),
          'editorLineNumber.foreground': getCSSColor('--muted-foreground'),
          'editorCursor.foreground': getCSSColor('--primary'),
          'editor.selectionBackground': getCSSColor('--accent') + '40',
          'editor.lineHighlightBackground': '#2A2A4F',
          'editorBracketMatch.background': getCSSColor('--accent') + '40',
          'editorBracketMatch.border': getCSSColor('--primary'),
        }
      });
      
      const getMonacoTheme = () => {
        switch (effectiveTheme) {
          case 'cyberpunk': return 'cyberpunk';
          case 'dark': return 'custom-dark';
          default: return 'custom-light';
        }
      };
      
      monaco.editor.setTheme(getMonacoTheme());
    }
  }, [theme, effectiveTheme, isEditorReady]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    setIsEditorReady(true);

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
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        theme={effectiveTheme === 'cyberpunk' ? 'cyberpunk' : effectiveTheme === 'dark' ? 'custom-dark' : 'custom-light'}
        options={{
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