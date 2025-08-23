import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}


function getColorThemePalette(): { primary: string; secondary: string } {
  const theme = document.documentElement.getAttribute('data-color-theme') || 'orange';
  
  const palettes = {
    orange: { primary: '#e36209', secondary: '#f97516' },
    amber: { primary: '#d97706', secondary: '#f59e0b' },
    red: { primary: '#dc2626', secondary: '#ef4444' },
    rose: { primary: '#e11d48', secondary: '#f43f5e' },
    blue: { primary: '#2563eb', secondary: '#3b82f6' },
    emerald: { primary: '#059669', secondary: '#10b981' },
    violet: { primary: '#7c3aed', secondary: '#8b5cf6' },
    slate: { primary: '#475569', secondary: '#64748b' },
  };
  
  return palettes[theme as keyof typeof palettes] || palettes.orange;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function createCustomTheme(isDark: boolean): monaco.editor.IStandaloneThemeData {
  const colorPalette = getColorThemePalette();
  
  // Get actual theme colors from CSS variables
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  const parseHslValue = (property: string): { h: number; s: number; l: number } | null => {
    const value = style.getPropertyValue(property).trim();
    if (value) {
      // Handle "220 17% 93%" format
      const parts = value.replace(/%/g, '').split(/\s+/);
      if (parts.length >= 3) {
        return {
          h: parseInt(parts[0]) || 0,
          s: parseInt(parts[1]) || 0,
          l: parseInt(parts[2]) || 50
        };
      }
    }
    return null;
  };

  const backgroundHsl = parseHslValue('--background');
  const foregroundHsl = parseHslValue('--foreground');  
  const mutedHsl = parseHslValue('--muted-foreground');

  const baseColors = {
    background: backgroundHsl ? hslToHex(backgroundHsl.h, backgroundHsl.s, backgroundHsl.l) : (isDark ? '#0d1117' : '#ffffff'),
    foreground: foregroundHsl ? hslToHex(foregroundHsl.h, foregroundHsl.s, foregroundHsl.l) : (isDark ? '#e6edf3' : '#24292f'),
    primary: colorPalette.primary,
    secondary: colorPalette.secondary,
    muted: mutedHsl ? hslToHex(mutedHsl.h, mutedHsl.s, mutedHsl.l) : (isDark ? '#6e7681' : '#656d76'),
    selection: isDark ? '#264f78' : '#0969da'
  };

  // More detailed debugging
  console.group('🎨 Monaco Editor Theme Debug');
  console.log('Theme Detection:', {
    currentTheme: theme,
    isDark,
    colorTheme: document.documentElement.getAttribute('data-color-theme'),
    documentClasses: document.documentElement.className
  });
  
  console.log('CSS Variables Raw:', {
    background: style.getPropertyValue('--background'),
    foreground: style.getPropertyValue('--foreground'),
    primary: style.getPropertyValue('--primary'),
    mutedForeground: style.getPropertyValue('--muted-foreground')
  });
  
  console.log('Parsed HSL Values:', {
    backgroundHsl,
    foregroundHsl,
    mutedHsl
  });
  
  console.log('Final Monaco Colors:', baseColors);
  console.groupEnd();

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
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  console.log('JsonEditor rendered with theme:', theme);

  useEffect(() => {
    if (isEditorReady) {
      try {
        console.log('🔄 Applying Monaco theme...');
        const isDark = theme === 'dark' || theme === 'cyberpunk';
        const customTheme = createCustomTheme(isDark);
        monaco.editor.defineTheme('json-viewer-theme', customTheme);
        monaco.editor.setTheme('json-viewer-theme');
        console.log('✅ Monaco theme applied successfully');
      } catch (error) {
        console.error('❌ Error applying Monaco theme:', error);
        // Fallback to default theme
        monaco.editor.setTheme(theme === 'dark' || theme === 'cyberpunk' ? 'vs-dark' : 'vs');
      }
    } else {
      console.log('⏳ Monaco editor not ready yet...');
    }
  }, [theme, isEditorReady]);

  useEffect(() => {
    // Listen for color theme changes
    const observer = new MutationObserver(() => {
      if (isEditorReady) {
        try {
          const isDark = theme === 'dark' || theme === 'cyberpunk';
          const customTheme = createCustomTheme(isDark);
          monaco.editor.defineTheme('json-viewer-theme', customTheme);
          monaco.editor.setTheme('json-viewer-theme');
        } catch (error) {
          console.warn('Error applying Monaco theme on mutation:', error);
          // Fallback to default theme
          monaco.editor.setTheme(theme === 'dark' || theme === 'cyberpunk' ? 'vs-dark' : 'vs');
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-theme', 'class']
    });

    return () => observer.disconnect();
  }, [theme, isEditorReady]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure editor options
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

    // Add validation for JSON
    const model = editor.getModel();
    if (model) {
      const validateJson = () => {
        const content = model.getValue();
        if (!content.trim()) {
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

      // Validate on content change with debounce
      let validationTimeout: NodeJS.Timeout;
      model.onDidChangeContent(() => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validateJson, 500);
      });

      // Initial validation
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