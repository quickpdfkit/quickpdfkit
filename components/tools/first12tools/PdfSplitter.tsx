"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileText, Upload, Download, Check, Scissors, X } from "lucide-react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";

if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}


interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  selected: boolean;
}

export default function PdfSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [splitMode, setSplitMode] = useState<"selected" | "individual" | "range">("selected");
  const [rangeInput, setRangeInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const generateThumbnail = async (pdf: any, pageNumber: number): Promise<string> => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.5 });

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

    return canvas.toDataURL();
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);
    setPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);

      const pageCount = pdf.numPages;
      const pagePromises: Promise<PagePreview>[] = [];

      for (let i = 1; i <= pageCount; i++) {
        pagePromises.push(
          generateThumbnail(pdf, i).then((thumbnail) => ({
            pageNumber: i,
            thumbnail,
            selected: false,
          }))
        );
      }

      const loadedPages = await Promise.all(pagePromises);
      setPages(loadedPages);
      showToast(`PDF loaded: ${pageCount} pages`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    } finally {
      setLoading(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page
      )
    );
  };

  const selectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const parseRangeInput = (input: string, totalPages: number): number[] => {
    const pageNumbers: number[] = [];
    const parts = input.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim()));
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          if (i >= 1 && !pageNumbers.includes(i)) {
            pageNumbers.push(i);
          }
        }
      } else {
        const page = parseInt(trimmed);
        if (page >= 1 && page <= totalPages && !pageNumbers.includes(page)) {
          pageNumbers.push(page);
        }
      }
    }

    return pageNumbers.sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (!pdfFile) return;

    setSplitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      let pagesToSplit: number[] = [];

      if (splitMode === "selected") {
        pagesToSplit = pages.filter((p) => p.selected).map((p) => p.pageNumber);
        if (pagesToSplit.length === 0) {
          showToast("Please select at least one page");
          setSplitting(false);
          return;
        }
      } else if (splitMode === "individual") {
        pagesToSplit = pages.map((p) => p.pageNumber);
      } else if (splitMode === "range") {
        if (!rangeInput.trim()) {
          showToast("Please enter a page range");
          setSplitting(false);
          return;
        }
        pagesToSplit = parseRangeInput(rangeInput, pages.length);
        if (pagesToSplit.length === 0) {
          showToast("Invalid page range");
          setSplitting(false);
          return;
        }
      }

      // Create separate PDF for each page
      for (const pageNumber of pagesToSplit) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });

        const fileName = pdfFile.name.replace(".pdf", "");
        saveAs(blob, `${fileName}_page_${pageNumber}.pdf`);

        // Small delay to prevent browser from blocking multiple downloads
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      showToast(`Successfully split ${pagesToSplit.length} page(s)`);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      showToast("Error splitting PDF");
    } finally {
      setSplitting(false);
    }
  };

  const splitByRange = async () => {
    if (!pdfFile || !rangeInput.trim()) return;

    setSplitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const ranges = rangeInput.split("|").map((r) => r.trim()).filter(Boolean);
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const pageNumbers = parseRangeInput(range, pages.length);
        
        if (pageNumbers.length === 0) continue;

        const newPdf = await PDFDocument.create();
        const pageIndices = pageNumbers.map((n) => n - 1);
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });

        const fileName = pdfFile.name.replace(".pdf", "");
        saveAs(blob, `${fileName}_split_${i + 1}.pdf`);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      showToast(`Successfully created ${ranges.length} PDF file(s)`);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      showToast("Error splitting PDF");
    } finally {
      setSplitting(false);
    }
  };

  const handleSplit = () => {
    if (splitMode === "range" && rangeInput.includes("|")) {
      splitByRange();
    } else {
      splitPdf();
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setPages([]);
    setRangeInput("");
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
            Split <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Split your PDF into multiple files - extract pages easily
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
                  PDF files only • Single file
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading PDF pages...</p>
          </div>
        )}

        {/* PDF Loaded - Split Options */}
        {pdfFile && !loading && pages.length > 0 && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-gray-900 font-medium">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm">{pages.length} pages</p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Split Mode Selection */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Split Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSplitMode("selected")}
                  className={`p-4 rounded-xl border-2 font-medium transition-all text-left ${
                    splitMode === "selected"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-900 font-semibold">
                      Selected Pages
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to select specific pages
                  </p>
                </button>

                <button
                  onClick={() => setSplitMode("individual")}
                  className={`p-4 rounded-xl border-2 font-medium transition-all text-left ${
                    splitMode === "individual"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Scissors className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-900 font-semibold">
                      All Pages
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Split into individual files
                  </p>
                </button>

                <button
                  onClick={() => setSplitMode("range")}
                  className={`p-4 rounded-xl border-2 font-medium transition-all text-left ${
                    splitMode === "range"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-900 font-semibold">
                      Custom Range
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Enter page ranges</p>
                </button>
              </div>

              {/* Range Input */}
              {splitMode === "range" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Range
                  </label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g., 1-3, 5, 7-9 or 1-3 | 4-6 | 7-9 for multiple files"
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Use "|" to split into multiple files (e.g., "1-3 | 4-6" creates 2 files)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions for Selected Mode */}
            {splitMode === "selected" && (
              <div className="flex gap-3">
                <button
                  onClick={selectAllPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all"
                >
                  Deselect All
                </button>
                <div className="ml-auto text-sm text-gray-600 py-2">
                  {pages.filter((p) => p.selected).length} of {pages.length}{" "}
                  selected
                </div>
              </div>
            )}

            {/* Page Thumbnails Grid */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pages Preview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    onClick={() => togglePageSelection(page.pageNumber)}
                    className={`relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all ${
                      page.selected && splitMode === "selected"
                        ? "border-orange-500 shadow-lg"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <img
                      src={page.thumbnail}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Page {page.pageNumber}
                    </div>
                    {page.selected && splitMode === "selected" && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95"
              >
                Upload New PDF
              </button>

              <button
                onClick={handleSplit}
                disabled={splitting}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {splitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Split & Download
                  </>
                )}
              </button>
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