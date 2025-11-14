"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Check,
  X,
  Grid3x3,
  ChevronLeft,
  ChevronRight,
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

export default function ExtractPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<{ [key: number]: string }>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "single">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const loadPage = async (pageNumber: number) => {
    if (!pdfDoc || pageImages[pageNumber]) return;

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      }

      setPageImages((prev) => ({
        ...prev,
        [pageNumber]: canvas.toDataURL(),
      }));
    } catch (error) {
      console.error("Error loading page:", error);
    }
  };

  const loadAllPages = async () => {
    if (!pdfDoc) return;

    for (let i = 1; i <= totalPages; i++) {
      await loadPage(i);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);
    setSelectedPages(new Set());

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setPageImages({});
      
      showToast(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      if (viewMode === "grid") {
        loadAllPages();
      } else {
        loadPage(currentPage);
      }
    }
  }, [pdfDoc, currentPage, viewMode]);

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageNum)) {
        newSet.delete(pageNum);
      } else {
        newSet.add(pageNum);
      }
      return newSet;
    });
  };

  const selectAllPages = () => {
    const allPages = new Set<number>();
    for (let i = 1; i <= totalPages; i++) {
      allPages.add(i);
    }
    setSelectedPages(allPages);
    showToast("All pages selected");
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
    showToast("All pages deselected");
  };

  const extractPages = async () => {
    if (!pdfFile || selectedPages.size === 0) {
      showToast("Please select pages to extract");
      return;
    }

    setExtracting(true);

    try {
      showToast("Extracting pages...");

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      // Sort selected pages
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);

      // Copy selected pages to new document
      for (const pageNum of sortedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfLibDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      const fileName = pdfFile.name.replace(".pdf", "");
      saveAs(blob, `${fileName}_extracted_${selectedPages.size}_pages.pdf`);

      showToast(`${selectedPages.size} pages extracted successfully!`);
    } catch (error) {
      console.error("Error extracting pages:", error);
      showToast("Error extracting pages");
    } finally {
      setExtracting(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageImages({});
    setSelectedPages(new Set());
    setViewMode("grid");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Extract <span className="text-orange-500">PDF</span> Pages
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Select and extract specific pages from your PDF
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
                accept=".pdf"
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
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages • {selectedPages.size} selected
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
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            )}

            {!loading && pdfDoc && (
              <>
                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Selection Controls */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={selectAllPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Select All
                      </button>
                      <button
                        onClick={deselectAllPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Deselect All
                      </button>
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 font-medium">
                        {selectedPages.size} of {totalPages} selected
                      </span>
                      <button
                        onClick={() => setViewMode(viewMode === "single" ? "grid" : "single")}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        title={viewMode === "single" ? "Grid view" : "Single view"}
                      >
                        <Grid3x3 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Single Page View */}
                {viewMode === "single" && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    {/* Page Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <button
                          onClick={() => togglePageSelection(currentPage)}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                            selectedPages.has(currentPage)
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {selectedPages.has(currentPage) ? (
                            <>
                              <Check className="w-4 h-4" />
                              Selected
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Not Selected
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="text-sm text-gray-700 font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* Page Preview */}
                    <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center p-4">
                      {pageImages[currentPage] ? (
                        <div className="relative">
                          <img
                            src={pageImages[currentPage]}
                            alt={`Page ${currentPage}`}
                            className="max-w-full h-auto shadow-lg cursor-pointer"
                            onClick={() => togglePageSelection(currentPage)}
                          />
                          {selectedPages.has(currentPage) && (
                            <div className="absolute top-4 right-4 bg-orange-500 rounded-full p-2 shadow-lg">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                          <p className="text-gray-600">Loading page...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Click on pages to select/deselect them for extraction
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-auto p-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <div
                          key={pageNum}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                            selectedPages.has(pageNum) 
                              ? "border-orange-500 ring-2 ring-orange-200" 
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                          onClick={() => togglePageSelection(pageNum)}
                        >
                          {pageImages[pageNum] ? (
                            <>
                              <img
                                src={pageImages[pageNum]}
                                alt={`Page ${pageNum}`}
                                className="w-full h-auto"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-xs font-medium text-center">
                                  Page {pageNum}
                                </p>
                              </div>
                              {selectedPages.has(pageNum) && (
                                <div className="absolute top-2 right-2">
                                  <div className="bg-orange-500 rounded-full p-1.5 shadow-lg">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="aspect-[3/4] flex items-center justify-center bg-gray-100">
                              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold">i</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Extraction Tips
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Click on any page to select/deselect it</li>
                        <li>• Use "Select All" to quickly select all pages</li>
                        <li>• Selected pages will be extracted in order</li>
                        <li>• Switch to single view for detailed page preview</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Extract Button */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={extractPages}
                    disabled={extracting || selectedPages.size === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {extracting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Extract Pages ({selectedPages.size})
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