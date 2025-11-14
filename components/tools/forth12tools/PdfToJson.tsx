"use client";

import { useState, useRef } from "react";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Code,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Copy,
  Eye,
  Settings,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.394/pdf.worker.min.js";


if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

interface PageData {
  pageNumber: number;
  text: string;
  jsonData: any;
  selected: boolean;
}

type ConversionMode = "auto" | "table" | "text" | "keyvalue";
type OutputFormat = "pretty" | "compact";

export default function PdfToJson() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  
  // Settings
  const [conversionMode, setConversionMode] = useState<ConversionMode>("auto");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("pretty");
  const [combinePages, setCombinePages] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Try to parse text as JSON
  const tryParseJson = (text: string): any => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // Convert text to table structure (key-value pairs)
  const textToKeyValue = (text: string): any => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const result: any = {};

    for (const line of lines) {
      // Try to detect key-value patterns
      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch) {
        const key = colonMatch[1].trim();
        const value = colonMatch[2].trim();
        result[key] = value;
        continue;
      }

      const equalsMatch = line.match(/^([^=]+)=\s*(.+)$/);
      if (equalsMatch) {
        const key = equalsMatch[1].trim();
        const value = equalsMatch[2].trim();
        result[key] = value;
        continue;
      }

      // Try tab or multiple spaces separation
      const parts = line.split(/\t+|\s{2,}/).filter(p => p.trim());
      if (parts.length === 2) {
        result[parts[0].trim()] = parts[1].trim();
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  };

  // Convert text to table (array of objects)
  const textToTable = (text: string): any => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return null;

    // Try to detect table structure
    const rows: string[][] = [];
    
    for (const line of lines) {
      // Split by tabs or multiple spaces
      const cells = line
        .split(/\t+|\s{2,}/)
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length > 1) {
        rows.push(cells);
      }
    }

    if (rows.length < 2) return null;

    // Assume first row is headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Convert to array of objects
    const result = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });

    return result.length > 0 ? result : null;
  };

  // Auto-detect best conversion method
  const autoConvert = (text: string): any => {
    // Try to parse as JSON first
    const jsonData = tryParseJson(text);
    if (jsonData) return jsonData;

    // Try to detect table structure
    const tableData = textToTable(text);
    if (tableData) return tableData;

    // Try to detect key-value pairs
    const keyValueData = textToKeyValue(text);
    if (keyValueData) return keyValueData;

    // Fallback: return text content as object
    return {
      content: text,
      extractedFrom: "pdf",
      type: "text"
    };
  };

  const convertTextToJson = (text: string, mode: ConversionMode): any => {
    switch (mode) {
      case "auto":
        return autoConvert(text);
      case "table":
        return textToTable(text) || { error: "No table structure detected" };
      case "keyvalue":
        return textToKeyValue(text) || { error: "No key-value pairs detected" };
      case "text":
        return { text: text };
      default:
        return autoConvert(text);
    }
  };

  const extractPageData = async (page: any): Promise<PageData> => {
    const textContent = await page.getTextContent();
    
    // Extract text
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    // Convert to JSON based on mode
    const jsonData = convertTextToJson(text, conversionMode);

    return {
      pageNumber: page.pageNumber,
      text,
      jsonData,
      selected: true,
    };
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      
      showToast(`PDF loaded: ${pdf.numPages} pages`);

      // Extract data from all pages
      const pagesData: PageData[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const pageData = await extractPageData(page);
        pagesData.push(pageData);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(pagesData);
      showToast("Data extraction complete");

    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages(prev =>
      prev.map(page =>
        page.pageNumber === pageNumber ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setPages(prev => prev.map(page => ({ ...page, selected: newSelectAll })));
  };

  const getFormattedJson = (): string => {
    const selectedPages = pages.filter(page => page.selected);
    
    if (selectedPages.length === 0) return "";

    let result: any;

    if (combinePages) {
      // Combine all pages into one structure
      if (selectedPages.length === 1) {
        result = selectedPages[0].jsonData;
      } else {
        // Check if all pages have array data
        const allArrays = selectedPages.every(p => Array.isArray(p.jsonData));
        
        if (allArrays) {
          // Flatten all arrays
          result = selectedPages.flatMap(p => p.jsonData);
        } else {
          // Create object with page numbers as keys
          result = {};
          selectedPages.forEach(page => {
            result[`page_${page.pageNumber}`] = page.jsonData;
          });
        }
      }
    } else {
      // Keep pages separate as array
      result = selectedPages.map(page => ({
        page: page.pageNumber,
        data: page.jsonData
      }));
    }

    const indent = outputFormat === "pretty" ? 2 : 0;
    return JSON.stringify(result, null, indent);
  };

  const copyToClipboard = async () => {
    const json = getFormattedJson();
    
    if (!json) {
      showToast("No data to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      showToast("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy to clipboard");
    }
  };

  const downloadAsJson = () => {
    const json = getFormattedJson();
    
    if (!json) {
      showToast("No data to download");
      return;
    }

    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const fileName = pdfFile?.name.replace(".pdf", "") || "data";
    saveAs(blob, `${fileName}.json`);
    showToast("JSON file downloaded!");
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setPages([]);
    setProgress(0);
    setSelectAll(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSelectedCount = (): number => {
    return pages.filter(page => page.selected).length;
  };

  const getJsonSize = (): string => {
    const json = getFormattedJson();
    const size = new Blob([json]).size;
    return formatFileSize(size);
  };

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
            PDF to <span className="text-orange-500">JSON</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract data from PDF and convert to JSON format
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile ? (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files[0]);
              }}
            >
              <label
                htmlFor="pdf-upload"
                className="w-full p-8 sm:p-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl bg-white cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group"
              >
                <div className="p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-all duration-300">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                </div>
                <div className="text-center">
                  <span className="text-gray-900 text-base sm:text-lg font-medium block">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm mt-1 block">
                    PDF files only
                  </span>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Important Info Banner */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-900 font-medium mb-2">
                    PDF to JSON Conversion
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    This tool extracts text from PDF and attempts to convert it to JSON. Note:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Works best with PDFs containing JSON text</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Can extract tabular data to JSON arrays</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Detects key-value pairs automatically</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Complex layouts may not convert perfectly</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Requires text-based PDFs (not scanned images)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages
                  </p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
              >
                Change File
              </button>
            </div>

            {/* Loading Progress */}
            {loading && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                  <p className="text-gray-700 font-medium">Extracting and converting data...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-right">{progress}%</p>
              </div>
            )}

            {!loading && pages.length > 0 && (
              <>
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* JSON Display - Takes 2 columns */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Generated JSON</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                          title={showPreview ? "Hide JSON" : "Show JSON"}
                        >
                          <Eye className={`w-5 h-5 text-gray-700 ${!showPreview && 'opacity-50'}`} />
                        </button>
                      </div>
                    </div>

                    {showPreview && (
                      <>
                        <textarea
                          ref={textAreaRef}
                          value={getFormattedJson()}
                          readOnly
                          className="w-full h-[500px] px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 resize-none font-mono text-sm"
                        />

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{getFormattedJson().length} characters</span>
                            <span>•</span>
                            <span>{getJsonSize()}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={copyToClipboard}
                              disabled={!getFormattedJson()}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                            >
                              {copied ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Settings Sidebar */}
                  <div className="space-y-6">
                    {/* Conversion Settings */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Conversion Mode
                          </label>
                          <select
                            value={conversionMode}
                            onChange={(e) => setConversionMode(e.target.value as ConversionMode)}
                            disabled={true}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                          >
                            <option value="auto">Auto-detect</option>
                            <option value="table">Table</option>
                            <option value="keyvalue">Key-Value Pairs</option>
                            <option value="text">Plain Text</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Requires re-upload to change
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Format
                          </label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          >
                            <option value="pretty">Pretty (Indented)</option>
                            <option value="compact">Compact (Minified)</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={combinePages}
                              onChange={(e) => setCombinePages(e.target.checked)}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700">Combine all pages</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            Merge data from all pages into one structure
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Statistics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Pages</span>
                          <span className="text-sm font-semibold text-gray-900">{totalPages}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Selected</span>
                          <span className="text-sm font-semibold text-orange-500">{getSelectedCount()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">JSON Size</span>
                          <span className="text-sm font-semibold text-gray-900">{getJsonSize()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Characters</span>
                          <span className="text-sm font-semibold text-gray-900">{getFormattedJson().length.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pages Selection */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Pages ({getSelectedCount()} of {totalPages})
                    </h3>
                    <button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm"
                    >
                      {selectAll ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
                    {pages.map((page) => (
                      <button
                        key={page.pageNumber}
                        onClick={() => togglePageSelection(page.pageNumber)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          page.selected
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                        }`}
                      >
                        Page {page.pageNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversion Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Conversion Notes
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Auto-detect tries JSON parsing first, then table detection, then key-value pairs</li>
                        <li>• Table mode works best with tabular data (rows and columns)</li>
                        <li>• Key-Value mode extracts pairs separated by colons or equals signs</li>
                        <li>• Complex PDF layouts may not convert perfectly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={copyToClipboard}
                    disabled={getSelectedCount() === 0}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-orange-500 bg-white hover:bg-orange-50 text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    Copy JSON
                  </button>
                  <button
                    onClick={downloadAsJson}
                    disabled={getSelectedCount() === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download JSON
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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