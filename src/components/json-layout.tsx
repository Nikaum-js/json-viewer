import { useCallback, useMemo, useState } from "react";
import { JsonInputPanel } from "./json-input-panel";
import { JsonViewerPanel } from "./json-viewer-panel";
import { MobileTabs } from "./mobile-tabs";
import { useMediaQuery } from "@/hooks/use-media-query";

export function JsonLayout() {
  const [jsonInput, setJsonInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
  const [mobileActivePanel, setMobileActivePanel] = useState<'editor' | 'viewer'>('editor');
  
  // Mobile breakpoint detection (md: 768px)
  const isMobile = useMediaQuery('(max-width: 767px)');

  const parsedJson = useMemo(() => {
    if (!jsonInput.trim()) return null;
    
    try {
      return JSON.parse(jsonInput);
    } catch (error) {
      return { error: 'Invalid JSON format' };
    }
  }, [jsonInput]);

  const handleJsonInputChange = useCallback((value: string) => {
    setJsonInput(value);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleLoadExample = useCallback(() => {
    const exampleJson = {
      "users": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "active": true,
          "profile": {
            "age": 30,
            "city": "New York",
            "skills": ["JavaScript", "React", "TypeScript"]
          }
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com",
          "active": false,
          "profile": {
            "age": 25,
            "city": "Los Angeles",
            "skills": ["Python", "Django", "PostgreSQL"]
          }
        }
      ],
      "metadata": {
        "total": 2,
        "created": "2024-01-15T10:30:00Z",
        "version": "1.0"
      }
    };
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  }, []);

  const handleUploadFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      setJsonInput(text);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandAll(true);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandAll(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!jsonInput.trim()) return;
    
    try {
      const formatted = JSON.stringify(JSON.parse(jsonInput), null, 2);
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading JSON:', error);
    }
  }, [jsonInput]);

  const handleViewModeChange = useCallback((mode: 'tree' | 'graph') => {
    setViewMode(mode);
  }, []);

  const handleMobilePanelChange = useCallback((panel: 'editor' | 'viewer') => {
    setMobileActivePanel(panel);
  }, []);

  if (isMobile) {
    // Mobile: Single-pane layout with tabs
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile Navigation Tabs */}
        <MobileTabs 
          activePanel={mobileActivePanel}
          onPanelChange={handleMobilePanelChange}
        />
        
        {/* Active Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mobileActivePanel === 'editor' ? (
            <JsonInputPanel
              value={jsonInput}
              onChange={handleJsonInputChange}
              onLoadExample={handleLoadExample}
              onUploadFile={handleUploadFile}
              onPaste={handlePaste}
            />
          ) : (
            <JsonViewerPanel
              data={parsedJson}
              searchTerm={searchTerm}
              expandAll={expandAll}
              onSearchChange={handleSearchChange}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onDownload={handleDownload}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop: Side-by-side layout
  return (
    <div className="flex flex-row h-screen bg-background">
      {/* Left Panel - JSON Input */}
      <div className="w-2/5 h-full border-r border-border flex flex-col">
        <JsonInputPanel
          value={jsonInput}
          onChange={handleJsonInputChange}
          onLoadExample={handleLoadExample}
          onUploadFile={handleUploadFile}
          onPaste={handlePaste}
        />
      </div>
      
      {/* Right Panel - JSON Viewer */}
      <div className="flex-1 h-full flex flex-col">
        <JsonViewerPanel
          data={parsedJson}
          searchTerm={searchTerm}
          expandAll={expandAll}
          onSearchChange={handleSearchChange}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onDownload={handleDownload}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>
    </div>
  );
}