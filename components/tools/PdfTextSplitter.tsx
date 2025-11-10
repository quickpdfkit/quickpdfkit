"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, X, FileDown } from "lucide-react";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export default function PdfTextSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [pageTexts, setPageTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
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

      // Render thumbnails
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
      setPageTexts([]); // reset
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Failed to load PDF");
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async () => {
    if (!pdfFile) return;
    setExtracting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const texts: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str).join(" ");
        texts.push(strings.trim());
      }

      setPageTexts(texts);
      showToast("Text extracted successfully!");
    } catch (error) {
      console.error("Error extracting text:", error);
      showToast("Error extracting text");
    } finally {
      setExtracting(false);
    }
  };

  const downloadText = (text: string, pageNum: number) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const base = pdfFile?.name.replace(".pdf", "") || "document";
    saveAs(blob, `${base}_page_${pageNum}.txt`);
  };

  const downloadAllText = () => {
    const allText = pageTexts
      .map((t, i) => `--- Page ${i + 1} ---\n${t}\n`)
      .join("\n\n");
    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const base = pdfFile?.name.replace(".pdf", "") || "document";
    saveAs(blob, `${base}_all_pages.txt`);
  };

  const resetAll = () => {
    setPdfFile(null);
    setPageCount(0);
    setPagePreviews([]);
    setPageTexts([]);
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
            Extract <span className="text-orange-500">Text</span> from PDF
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract and split text from each PDF page
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

        {/* PDF Info */}
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

            {/* Preview Grid */}
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

            {/* Extract Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95"
              >
                Upload New PDF
              </button>

              <button
                onClick={extractTextFromPDF}
                disabled={extracting}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {extracting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Extract Text
                  </>
                )}
              </button>
            </div>

            {/* Extracted Text */}
            {pageTexts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileDown className="w-5 h-5 text-orange-500" />
                    Extracted Text
                  </h3>
                  <button
                    onClick={downloadAllText}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-all"
                  >
                    Download All
                  </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {pageTexts.map((text, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Page {i + 1}
                        </h4>
                        <button
                          onClick={() => downloadText(text, i + 1)}
                          className="text-orange-500 text-xs font-medium hover:underline"
                        >
                          Download Page
                        </button>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {text || "No text found on this page"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
