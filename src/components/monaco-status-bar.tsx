import { Code, FileText, Hash, Indent, Languages, MousePointerClick } from "lucide-react";
import { useEffect, useState } from "react";
import * as monaco from "monaco-editor";

interface MonacoStatusBarProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  onLanguageClick?: () => void;
  onIndentationClick?: () => void;
}

interface StatusInfo {
  line: number;
  column: number;
  selection: {
    text: string;
    lineCount: number;
    charCount: number;
    hasSelection: boolean;
  };
  language: string;
  encoding: string;
  lineEnding: string;
  indentation: string;
  totalLines: number;
  characters: number;
}

export function MonacoStatusBar({ 
  editor, 
  onLanguageClick, 
  onIndentationClick 
}: MonacoStatusBarProps) {
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({
    line: 1,
    column: 1,
    selection: {
      text: '',
      lineCount: 0,
      charCount: 0,
      hasSelection: false
    },
    language: 'JSON',
    encoding: 'UTF-8',
    lineEnding: 'LF',
    indentation: 'Spaces: 2',
    totalLines: 1,
    characters: 0
  });

  useEffect(() => {
    if (!editor) return;

    const updateStatusInfo = () => {
      const model = editor.getModel();
      if (!model) return;
      
      const position = editor.getPosition();
      const selection = editor.getSelection();
      const content = model.getValue();
      
      // Detect indentation
      const lines = content.split('\n');
      let indentationType = 'Spaces: 2';
      
      for (const line of lines) {
        if (line.trim() && (line.startsWith(' ') || line.startsWith('\t'))) {
          if (line.startsWith('\t')) {
            indentationType = 'Tab Size: 4';
            break;
          } else {
            const spaces = line.match(/^(\s+)/)?.[1].length || 2;
            indentationType = `Spaces: ${spaces}`;
            break;
          }
        }
      }
      
      // Selection info
      let selectionInfo = {
        text: '',
        lineCount: 0,
        charCount: 0,
        hasSelection: false
      };
      
      if (selection && !selection.isEmpty()) {
        const selectedText = model.getValueInRange(selection);
        const lineCount = Math.abs(selection.endLineNumber - selection.startLineNumber) + 1;
        const charCount = selectedText.length;
        
        // Create responsive selection text
        let text = '';
        if (lineCount > 1) {
          text = `${lineCount} lines, ${charCount} chars`;
        } else {
          text = `${charCount} chars`;
        }
        
        selectionInfo = {
          text,
          lineCount,
          charCount,
          hasSelection: true
        };
      }
      
      // Line ending detection
      const hasCarriageReturn = content.includes('\r\n');
      const lineEnding = hasCarriageReturn ? 'CRLF' : 'LF';
      
      setStatusInfo({
        line: position?.lineNumber || 1,
        column: position?.column || 1,
        selection: selectionInfo,
        language: model.getLanguageId().toUpperCase() || 'JSON',
        encoding: 'UTF-8',
        lineEnding,
        indentation: indentationType,
        totalLines: model.getLineCount(),
        characters: content.length
      });
    };
    
    // Initial update
    updateStatusInfo();
    
    // Listen to events
    const disposables = [
      editor.onDidChangeCursorPosition(updateStatusInfo),
      editor.onDidChangeCursorSelection(updateStatusInfo),
      editor.onDidChangeModel(updateStatusInfo)
    ];
    
    const model = editor.getModel();
    if (model) {
      disposables.push(model.onDidChangeContent(updateStatusInfo));
    }
    
    return () => {
      disposables.forEach(disposable => disposable.dispose());
    };
  }, [editor]);


  // Responsive selection text
  const getSelectionText = (selection: StatusInfo['selection'], breakpoint: 'desktop' | 'tablet' | 'mobile') => {
    if (!selection.hasSelection) return '';
    
    switch (breakpoint) {
      case 'desktop':
        return selection.lineCount > 1 
          ? `${selection.lineCount} lines, ${selection.charCount} chars selected`
          : `${selection.charCount} chars selected`;
      case 'tablet':
        return selection.lineCount > 1 
          ? `${selection.lineCount} lines selected`
          : `${selection.charCount} chars selected`;
      case 'mobile':
        return selection.lineCount > 1 
          ? `${selection.lineCount} sel`
          : `${selection.charCount}`;
      default:
        return selection.text;
    }
  };

  return (
    <div className="h-6 bg-muted/30 border-t border-border flex items-center justify-between w-full px-2 text-[10px] font-mono overflow-hidden">
      {/* LEFT SECTION - Always visible (Critical) */}
      <div className="flex items-center flex-shrink-0 gap-2">
        <span className="text-muted-foreground whitespace-nowrap">
          <Hash className="inline h-3 w-3 mr-1" />
          Ln {statusInfo.line}, Col {statusInfo.column}
        </span>
        <span className="text-muted-foreground">|</span>
        <span 
          className="text-muted-foreground hover:text-foreground cursor-pointer whitespace-nowrap"
          onClick={onLanguageClick}
        >
          <Languages className="inline h-3 w-3 mr-1" />
          {statusInfo.language}
        </span>
      </div>

      {/* CENTER SECTION - Selection (Flexible with truncate) */}
      <div className="flex-1 flex items-center justify-center min-w-0 mx-4">
        {statusInfo.selection.hasSelection && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center text-muted-foreground min-w-0">
              <MousePointerClick className="h-3 w-3 mr-1 flex-shrink-0" />
              {/* Desktop */}
              <span className="hidden lg:block truncate">
                {getSelectionText(statusInfo.selection, 'desktop')}
              </span>
              {/* Tablet */}
              <span className="hidden sm:block lg:hidden truncate">
                {getSelectionText(statusInfo.selection, 'tablet')}
              </span>
              {/* Mobile */}
              <span className="block sm:hidden truncate">
                {getSelectionText(statusInfo.selection, 'mobile')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION - Optional Info */}
      <div className="flex items-center flex-shrink-0 gap-2">
        {/* Always show total lines */}
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground whitespace-nowrap">
          <Code className="inline h-3 w-3 mr-1" />
          {statusInfo.totalLines} lines
        </span>

        {/* Indentation - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span 
            className="text-muted-foreground hover:text-foreground cursor-pointer whitespace-nowrap"
            onClick={onIndentationClick}
          >
            <Indent className="inline h-3 w-3 mr-1" />
            {statusInfo.indentation}
          </span>
        </div>

        {/* Encoding - Hidden on tablet and mobile */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground whitespace-nowrap">
            <FileText className="inline h-3 w-3 mr-1" />
            {statusInfo.encoding}
          </span>
        </div>

        {/* Line Ending - Hidden except desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground whitespace-nowrap">
            {statusInfo.lineEnding}
          </span>
        </div>

        {/* Characters - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground whitespace-nowrap">
            {statusInfo.characters.toLocaleString()} chars
          </span>
        </div>
      </div>
    </div>
  );
}