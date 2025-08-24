import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMonacoConfig, type MonacoEditorConfig } from "@/hooks/use-monaco-config";
import { Code, Monitor, Palette, Settings, Type, Zap } from "lucide-react";
import { useState } from "react";

interface MonacoSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonacoSettings({ isOpen, onClose }: MonacoSettingsProps) {
  const { config, updateConfig, resetConfig } = useMonacoConfig();
  const [localRulers, setLocalRulers] = useState(config.rulers.join(', '));

  if (!isOpen) return null;

  const handleRulersChange = (value: string) => {
    setLocalRulers(value);
    const rulers = value
      .split(',')
      .map(r => parseInt(r.trim()))
      .filter(r => !isNaN(r) && r > 0);
    updateConfig({ rulers });
  };

  const fontOptions = [
    "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", 
    "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
    "'SF Mono', 'Monaco', 'Consolas', monospace",
    "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Monaco Editor Settings</CardTitle>
            <Badge variant="outline" className="text-xs">VS Code Style</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetConfig}>
              Reset to Defaults
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="typography" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="typography" className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="editing" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                Editing  
              </TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={config.fontFamily} 
                    onValueChange={(value) => updateConfig({ fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>
                            {font.split(',')[0].replace(/'/g, '')}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.fontLigatures}
                    onCheckedChange={(checked) => updateConfig({ fontLigatures: checked })}
                  />
                  <Label>Font Ligatures</Label>
                  <Badge variant="secondary" className="text-xs">== {'->'} ===</Badge>
                </div>

                <div className="space-y-2">
                  <Label>Font Size ({config.fontSize}px)</Label>
                  <Input
                    type="range"
                    min={10}
                    max={24}
                    value={config.fontSize}
                    onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Line Height ({config.lineHeight}px)</Label>
                  <Input
                    type="range"
                    min={14}
                    max={40}
                    value={config.lineHeight}
                    onChange={(e) => updateConfig({ lineHeight: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Editing Tab */}
            <TabsContent value="editing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tab Size ({config.tabSize})</Label>
                  <Select 
                    value={config.tabSize.toString()} 
                    onValueChange={(value) => updateConfig({ tabSize: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Auto Indent</Label>
                  <Select 
                    value={config.autoIndent} 
                    onValueChange={(value: any) => updateConfig({ autoIndent: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="keep">Keep</SelectItem>
                      <SelectItem value="brackets">Brackets</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'insertSpaces', label: 'Insert Spaces', desc: 'Use spaces instead of tabs' },
                    { key: 'detectIndentation', label: 'Detect Indentation', desc: 'Auto-detect tab/space usage' },
                    { key: 'trimAutoWhitespace', label: 'Trim Whitespace', desc: 'Remove trailing whitespace' },
                    { key: 'formatOnSave', label: 'Format on Save', desc: 'Auto-format when saving' },
                    { key: 'formatOnPaste', label: 'Format on Paste', desc: 'Auto-format pasted content' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label>{label}</Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={config[key as keyof MonacoEditorConfig] as boolean}
                        onCheckedChange={(checked) => updateConfig({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Visual Tab */}
            <TabsContent value="visual" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Line Highlight</Label>
                  <Select 
                    value={config.renderLineHighlight} 
                    onValueChange={(value: any) => updateConfig({ renderLineHighlight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="gutter">Gutter</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Render Whitespace</Label>
                  <Select 
                    value={config.renderWhitespace} 
                    onValueChange={(value: any) => updateConfig({ renderWhitespace: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="boundary">Boundary</SelectItem>
                      <SelectItem value="selection">Selection</SelectItem>
                      <SelectItem value="trailing">Trailing</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rulers (columns)</Label>
                  <Input
                    value={localRulers}
                    onChange={(e) => handleRulersChange(e.target.value)}
                    placeholder="80, 120"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated column numbers</p>
                </div>

                <div className="space-y-2">
                  <Label>Auto Closing Brackets</Label>
                  <Select 
                    value={config.autoClosingBrackets} 
                    onValueChange={(value: any) => updateConfig({ autoClosingBrackets: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="languageDefined">Language Defined</SelectItem>
                      <SelectItem value="beforeWhitespace">Before Whitespace</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cursor Blinking</Label>
                  <Select 
                    value={config.cursorBlinking} 
                    onValueChange={(value: any) => updateConfig({ cursorBlinking: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blink">Blink</SelectItem>
                      <SelectItem value="smooth">Smooth</SelectItem>
                      <SelectItem value="phase">Phase</SelectItem>
                      <SelectItem value="expand">Expand</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cursor Animation</Label>
                  <Select 
                    value={config.cursorSmoothCaretAnimation} 
                    onValueChange={(value: any) => updateConfig({ cursorSmoothCaretAnimation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="explicit">Explicit</SelectItem>
                      <SelectItem value="on">On</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Suggest Selection</Label>
                  <Select 
                    value={config.suggestSelection} 
                    onValueChange={(value: any) => updateConfig({ suggestSelection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First</SelectItem>
                      <SelectItem value="recentlyUsed">Recently Used</SelectItem>
                      <SelectItem value="recentlyUsedByPrefix">Recently Used by Prefix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'smoothScrolling', label: 'Smooth Scrolling', desc: 'Animate scrolling transitions' },
                    { key: 'acceptSuggestionOnCommitCharacter', label: 'Accept on Commit Char', desc: 'Accept suggestions with commit characters' },
                    { key: 'parameterHintsEnabled', label: 'Parameter Hints', desc: 'Show parameter hints while typing' },
                    { key: 'semanticHighlighting', label: 'Semantic Highlighting', desc: 'Enhanced syntax highlighting' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label>{label}</Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={config[key as keyof MonacoEditorConfig] as boolean}
                        onCheckedChange={(checked) => updateConfig({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Word Wrap</Label>
                  <Select 
                    value={config.wordWrap} 
                    onValueChange={(value: any) => updateConfig({ wordWrap: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="on">On</SelectItem>
                      <SelectItem value="wordWrapColumn">Word Wrap Column</SelectItem>
                      <SelectItem value="bounded">Bounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Folding Controls</Label>
                  <Select 
                    value={config.showFoldingControls} 
                    onValueChange={(value: any) => updateConfig({ showFoldingControls: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="mouseover">Mouse Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'minimapEnabled', label: 'Show Minimap', desc: 'Display code minimap' },
                    { key: 'scrollBeyondLastLine', label: 'Scroll Beyond Last Line', desc: 'Allow scrolling past document end' },
                    { key: 'folding', label: 'Code Folding', desc: 'Enable code folding functionality' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label>{label}</Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={config[key as keyof MonacoEditorConfig] as boolean}
                        onCheckedChange={(checked) => updateConfig({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bracket Pair Colorization</Label>
                    <p className="text-xs text-muted-foreground">Color matching brackets differently</p>
                  </div>
                  <Switch
                    checked={config.bracketPairColorization}
                    onCheckedChange={(checked) => updateConfig({ bracketPairColorization: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Indentation Guides</Label>
                  {[
                    { key: 'indentation', label: 'Show Indentation Lines', desc: 'Vertical lines showing indentation levels' },
                    { key: 'bracketPairs', label: 'Bracket Pair Guides', desc: 'Guides connecting bracket pairs' },
                    { key: 'bracketPairsHorizontal', label: 'Horizontal Bracket Guides', desc: 'Horizontal lines for bracket pairs' },
                    { key: 'highlightActiveIndentation', label: 'Highlight Active Indentation', desc: 'Highlight current indentation level' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">{label}</Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={config.guides[key as keyof typeof config.guides] as boolean}
                        onCheckedChange={(checked) => 
                          updateConfig({ 
                            guides: { 
                              ...config.guides, 
                              [key]: checked ? (key.includes('bracket') ? 'active' : true) : false 
                            } 
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}