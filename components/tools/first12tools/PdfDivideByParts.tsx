"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileText, Upload, Download, X, Layers } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export default function PdfDivideByParts() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [partCount, setPartCount] = useState<number>(2);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfFile(file);
      setPageCount(pdf.numPages);
      showToast(`PDF loaded: ${pdf.numPages} pages`);

      const previews: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        previews.push(canvas.toDataURL());
      }

      setPagePreviews(previews);
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!pdfFile) return;
    if (partCount < 1) {
      showToast("Number of parts must be at least 1");
      return;
    }

    setSplitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      const pagesPerPart = Math.ceil(totalPages / partCount);
      let start = 0;

      for (let i = 0; i < partCount; i++) {
        const newPdf = await PDFDocument.create();
        const end = Math.min(start + pagesPerPart, totalPages);
        const copiedPages = await newPdf.copyPages(
          pdfDoc,
          Array.from({ length: end - start }, (_, j) => start + j)
        );
        copiedPages.forEach((p) => newPdf.addPage(p));

        const pdfBytes = await newPdf.save();
        // pdfBytes is Uint8Array<ArrayBufferLike>
        const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
        const blob = new Blob([safeBytes], { type: "application/pdf" });

        const fileName = pdfFile.name.replace(".pdf", "");
        saveAs(blob, `${fileName}_part_${i + 1}.pdf`);
        start = end;
        await new Promise((r) => setTimeout(r, 100));
      }

      showToast(`Successfully split into ${partCount} part(s)`);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      showToast("Error splitting PDF");
    } finally {
      setSplitting(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPageCount(0);
    setPartCount(2);
    setPagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex flex-col items-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Split PDF into <span className="text-orange-500">Parts</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Divide your PDF into a specific number of equal parts
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
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
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        )}

        {/* PDF Info & Preview */}
        {pdfFile && !loading && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-gray-900 font-medium">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm">{pageCount} pages</p>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto max-h-[60vh]">
              {pagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={src}
                    alt={`Page ${i + 1}`}
                    className="w-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Split Controls */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                Number of Parts
              </h3>
              <input
                type="number"
                value={partCount}
                onChange={(e) =>
                  setPartCount(Math.max(1, Number(e.target.value)))
                }
                min={1}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500">
                The PDF will be divided into {partCount} approximately equal
                parts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95"
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

      {/* Toast */}
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
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
