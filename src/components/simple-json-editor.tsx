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

  // Simple theme detection
  const isDarkMode = theme === 'dark' || theme === 'cyberpunk';
  
  // Force Monaco to use CSS background
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      const editor = editorRef.current;
      const domNode = editor.getDomNode();
      
      if (domNode) {
        // Force background color from CSS
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
        if (bgColor) {
          // Parse "0 0% 100%" to "hsl(0, 0%, 100%)"
          const parts = bgColor.split(/\s+/);
          if (parts.length >= 3) {
            const hslColor = `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
            domNode.style.backgroundColor = hslColor;
            console.log('🎨 Forced Monaco background to:', hslColor);
          }
        }
      }
    }
  }, [isEditorReady, theme]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (isEditorReady && editorRef.current) {
        const domNode = editorRef.current.getDomNode();
        if (domNode) {
          const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
          if (bgColor) {
            const parts = bgColor.split(/\s+/);
            if (parts.length >= 3) {
              const hslColor = `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
              domNode.style.backgroundColor = hslColor;
              console.log('🔄 Updated Monaco background to:', hslColor);
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-theme', 'class']
    });

    return () => observer.disconnect();
  }, [isEditorReady]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    console.log('📝 Monaco Editor mounted');
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
        theme={isDarkMode ? 'vs-dark' : 'vs'}
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