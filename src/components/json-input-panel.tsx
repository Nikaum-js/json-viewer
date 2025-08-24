import { SimpleJsonEditor } from "@/components/simple-json-editor";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Braces, Clipboard, FileText, Github, Upload } from "lucide-react";
import { useRef } from "react";

interface JsonInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
  onUploadFile: (file: File) => void;
  onPaste: () => void;
}

export function JsonInputPanel({
  value,
  onChange,
  onLoadExample,
  onUploadFile,
  onPaste
}: JsonInputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      onUploadFile(file);
    } else if (file) {
      console.error('Please select a valid JSON file');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-card">
      {/* Main Application Header - Integrated */}
      <CardHeader className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="flex items-center justify-between py-2">
          {/* Left side - Logo, Title and Subtitle */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center">
              <Braces className="h-5 w-5 md:h-6 md:w-6 text-primary font-bold" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                JSON Viewer
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block font-medium">
                Visualizar • Analisar • Formatar
              </p>
            </div>
          </div>
          {/* Right side - Controls */}
          <TooltipProvider>
            <div className="flex items-center gap-1 md:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9"
                  >
                    <a
                      href="https://github.com/nikaum-js"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visitar GitHub</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeSwitcher />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alternar tema</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardHeader>
      {/* JSON Input Panel Header */}
      <CardHeader className="flex flex-row items-center justify-between py-3 px-8 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Editor</h2>
        </div>
        <div className="flex gap-1 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadExample}
            className="text-xs hidden sm:inline-flex"
          >
            Load Example
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onLoadExample}
            className="sm:hidden"
            title="Load Example"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="text-xs gap-1"
            title="Upload File"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPaste}
            className="text-xs gap-1"
            title="Paste from Clipboard"
          >
            <Clipboard className="h-4 w-4" />
            <span className="hidden sm:inline">Paste</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <SimpleJsonEditor
          value={value}
          onChange={onChange}
          placeholder="Paste your JSON here or use the buttons above..."
          className="h-full w-full border-0 rounded-none"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}