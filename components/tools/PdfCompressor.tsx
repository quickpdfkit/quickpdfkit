"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileText, X, Minimize2, Upload } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export default function PdfCompressorWithPreview() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  };

  const getReduction = () => {
    if (!originalSize || !compressedSize) return null;
    return (100 - (compressedSize / originalSize) * 100).toFixed(1);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    setOriginalSize(file.size);
    setCompressedSize(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
      showToast(`PDF loaded: ${pdf.numPages} pages`);
    } catch (err) {
      console.error(err);
      showToast("Failed to load PDF pages");
    }
  };

  const handleCompress = async () => {
    if (!pdfFile) return;
    setIsCompressing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => newPdf.addPage(page));

      // compressedBytes is a proper Uint8Array
      const compressedBytes = await newPdf.save({ useObjectStreams: true });

      // Convert to a "real" Uint8Array backed by ArrayBuffer
      const safeBytes = new Uint8Array(compressedBytes);

      const compressedBlob = new Blob([safeBytes], { type: "application/pdf" });
      setCompressedSize(compressedBlob.size);

      saveAs(compressedBlob, `compressed-${pdfFile.name}`);
      showToast("PDF compressed successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to compress PDF");
    } finally {
      setIsCompressing(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPagePreviews([]);
    setOriginalSize(null);
    setCompressedSize(null);
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
            Compress <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Reduce PDF file size while maintaining quality and preview pages
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

        {/* PDF Info & Actions */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-gray-900 font-medium">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm">
                    Original: {formatSize(originalSize)}
                  </p>
                  {compressedSize && (
                    <p className="text-orange-500 text-sm">
                      Compressed: {formatSize(compressedSize)} ({getReduction()}
                      % reduction)
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={resetAll}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Page Previews */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 bg-white border border-gray-200 rounded-xl p-4 overflow-y-auto max-h-[50vh]">
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

            {/* Compress Button */}
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isCompressing ? (
                "Compressing..."
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" /> Compress PDF
                </>
              )}
            </button>

            {/* Tips */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 text-gray-700 text-sm">
              <h2 className="font-semibold text-gray-900 mb-2">
                📘 How to Reduce PDF Size Manually
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Reduce image resolution (150 DPI recommended)</li>
                <li>Remove unused pages or annotations</li>
                <li>Use standard fonts instead of embedded custom fonts</li>
                <li>Avoid scanning at very high resolutions</li>
                <li>Print to PDF with optimization</li>
              </ul>
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
