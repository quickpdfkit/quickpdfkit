"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Upload, Download, FileText, Plus, Trash2 } from "lucide-react";

export default function PdfPageManager() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [blankPages, setBlankPages] = useState<
    Array<{ position: "before" | "after"; pageNumber: number; id: string }>
  >([]);
  const [newPagePosition, setNewPagePosition] = useState<"before" | "after">(
    "after"
  );
  const [newPageNumber, setNewPageNumber] = useState(1);
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

  const handleFileUpload = (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    setBlankPages([]);
    showToast("PDF loaded successfully");
  };

  const addBlankPage = () => {
    if (!pdfFile) {
      showToast("Please upload a PDF file first");
      return;
    }

    if (newPageNumber < 2) {
      showToast("Page number must be at least 1");
      return;
    }

    const newPage = {
      position: newPagePosition,
      pageNumber: newPageNumber,
      id: Math.random().toString(36).substr(2, 9),
    };

    setBlankPages((prev) => [...prev, newPage]);
    showToast(`Blank page added ${newPagePosition} page ${newPageNumber}`);

    // Auto-increment page number for next addition
    if (newPagePosition === "after") {
      setNewPageNumber((prev) => prev + 1);
    }
  };

  const removeBlankPage = (id: string) => {
    setBlankPages((prev) => prev.filter((page) => page.id !== id));
    showToast("Blank page removed");
  };

  const clearAllBlankPages = () => {
    setBlankPages([]);
    showToast("All blank pages cleared");
  };

  const addBlankPagesToPdf = async () => {
    if (!pdfFile) return;

    setProcessing(true);
    showToast("Adding blank pages to PDF...");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        showToast("PDF has no pages");
        setProcessing(false);
        return;
      }

      // Get dimensions from first page
      const { width, height } = pages[0].getSize();

      // Sort blank pages by original page number to process in order
      const sortedPages = [...blankPages].sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return a.position === "before" ? -1 : 1;
      });

      let pageOffset = 0;

      for (const blankPage of sortedPages) {
        const insertIndex =
          blankPage.position === "before"
            ? blankPage.pageNumber - 1 + pageOffset
            : blankPage.pageNumber + pageOffset;

        // Create blank page
        const blank = pdfDoc.addPage([width, height]);

        // Optional: Add subtle watermark to identify blank pages
        blank.drawText("Blank Page", {
          x: width / 2 - 50,
          y: height / 2,
          size: 12,
          color: rgb(0.8, 0.8, 0.8),
        });

        // Move the blank page to the correct position
        const pages = pdfDoc.getPages();
        const blankPageIndex = pages.length - 1;
        if (insertIndex < blankPageIndex) {
          pdfDoc.insertPage(insertIndex, pages[blankPageIndex]);
          pdfDoc.removePage(blankPageIndex + 1);
        }

        pageOffset++;
      }

      const pdfBytes = await pdfDoc.save();
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // pdfBytes is Uint8Array<ArrayBufferLike>
      const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
      const blob = new Blob([safeBytes], { type: "application/pdf" });

      saveAs(blob, `modified_${pdfFile.name}`);

      setProcessing(false);
      showToast("PDF with blank pages downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to add blank pages. Please try again.");
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setBlankPages([]);
    setNewPageNumber(1);
    setNewPagePosition("after");
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

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Add <span className="text-orange-500">Blank Pages</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Insert blank pages into your PDF documents
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFileUpload(file);
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
                  PDF files only • Maximum file size: 100MB
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
        )}

        {/* PDF Loaded - Page Management */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {pdfFile.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatFileSize(pdfFile.size)}
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
            </div>

            {/* Add Blank Page Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Blank Page
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Position Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={newPagePosition}
                    onChange={(e) =>
                      setNewPagePosition(e.target.value as "before" | "after")
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  >
                    <option value="before">Before Page</option>
                    <option value="after">After Page</option>
                  </select>
                </div>

                {/* Page Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPageNumber}
                    onChange={(e) =>
                      setNewPageNumber(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="Enter page number"
                  />
                </div>

                {/* Add Button */}
                <div className="flex items-end">
                  <button
                    onClick={addBlankPage}
                    className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Page
                  </button>
                </div>
              </div>
            </div>

            {/* Blank Pages List */}
            {blankPages.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Blank Pages to Add ({blankPages.length})
                  </h3>
                  <button
                    onClick={clearAllBlankPages}
                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {blankPages.map((page, index) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">
                            Blank page {page.position} page {page.pageNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {page.position === "before" ? "Before" : "After"}{" "}
                            page {page.pageNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBlankPage(page.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                disabled={processing}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={addBlankPagesToPdf}
                disabled={processing || blankPages.length === 0}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Modified PDF
                  </>
                )}
              </button>
            </div>

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
                    How it works
                  </p>
                  <p className="text-sm text-blue-700">
                    Add blank pages to your PDF document by specifying the
                    position and page number. The blank pages will be inserted
                    with the same dimensions as your original PDF pages and
                    include a subtle watermark for identification.
                  </p>
                </div>
              </div>
            </div>
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
