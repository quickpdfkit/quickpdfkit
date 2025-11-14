"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  File,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Table as TableIcon,
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
  tableData: string[][];
  selected: boolean;
}

type ExtractionMode = "text" | "table";

export default function PdfToExcel() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>("table");
  const [showPreview, setShowPreview] = useState(true);
  const [selectAll, setSelectAll] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Simple table detection - looks for patterns in text
  const detectTableStructure = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const tableData: string[][] = [];

    // Try to detect columns by looking for consistent spacing or tabs
    for (const line of lines) {
      // Split by multiple spaces (2 or more) or tabs
      const cells = line
        .split(/\s{2,}|\t/)
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);

      if (cells.length > 1) {
        tableData.push(cells);
      } else if (cells.length === 1 && cells[0].includes('|')) {
        // Handle pipe-separated tables
        const pipeCells = cells[0].split('|').map(c => c.trim()).filter(c => c.length > 0);
        if (pipeCells.length > 1) {
          tableData.push(pipeCells);
        }
      } else if (cells.length === 1 && cells[0].includes(',')) {
        // Handle comma-separated data
        const commaCells = cells[0].split(',').map(c => c.trim());
        if (commaCells.length > 1) {
          tableData.push(commaCells);
        }
      } else {
        // Single cell row
        tableData.push(cells);
      }
    }

    // If no table structure detected, create single column
    if (tableData.length === 0) {
      return lines.map(line => [line]);
    }

    return tableData;
  };

  // Convert text to simple rows
  const textToRows = (text: string): string[][] => {
    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => [line.trim()]);
  };

  const extractPageData = async (page: any): Promise<PageData> => {
    const textContent = await page.getTextContent();
    
    // Extract text
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    // Detect table structure
    const tableData = extractionMode === "table" 
      ? detectTableStructure(text)
      : textToRows(text);

    return {
      pageNumber: page.pageNumber,
      text,
      tableData,
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

  const convertToExcel = async () => {
    const selectedPages = pages.filter(page => page.selected);

    if (selectedPages.length === 0) {
      showToast("Please select at least one page");
      return;
    }

    setConverting(true);

    try {
      showToast("Creating Excel file...");

      const workbook = XLSX.utils.book_new();

      // Add each selected page as a separate sheet
      for (const page of selectedPages) {
        const sheetName = `Page ${page.pageNumber}`;
        const worksheet = XLSX.utils.aoa_to_sheet(page.tableData);

        // Auto-size columns
        const maxWidths = page.tableData[0]?.map((_, colIndex) => {
          return Math.max(
            ...page.tableData.map(row => (row[colIndex] || "").toString().length),
            10
          );
        }) || [];

        worksheet['!cols'] = maxWidths.map(width => ({ wch: Math.min(width, 50) }));

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      const fileName = pdfFile?.name.replace(".pdf", "") || "document";
      saveAs(blob, `${fileName}.xlsx`);

      showToast("Excel file created successfully!");

    } catch (error) {
      console.error("Error converting to Excel:", error);
      showToast("Error converting to Excel. Please try again.");
    } finally {
      setConverting(false);
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

  const getTotalRows = (): number => {
    return pages
      .filter(page => page.selected)
      .reduce((sum, page) => sum + page.tableData.length, 0);
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
            <TableIcon className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            PDF to <span className="text-orange-500">Excel</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract data from PDF and convert to Excel spreadsheet
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
                    Browser-Based PDF Data Extraction
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    This tool extracts text from PDF and attempts to convert it to Excel format. Please note:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Works with text-based PDFs</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Attempts to detect table structures</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Complex tables may not be perfectly structured</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Scanned PDFs require OCR (not supported)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">Best for simple tabular data</p>
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
                  <p className="text-gray-700 font-medium">Extracting data from PDF...</p>
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
                {/* Settings Panel */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">Extraction Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Extraction Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extraction Mode
                      </label>
                      <select
                        value={extractionMode}
                        onChange={(e) => setExtractionMode(e.target.value as ExtractionMode)}
                        disabled={true}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                      >
                        <option value="table">Auto-detect Tables</option>
                        <option value="text">Simple Text (One Column)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Note: Requires re-upload to change mode
                      </p>
                    </div>

                    {/* Selected Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Pages
                      </label>
                      <div className="flex items-center gap-2 h-10">
                        <span className="text-2xl font-bold text-orange-500">
                          {getSelectedCount()}
                        </span>
                        <span className="text-sm text-gray-600">
                          / {totalPages} pages
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extraction Summary */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Extraction Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Pages</p>
                      <p className="text-2xl font-bold text-orange-500">{pages.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Rows</p>
                      <p className="text-2xl font-bold text-orange-500">{getTotalRows()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Selected</p>
                      <p className="text-2xl font-bold text-orange-500">{getSelectedCount()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-medium text-green-700">Ready</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pages Selection */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Pages
                    </h3>
                    <button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm"
                    >
                      {selectAll ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {pages.map((page) => (
                      <div
                        key={page.pageNumber}
                        onClick={() => togglePageSelection(page.pageNumber)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          page.selected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={page.selected}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              Page {page.pageNumber}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {page.tableData.length} rows detected
                            </p>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-hidden">
                              {page.text.substring(0, 150)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Sample */}
                {showPreview && pages.length > 0 && pages[0].tableData.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Data Preview (Page 1)
                      </h3>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Hide Preview
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs border border-gray-300">
                        <tbody>
                          {pages[0].tableData.slice(0, 10).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex === 0 ? "bg-orange-50 font-semibold" : ""}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-3 py-2 border border-gray-300 text-gray-700"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {pages[0].tableData.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Showing first 10 rows of {pages[0].tableData.length}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Conversion Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Before Converting
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check the preview to verify data structure</li>
                        <li>• Each page will become a separate sheet in Excel</li>
                        <li>• You may need to clean up the data after conversion</li>
                        <li>• For complex tables, consider using professional PDF tools</li>
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
                    onClick={convertToExcel}
                    disabled={converting || getSelectedCount() === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {converting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Convert to Excel ({getSelectedCount()} pages)
                      </>
                    )}
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