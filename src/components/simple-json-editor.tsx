import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";
import { useMonacoConfig } from "@/hooks/use-monaco-config";
import { MonacoSettings } from "./monaco-settings";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";

interface SimpleJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}


export function SimpleJsonEditor({ value, onChange, className }: SimpleJsonEditorProps) {
  const { theme } = useTheme();
  const { config, getMonacoOptions } = useMonacoConfig();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [statusInfo, setStatusInfo] = useState({
    line: 1,
    column: 1,
    characters: 0,
    lines: 1,
    selection: '',
    jsonValid: true,
    language: 'JSON'
  });

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
    // Enhanced JSON Language Configuration
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: 'error',
      enableSchemaRequest: true,
      schemaRequest: 'warning'
    });

    // Custom JSON completion provider for better suggestions
    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: '"string"',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:value}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'String value'
          },
          {
            label: 'number',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '${1:0}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Number value'
          },
          {
            label: 'boolean',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '${1|true,false|}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Boolean value (true/false)'
          },
          {
            label: 'null',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: 'null',
            documentation: 'Null value'
          },
          {
            label: 'object',
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: '{\n  "${1:key}": "${2:value}"\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'JSON object'
          },
          {
            label: 'array',
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: '[\n  "${1:item}"\n]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'JSON array'
          }
        ];
        return { suggestions };
      }
    });

    // Enhanced hover provider with JSON path information
    monaco.languages.registerHoverProvider('json', {
      provideHover: (model: any, position: any) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;
        
        const lineContent = model.getLineContent(position.lineNumber);
        const isKey = lineContent.includes(`"${word.word}":`);
        const isStringValue = lineContent.includes(`"${word.word}"`) && !isKey;
        
        let contents = [];
        
        if (isKey) {
          contents.push({ value: `**JSON Key**: \`${word.word}\`` });
          contents.push({ value: 'This is a JSON object property key' });
        } else if (isStringValue) {
          contents.push({ value: `**JSON String Value**: \`${word.word}\`` });
          contents.push({ value: `Length: ${word.word.length} characters` });
        } else if (!isNaN(Number(word.word))) {
          contents.push({ value: `**JSON Number**: \`${word.word}\`` });
          const num = Number(word.word);
          contents.push({ value: `Type: ${Number.isInteger(num) ? 'Integer' : 'Float'}` });
        }
        
        return contents.length > 0 ? { contents } : null;
      }
    });

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
        'editor.background': '#2A3040',
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
          'editor.background': '#2A3040',
          'editor.foreground': getCSSColor('--foreground'),
          'editorLineNumber.foreground': getCSSColor('--muted-foreground'),
          'editorCursor.foreground': getCSSColor('--primary'),
          'editor.selectionBackground': getCSSColor('--accent') + '40',
          'editor.lineHighlightBackground': getCSSColor('--accent') + '20',
          'editorBracketMatch.background': getCSSColor('--accent') + '40',
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
    
    // Status bar information tracking
    const updateStatusInfo = () => {
      const model = editor.getModel();
      if (!model) return;
      
      const position = editor.getPosition();
      const selection = editor.getSelection();
      const content = model.getValue();
      
      let jsonValid = true;
      try {
        if (content.trim()) {
          JSON.parse(content);
        }
      } catch (e) {
        jsonValid = false;
      }
      
      setStatusInfo({
        line: position?.lineNumber || 1,
        column: position?.column || 1,
        characters: content.length,
        lines: model.getLineCount(),
        selection: selection && !selection.isEmpty() 
          ? `${Math.abs(selection.endLineNumber - selection.startLineNumber) + 1} lines, ${model.getValueInRange(selection).length} chars`
          : '',
        jsonValid,
        language: 'JSON'
      });
    };
    
    // Update status on cursor position change
    editor.onDidChangeCursorPosition(updateStatusInfo);
    
    // Update status on selection change
    editor.onDidChangeCursorSelection(updateStatusInfo);
    
    // Update status on content change
    editor.getModel()?.onDidChangeContent(() => {
      setTimeout(updateStatusInfo, 100); // Small delay for performance
    });
    
    // Initial status update
    updateStatusInfo();

    // Apply VS Code-style configuration
    const monacoOptions = getMonacoOptions();
    editor.updateOptions({
      ...monacoOptions,
      // Keep existing Monaco-specific settings
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      automaticLayout: true,
      wordWrapColumn: 120,
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      unfoldOnClickAfterEndOfLine: true,
      matchBrackets: 'always',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      quickSuggestionsDelay: 100,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      snippetSuggestions: 'inline',
      wordBasedSuggestions: 'currentDocument',
      glyphMargin: true,
      cursorStyle: 'line',
      cursorWidth: 2,
      hideCursorInOverviewRuler: false,
      codeLens: false // JSON doesn't typically need code lens
    });
    
    // Add JSON validation with enhanced error reporting
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
          let position = { lineNumber: 1, column: 1 };
          
          // Enhanced error position detection
          const positionMatch = errorMessage.match(/at position (\d+)/);
          if (positionMatch) {
            const pos = parseInt(positionMatch[1]);
            position = model.getPositionAt(pos);
          }
          
          // More detailed error messages
          let enhancedMessage = errorMessage;
          if (errorMessage.includes('Unexpected token')) {
            enhancedMessage += ' - Check for missing commas, quotes, or brackets';
          } else if (errorMessage.includes('Unexpected end')) {
            enhancedMessage += ' - JSON appears to be incomplete';
          }
          
          monaco.editor.setModelMarkers(model, 'json', [{
            severity: monaco.MarkerSeverity.Error,
            message: enhancedMessage,
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column + 1
          }]);
        }
      };

      // Debounced validation for better performance
      let validationTimeout: NodeJS.Timeout;
      model.onDidChangeContent(() => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validateJson, 300);
      });

      // Initial validation
      validateJson();
    }
  };

  // Debounced change handler for better performance
  const handleEditorChange = useCallback(
    debounce((value: string | undefined) => {
      onChange(value || '');
    }, 300),
    [onChange]
  );

  // Setup keyboard shortcuts and commands
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      const editor = editorRef.current;
      
      // Apply latest configuration when config changes
      const monacoOptions = getMonacoOptions();
      editor.updateOptions({
        ...monacoOptions,
        // Keep existing Monaco-specific settings
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        automaticLayout: true,
        wordWrapColumn: 120,
        mouseWheelScrollSensitivity: 1,
        fastScrollSensitivity: 5,
        foldingStrategy: 'indentation',
        foldingHighlight: true,
        unfoldOnClickAfterEndOfLine: true,
        matchBrackets: 'always',
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true
        },
        quickSuggestionsDelay: 100,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        snippetSuggestions: 'inline',
        wordBasedSuggestions: 'currentDocument',
        glyphMargin: true,
        cursorStyle: 'line',
        cursorWidth: 2,
        hideCursorInOverviewRuler: false,
        codeLens: false
      });
      
      // Custom keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
        if (config.formatOnSave) {
          // Format JSON
          const model = editor.getModel();
          if (model) {
            try {
              const value = model.getValue();
              if (value.trim()) {
                const formatted = JSON.stringify(JSON.parse(value), null, config.tabSize);
                model.setValue(formatted);
              }
            } catch (e) {
              console.warn('Cannot format invalid JSON');
            }
          }
        }
      });
      
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
        // Compress JSON (minify)
        const model = editor.getModel();
        if (model) {
          try {
            const value = model.getValue();
            if (value.trim()) {
              const compressed = JSON.stringify(JSON.parse(value));
              model.setValue(compressed);
            }
          } catch (e) {
            console.warn('Cannot compress invalid JSON');
          }
        }
      });
      
      // Settings shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Comma, () => {
        setShowSettings(true);
      });
      
      // Enhanced find widget
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        editor.getAction('actions.find')?.run();
      });
      
      // Replace widget
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
        editor.getAction('editor.action.startFindReplaceAction')?.run();
      });
      
      // Toggle fold all
      if (config.folding) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft, () => {
          editor.getAction('editor.foldAll')?.run();
        });
        
        // Toggle unfold all
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight, () => {
          editor.getAction('editor.unfoldAll')?.run();
        });
      }
    }
  }, [isEditorReady, config, getMonacoOptions]);

  // Debounce utility function
  function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  return (
    <div className={`relative ${className} flex flex-col`}>
      {/* Settings Button */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => setShowSettings(true)}
          className="opacity-50 hover:opacity-100 transition-opacity p-2 h-8 w-8"
          title="Editor Settings (Ctrl+,)"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex-1 relative">
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
      
      {/* Enhanced Status Bar */}
      <div className="h-6 bg-muted/30 border-t border-border px-3 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-4">
          <span>Ln {statusInfo.line}, Col {statusInfo.column}</span>
          {statusInfo.selection && (
            <span>({statusInfo.selection})</span>
          )}
          <span>{statusInfo.characters} chars</span>
          <span>{statusInfo.lines} lines</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={statusInfo.jsonValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {statusInfo.jsonValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
          </span>
          <span>{statusInfo.language}</span>
          <span className="opacity-75">Font: {config.fontFamily.split(',')[0].replace(/'/g, '')}</span>
          <span className="opacity-75">{config.fontSize}px</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-4 px-2 text-xs opacity-75 hover:opacity-100"
          >
            Settings
          </Button>
        </div>
      </div>
      
      {/* Monaco Settings Modal */}
      <MonacoSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}