"use client";

import { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCw,
  Search,
  X,
  Menu,
  ChevronUp,
  ChevronDown,
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
type FitMode = "auto" | "page" | "width";

export default function PdfViewer() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [zoom, setZoom] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState<FitMode>("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
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
    if (!pdfDoc) return;

    try {
      const page = await pdfDoc.getPage(pageNumber);
      
      let scale = zoom;
      if (fitMode === "width" && viewerRef.current) {
        const containerWidth = viewerRef.current.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1, rotation });
        scale = containerWidth / viewport.width;
      } else if (fitMode === "page" && viewerRef.current) {
        const containerWidth = viewerRef.current.clientWidth - 40;
        const containerHeight = viewerRef.current.clientHeight - 40;
        const viewport = page.getViewport({ scale: 1, rotation });
        const scaleW = containerWidth / viewport.width;
        const scaleH = containerHeight / viewport.height;
        scale = Math.min(scaleW, scaleH);
      }

      const viewport = page.getViewport({ scale, rotation });

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

      setPageImage(canvas.toDataURL());
    } catch (error) {
      console.error("Error loading page:", error);
      showToast("Error loading page");
    }
  };

  const loadThumbnail = async (pageNumber: number) => {
    if (!pdfDoc || thumbnails[pageNumber]) return;

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.3 });

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

      setThumbnails((prev) => ({
        ...prev,
        [pageNumber]: canvas.toDataURL(),
      }));
    } catch (error) {
      console.error("Error loading thumbnail:", error);
    }
  };

  const loadAllThumbnails = async () => {
    if (!pdfDoc) return;

    for (let i = 1; i <= Math.min(totalPages, 20); i++) {
      await loadThumbnail(i);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
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
      loadPage(currentPage);
      loadAllThumbnails();
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc) {
      loadPage(currentPage);
    }
  }, [currentPage, zoom, rotation, fitMode]);

  const handleZoomIn = () => {
    if (fitMode !== "auto") setFitMode("auto");
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    if (fitMode !== "auto") setFitMode("auto");
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFitMode = (mode: FitMode) => {
    setFitMode(mode);
    if (mode === "auto") {
      setZoom(1.5);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfFile) return;
    saveAs(pdfFile, pdfFile.name);
    showToast("Downloading PDF...");
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      goToPage(value);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageImage("");
    setThumbnails({});
    setZoom(1.5);
    setRotation(0);
    setFitMode("auto");
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

      <div className="w-full max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            View <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Open and view PDF documents with advanced features
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
          <div className="space-y-4">
            {/* File Info Bar */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{pdfFile.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPdf}
                  className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={resetAll}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            )}

            {!loading && pdfDoc && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="border-b border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowThumbnails(!showThumbnails)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                      title="Toggle thumbnails"
                    >
                      <Menu className="w-4 h-4 text-gray-700" />
                    </button>

                    <div className="h-6 w-px bg-gray-300" />

                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={handlePageInputChange}
                        className="w-12 px-2 py-1 text-center text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">/ {totalPages}</span>
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Center Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4 text-gray-700" />
                    </button>

                    <select
                      value={fitMode}
                      onChange={(e) => handleFitMode(e.target.value as FitMode)}
                      className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="auto">{Math.round(zoom * 100)}%</option>
                      <option value="width">Fit Width</option>
                      <option value="page">Fit Page</option>
                    </select>

                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 4}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-700" />
                    </button>

                    <div className="h-6 w-px bg-gray-300" />

                    <button
                      onClick={handleRotate}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                      title="Rotate"
                    >
                      <RotateCw className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                      title="Search"
                    >
                      <Search className="w-4 h-4 text-gray-700" />
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4 text-gray-700" />
                      ) : (
                        <Maximize className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                  <div className="border-b border-gray-200 p-3 bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in document..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowSearch(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Viewer Area */}
                <div ref={viewerRef} className="flex h-[600px]">
                  {/* Thumbnails Sidebar */}
                  {showThumbnails && (
                    <div className="w-48 border-r border-gray-200 overflow-y-auto bg-gray-50 p-2">
                      <div className="space-y-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <div
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:border-orange-400 ${
                              currentPage === pageNum
                                ? "border-orange-500 ring-2 ring-orange-200"
                                : "border-gray-200"
                            }`}
                          >
                            {thumbnails[pageNum] ? (
                              <img
                                src={thumbnails[pageNum]}
                                alt={`Page ${pageNum}`}
                                className="w-full h-auto"
                              />
                            ) : (
                              <div className="aspect-[3/4] flex items-center justify-center bg-gray-100">
                                <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                              </div>
                            )}
                            <div className="bg-gray-100 p-1 text-center">
                              <p className="text-xs text-gray-700">{pageNum}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Viewer */}
                  <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <div className="flex items-center justify-center min-h-full">
                      {pageImage ? (
                        <img
                          src={pageImage}
                          alt={`Page ${currentPage}`}
                          className="max-w-full h-auto shadow-2xl"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                          <p className="text-gray-600">Loading page...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-1"
                  >
                    <ChevronUp className="w-3 h-3" />
                    First
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-1"
                  >
                    Last
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
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