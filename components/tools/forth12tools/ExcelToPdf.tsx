"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  File,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SheetData {
  name: string;
  data: any[][];
  selected: boolean;
  preview: string[][];
}

type PageSize = "A4" | "Letter" | "Legal" | "A3";
type Orientation = "portrait" | "landscape";
type FitMode = "auto" | "fit-page";

export default function ExcelToPdf() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [fitMode, setFitMode] = useState<FitMode>("auto");
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  
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

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    const validExtensions = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const fileName = file.name.toLowerCase();
    if (!validExtensions.includes(file.type) && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      showToast("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setLoading(true);
    setExcelFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetsData: SheetData[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        // Get preview (first 10 rows)
        const preview = jsonData.slice(0, 10);

        return {
          name: sheetName,
          data: jsonData,
          selected: true,
          preview,
        };
      });

      setSheets(sheetsData);
      showToast(`Excel file loaded: ${sheetsData.length} sheet(s)`);

    } catch (error) {
      console.error("Error loading Excel file:", error);
      showToast("Error loading Excel file. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSheetSelection = (sheetName: string) => {
    setSheets(prev =>
      prev.map(sheet =>
        sheet.name === sheetName ? { ...sheet, selected: !sheet.selected } : sheet
      )
    );
  };

  const toggleAllSheets = () => {
    const allSelected = sheets.every(sheet => sheet.selected);
    setSheets(prev => prev.map(sheet => ({ ...sheet, selected: !allSelected })));
  };

  const toggleSheetExpand = (sheetName: string) => {
    setExpandedSheet(prev => prev === sheetName ? null : sheetName);
  };

  const convertToPdf = async () => {
    const selectedSheets = sheets.filter(sheet => sheet.selected);

    if (selectedSheets.length === 0) {
      showToast("Please select at least one sheet");
      return;
    }

    setConverting(true);

    try {
      showToast("Creating PDF...");

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize.toLowerCase() as any,
      });

      let isFirstSheet = true;

      for (const sheet of selectedSheets) {
        // Add new page for each sheet (except first)
        if (!isFirstSheet) {
          pdf.addPage();
        }
        isFirstSheet = false;

        // Add sheet name as title
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(sheet.name, 14, 15);

        // Prepare table data
        const tableData = sheet.data.filter(row => row.some(cell => cell !== ""));

        if (tableData.length === 0) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text("(Empty sheet)", 14, 25);
          continue;
        }

        // Use first row as header if it looks like headers
        const hasHeader = tableData[0].every((cell: any) => 
          typeof cell === "string" && cell.trim() !== ""
        );

        const headers = hasHeader ? tableData[0] : tableData[0].map((_: any, i: number) => `Column ${i + 1}`);
        const body = hasHeader ? tableData.slice(1) : tableData;

        // Generate table
        autoTable(pdf, {
          head: [headers],
          body: body,
          startY: 22,
          theme: "grid",
          headStyles: {
            fillColor: [255, 107, 53], // Orange color
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 2,
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251],
          },
          styles: {
            overflow: fitMode === "fit-page" ? "linebreak" : "hidden",
            cellWidth: fitMode === "fit-page" ? "wrap" : "auto",
            fontSize: 8,
          },
          margin: { top: 20, right: 10, bottom: 10, left: 10 },
          didDrawPage: (data) => {
            // Add footer with page number
            const pageCount = (pdf as any).internal.getNumberOfPages();
            pdf.setFontSize(8);
            pdf.setTextColor(128);
            pdf.text(
              `Sheet: ${sheet.name} | Page ${data.pageNumber} of ${pageCount}`,
              data.settings.margin.left,
              pdf.internal.pageSize.height - 5
            );
          },
        });
      }

      // Save PDF
      const fileName = excelFile?.name.replace(/\.(xlsx|xls)$/i, "") || "spreadsheet";
      pdf.save(`${fileName}.pdf`);

      showToast("PDF created successfully!");

    } catch (error) {
      console.error("Error converting to PDF:", error);
      showToast("Error converting to PDF. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const resetAll = () => {
    setExcelFile(null);
    setSheets([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSelectedCount = (): number => {
    return sheets.filter(sheet => sheet.selected).length;
  };

  const getTotalRows = (): number => {
    return sheets
      .filter(sheet => sheet.selected)
      .reduce((sum, sheet) => sum + sheet.data.length, 0);
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
            Excel to <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert Excel spreadsheets to PDF documents
          </p>
        </div>

        {/* Upload Area */}
        {!excelFile ? (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files[0]);
              }}
            >
              <label
                htmlFor="excel-upload"
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
                    .xlsx or .xls files
                  </span>
                </div>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Conversion Features
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Convert multiple sheets to a single PDF</li>
                    <li>• Choose which sheets to include</li>
                    <li>• Automatically formats data as tables</li>
                    <li>• Preserves basic cell content (text, numbers)</li>
                    <li>• Page size and orientation options</li>
                  </ul>
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
                  <p className="text-gray-900 font-semibold">{excelFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(excelFile.size)} • {sheets.length} sheet(s)
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

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading Excel file...</p>
              </div>
            )}

            {!loading && sheets.length > 0 && (
              <>
                {/* Settings Panel */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Page Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Size
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as PageSize)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      >
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="Letter">Letter (8.5 × 11 in)</option>
                        <option value="Legal">Legal (8.5 × 14 in)</option>
                        <option value="A3">A3 (297 × 420 mm)</option>
                      </select>
                    </div>

                    {/* Orientation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientation
                      </label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as Orientation)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape (Recommended)</option>
                      </select>
                    </div>

                    {/* Fit Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Table Fit
                      </label>
                      <select
                        value={fitMode}
                        onChange={(e) => setFitMode(e.target.value as FitMode)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      >
                        <option value="auto">Auto (May overflow)</option>
                        <option value="fit-page">Fit to Page</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sheets Selection */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Sheets ({getSelectedCount()} of {sheets.length})
                    </h3>
                    <button
                      onClick={toggleAllSheets}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm"
                    >
                      {sheets.every(s => s.selected) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sheets.map((sheet) => (
                      <div
                        key={sheet.name}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Sheet Header */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50">
                          <input
                            type="checkbox"
                            checked={sheet.selected}
                            onChange={() => toggleSheetSelection(sheet.name)}
                            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {sheet.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {sheet.data.length} rows × {sheet.data[0]?.length || 0} columns
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSheetExpand(sheet.name)}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-all"
                          >
                            {expandedSheet === sheet.name ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>

                        {/* Sheet Preview */}
                        {expandedSheet === sheet.name && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Preview (first 10 rows):</p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs border border-gray-300">
                                <tbody>
                                  {sheet.preview.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-orange-50" : ""}>
                                      {row.map((cell, cellIndex) => (
                                        <td
                                          key={cellIndex}
                                          className="px-2 py-1 border border-gray-300 text-gray-700 max-w-xs truncate"
                                        >
                                          {String(cell || "")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Conversion Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Selected Sheets</p>
                      <p className="text-2xl font-bold text-orange-500">{getSelectedCount()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Rows</p>
                      <p className="text-2xl font-bold text-orange-500">{getTotalRows()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Page Size</p>
                      <p className="text-lg font-bold text-orange-500">{pageSize}</p>
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

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900 font-medium mb-1">
                        Conversion Notes
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Each sheet will be converted to separate pages in the PDF</li>
                        <li>• Complex formatting, formulas, and charts are not preserved</li>
                        <li>• Landscape orientation is recommended for wide spreadsheets</li>
                        <li>• Use "Fit to Page" if tables are too wide</li>
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
                    onClick={convertToPdf}
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
                        Convert to PDF ({getSelectedCount()} sheet{getSelectedCount() !== 1 ? 's' : ''})
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