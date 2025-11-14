"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Code,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Copy,
} from "lucide-react";

type PageSize = "A4" | "Letter" | "Legal" | "A3";
type Orientation = "portrait" | "landscape";
type DisplayMode = "pretty" | "tree" | "table";

export default function JsonToPdf() {
  const [jsonText, setJsonText] = useState<string>("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("data");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Settings
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("pretty");
  const [fontSize, setFontSize] = useState<number>(10);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const validateAndParseJson = (text: string) => {
    if (!text.trim()) {
      setIsValid(true);
      setErrorMsg("");
      setParsedJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setParsedJson(parsed);
      setIsValid(true);
      setErrorMsg("");
    } catch (error: any) {
      setIsValid(false);
      setErrorMsg(error.message || "Invalid JSON");
      setParsedJson(null);
    }
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    validateAndParseJson(text);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    const validTypes = ["application/json", "text/plain"];
    const fileName = file.name.toLowerCase();
    
    if (!validTypes.includes(file.type) && !fileName.endsWith('.json')) {
      showToast("Please upload a valid JSON file");
      return;
    }

    try {
      const text = await file.text();
      setJsonText(text);
      validateAndParseJson(text);
      setFileName(file.name.replace(/\.json$/i, ""));
      showToast("JSON file loaded successfully");
    } catch (error) {
      showToast("Error reading file");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setJsonText(clipboardText);
      validateAndParseJson(clipboardText);
      showToast("JSON pasted from clipboard");
    } catch (error) {
      showToast("Unable to access clipboard");
    }
  };

  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setJsonText(formatted);
      showToast("JSON formatted");
    }
  };

  const minifyJson = () => {
    if (parsedJson) {
      const minified = JSON.stringify(parsedJson);
      setJsonText(minified);
      showToast("JSON minified");
    }
  };

  const clearAll = () => {
    setJsonText("");
    setParsedJson(null);
    setIsValid(true);
    setErrorMsg("");
    setFileName("data");
    showToast("Cleared");
  };

  // Convert JSON to formatted string for PDF
  const jsonToFormattedString = (obj: any, indent: number = 0): string[] => {
    const lines: string[] = [];
    const indentStr = "  ".repeat(indent);

    if (obj === null) {
      return [`${indentStr}null`];
    }

    if (typeof obj !== "object") {
      return [`${indentStr}${JSON.stringify(obj)}`];
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return [`${indentStr}[]`];
      }
      lines.push(`${indentStr}[`);
      obj.forEach((item, index) => {
        const itemLines = jsonToFormattedString(item, indent + 1);
        const lastLine = itemLines[itemLines.length - 1];
        itemLines[itemLines.length - 1] = lastLine + (index < obj.length - 1 ? "," : "");
        lines.push(...itemLines);
      });
      lines.push(`${indentStr}]`);
    } else {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return [`${indentStr}{}`];
      }
      lines.push(`${indentStr}{`);
      keys.forEach((key, index) => {
        const value = obj[key];
        const valueLines = jsonToFormattedString(value, indent + 1);
        valueLines[0] = `${indentStr}  "${key}": ${valueLines[0].trim()}`;
        const lastLine = valueLines[valueLines.length - 1];
        valueLines[valueLines.length - 1] = lastLine + (index < keys.length - 1 ? "," : "");
        lines.push(...valueLines);
      });
      lines.push(`${indentStr}}`);
    }

    return lines;
  };

  // Convert JSON array to table data
  const jsonArrayToTable = (arr: any[]): { headers: string[], rows: string[][] } => {
    if (arr.length === 0) return { headers: [], rows: [] };

    // Get all unique keys
    const keysSet = new Set<string>();
    arr.forEach(item => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        Object.keys(item).forEach(key => keysSet.add(key));
      }
    });

    const headers = Array.from(keysSet);
    const rows = arr.map(item => {
      return headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      });
    });

    return { headers, rows };
  };

  const pageDimensions: { [key: string]: { width: number; height: number } } = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
    A3: { width: 297, height: 420 },
  };

  const getPageDimensions = () => {
    let dimensions = pageDimensions[pageSize];
    if (orientation === "landscape") {
      return { width: dimensions.height, height: dimensions.width };
    }
    return dimensions;
  };

  const convertToPdf = async () => {
    if (!parsedJson) {
      showToast("Please enter valid JSON");
      return;
    }

    setConverting(true);

    try {
      showToast("Creating PDF...");

      const dimensions = getPageDimensions();
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize.toLowerCase() as any,
      });

      pdf.setFont("courier");
      pdf.setFontSize(fontSize);

      const margin = 15;
      const lineHeight = fontSize * 0.3527 * 1.2;
      let currentY = margin;

      // Add title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(fileName, margin, currentY);
      currentY += lineHeight * 2;

      // Add metadata if enabled
      if (includeMetadata) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100);
        
        const metadata: string[] = [];
        if (Array.isArray(parsedJson)) {
          metadata.push(`Type: Array (${parsedJson.length} items)`);
        } else if (typeof parsedJson === "object") {
          metadata.push(`Type: Object (${Object.keys(parsedJson).length} keys)`);
        } else {
          metadata.push(`Type: ${typeof parsedJson}`);
        }
        metadata.push(`Generated: ${new Date().toLocaleString()}`);
        
        metadata.forEach(line => {
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        });
        
        currentY += lineHeight;
        pdf.setTextColor(0);
      }

      pdf.setFont("courier");
      pdf.setFontSize(fontSize);

      // Generate content based on display mode
      let lines: string[] = [];

      if (displayMode === "table" && Array.isArray(parsedJson)) {
        // Table mode for arrays
        const { headers, rows } = jsonArrayToTable(parsedJson);
        
        if (headers.length > 0) {
          // Add headers
          lines.push(headers.join(" | "));
          lines.push(headers.map(h => "-".repeat(h.length)).join("-+-"));
          
          // Add rows
          rows.forEach(row => {
            lines.push(row.join(" | "));
          });
        } else {
          lines = jsonToFormattedString(parsedJson);
        }
      } else {
        // Pretty print mode
        lines = jsonToFormattedString(parsedJson);
      }

      // Add lines to PDF
      const maxWidth = dimensions.width - (margin * 2);
      
      for (const line of lines) {
        // Check if we need a new page
        if (currentY + lineHeight > dimensions.height - margin) {
          pdf.addPage();
          currentY = margin;
        }

        // Handle long lines (truncate or wrap)
        const textWidth = pdf.getTextWidth(line);
        if (textWidth > maxWidth) {
          // Truncate with ellipsis
          const truncated = line.substring(0, Math.floor(line.length * maxWidth / textWidth) - 3) + "...";
          pdf.text(truncated, margin, currentY);
        } else {
          pdf.text(line, margin, currentY);
        }
        
        currentY += lineHeight;
      }

      // Add page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          dimensions.width / 2,
          dimensions.height - 10,
          { align: "center" }
        );
      }

      // Save PDF
      pdf.save(`${fileName}.pdf`);
      showToast("PDF created successfully!");

    } catch (error) {
      console.error("Error creating PDF:", error);
      showToast("Error creating PDF. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const getJsonStats = () => {
    if (!parsedJson) return null;

    const stats: any = {};
    
    if (Array.isArray(parsedJson)) {
      stats.type = "Array";
      stats.length = parsedJson.length;
    } else if (typeof parsedJson === "object") {
      stats.type = "Object";
      stats.keys = Object.keys(parsedJson).length;
    } else {
      stats.type = typeof parsedJson;
    }

    const jsonStr = JSON.stringify(parsedJson);
    stats.characters = jsonStr.length;
    stats.size = (new Blob([jsonStr]).size / 1024).toFixed(2) + " KB";

    return stats;
  };

  const stats = getJsonStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex flex-col items-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Code className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            JSON to <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert JSON data to formatted PDF documents
          </p>
        </div>

        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap items-center gap-3">
            <label
              htmlFor="json-file-upload"
              className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload JSON
            </label>
            <input
              id="json-file-upload"
              type="file"
              accept=".json,application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            />

            <button
              onClick={pasteFromClipboard}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium"
            >
              Paste
            </button>

            <button
              onClick={formatJson}
              disabled={!parsedJson}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Format
            </button>

            <button
              onClick={minifyJson}
              disabled={!parsedJson}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Minify
            </button>

            <button
              onClick={clearAll}
              disabled={!jsonText}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Clear
            </button>

            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Document name"
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <EyeOff className="w-5 h-5 text-gray-700" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Validation Status */}
          {jsonText && (
            <div className={`rounded-xl p-4 border-2 ${
              isValid 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-3">
                {isValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Valid JSON</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your JSON is properly formatted and ready to convert
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Invalid JSON</p>
                      <p className="text-xs text-red-700 mt-1">{errorMsg}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* JSON Input - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">JSON Content</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {stats && (
                    <>
                      <span>{stats.characters} chars</span>
                      <span>•</span>
                      <span>{stats.size}</span>
                    </>
                  )}
                </div>
              </div>

              <textarea
                ref={textAreaRef}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{"name": "John", "age": 30, "city": "New York"}'
                className={`w-full h-[500px] px-4 py-3 rounded-lg border focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none font-mono text-sm ${
                  isValid ? "border-gray-300" : "border-red-300 bg-red-50"
                }`}
              />
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* PDF Settings */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as PageSize)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                      <option value="A3">A3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as Orientation)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Mode
                    </label>
                    <select
                      value={displayMode}
                      onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="pretty">Pretty Print</option>
                      <option value="table">Table (for arrays)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size: {fontSize}pt
                    </label>
                    <input
                      type="range"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="8"
                      max="14"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMetadata}
                        onChange={(e) => setIncludeMetadata(e.target.checked)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                      />
                      <span className="text-sm text-gray-700">Include metadata</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    JSON Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.type}</span>
                    </div>
                    {stats.length !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Items</span>
                        <span className="text-sm font-semibold text-orange-500">{stats.length}</span>
                      </div>
                    )}
                    {stats.keys !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Keys</span>
                        <span className="text-sm font-semibold text-orange-500">{stats.keys}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Characters</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.characters.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Size</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.size}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {showPreview && parsedJson && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto bg-gray-50">
                <pre className="text-xs font-mono text-gray-700">
                  {JSON.stringify(parsedJson, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <div className="flex gap-3">
            <button
              onClick={convertToPdf}
              disabled={converting || !isValid || !parsedJson}
              className="flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium z-50 animate-slideUp">
          {toastMsg}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}