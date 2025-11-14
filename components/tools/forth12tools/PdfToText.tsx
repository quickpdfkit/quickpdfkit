"use client";

import { useState, useRef } from "react";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Copy,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
  Settings,
  File,
} from "lucide-react";


import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Load pdf.js worker only in browser
if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

interface PageText {
  pageNumber: number;
  text: string;
  selected: boolean;
}

type OutputFormat = "plain" | "formatted";
type LineBreakStyle = "single" | "double" | "none";

export default function PdfToText() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PageText[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  
  // Settings
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("formatted");
  const [lineBreakStyle, setLineBreakStyle] = useState<LineBreakStyle>("double");
  const [includePageNumbers, setIncludePageNumbers] = useState(false);
  const [preserveSpacing, setPreserveSpacing] = useState(true);
  
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

  const extractTextFromPage = async (page: any): Promise<string> => {
    const textContent = await page.getTextContent();
    
    if (outputFormat === "plain") {
      // Simple concatenation
      return textContent.items
        .map((item: any) => item.str)
        .join(" ");
    } else {
      // Try to preserve formatting
      let text = "";
      let lastY = -1;
      
      for (const item of textContent.items) {
        const currentY = item.transform[5];
        
        // New line if Y position changed significantly
        if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
          text += "\n";
        }
        
        text += item.str + (preserveSpacing ? " " : "");
        lastY = currentY;
      }
      
      return text.trim();
    }
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

      // Extract text from all pages
      const pagesData: PageText[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await extractTextFromPage(page);
        
        pagesData.push({
          pageNumber: i,
          text,
          selected: true,
        });
        
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(pagesData);
      showToast("Text extraction complete");

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

  const getFormattedText = (): string => {
    const selectedPages = pages.filter(page => page.selected);
    
    if (selectedPages.length === 0) return "";

    let result = "";
    
    for (const page of selectedPages) {
      // Add page number if enabled
      if (includePageNumbers) {
        result += `\n--- Page ${page.pageNumber} ---\n\n`;
      }
      
      // Add page text
      result += page.text;
      
      // Add line breaks between pages
      if (lineBreakStyle === "double") {
        result += "\n\n";
      } else if (lineBreakStyle === "single") {
        result += "\n";
      }
    }
    
    return result.trim();
  };

  const copyToClipboard = async () => {
    const text = getFormattedText();
    
    if (!text) {
      showToast("No text to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Text copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy to clipboard");
    }
  };

  const downloadAsText = () => {
    const text = getFormattedText();
    
    if (!text) {
      showToast("No text to download");
      return;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const fileName = pdfFile?.name.replace(".pdf", "") || "document";
    saveAs(blob, `${fileName}.txt`);
    showToast("Text file downloaded!");
  };

  const selectText = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      showToast("Text selected");
    }
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

  const getCharCount = (): number => {
    return getFormattedText().length;
  };

  const getWordCount = (): number => {
    const text = getFormattedText();
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getLineCount = (): number => {
    return getFormattedText().split('\n').length;
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
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            PDF to <span className="text-orange-500">Text</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract text content from PDF documents
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile ? (
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
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100">
                  <File className="w-6 h-6 text-orange-500" />
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
                  <p className="text-gray-700 font-medium">Extracting text from PDF...</p>
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
                  {/* Text Display - Takes 2 columns */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                          title={showPreview ? "Hide text" : "Show text"}
                        >
                          {showPreview ? (
                            <EyeOff className="w-5 h-5 text-gray-700" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-700" />
                          )}
                        </button>
                      </div>
                    </div>

                    {showPreview && (
                      <>
                        <textarea
                          ref={textAreaRef}
                          value={getFormattedText()}
                          readOnly
                          className="w-full h-[500px] px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 resize-none font-mono text-sm"
                        />

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{getCharCount()} characters</span>
                            <span>•</span>
                            <span>{getWordCount()} words</span>
                            <span>•</span>
                            <span>{getLineCount()} lines</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={selectText}
                              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-all"
                            >
                              Select All
                            </button>
                            <button
                              onClick={copyToClipboard}
                              disabled={!getFormattedText()}
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
                    {/* Extraction Settings */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Format
                          </label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                            disabled={true}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                          >
                            <option value="formatted">Formatted</option>
                            <option value="plain">Plain</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Requires re-upload to change
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Page Breaks
                          </label>
                          <select
                            value={lineBreakStyle}
                            onChange={(e) => setLineBreakStyle(e.target.value as LineBreakStyle)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          >
                            <option value="double">Double Line Break</option>
                            <option value="single">Single Line Break</option>
                            <option value="none">No Break</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includePageNumbers}
                              onChange={(e) => setIncludePageNumbers(e.target.checked)}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700">Include page numbers</span>
                          </label>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preserveSpacing}
                              onChange={(e) => setPreserveSpacing(e.target.checked)}
                              disabled={true}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-500">Preserve spacing</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            Requires re-upload
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
                          <span className="text-sm text-gray-600">Characters</span>
                          <span className="text-sm font-semibold text-gray-900">{getCharCount().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Words</span>
                          <span className="text-sm font-semibold text-gray-900">{getWordCount().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Lines</span>
                          <span className="text-sm font-semibold text-gray-900">{getLineCount().toLocaleString()}</span>
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
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={downloadAsText}
                    disabled={getSelectedCount() === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download as TXT
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