"use client";

import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Check,
  X,
  Download as DownloadIcon,
  Archive,
  Grid3x3,
  List,
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

interface PagePreview {
  pageNumber: number;
  preview: string;
  selected: boolean;
}

type ImageFormat = "png" | "jpg" | "webp";
type ImageQuality = "low" | "medium" | "high";

export default function PdfToPng() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("high");
  const [scale, setScale] = useState(2);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  const getScaleValue = (): number => {
    switch (imageQuality) {
      case "low": return 1;
      case "medium": return 2;
      case "high": return 3;
      default: return 2;
    }
  };

  const getQualityValue = (): number => {
    switch (imageQuality) {
      case "low": return 0.7;
      case "medium": return 0.85;
      case "high": return 0.95;
      default: return 0.85;
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
      
      showToast(`PDF loaded: ${pdf.numPages} pages`);

      // Load all page previews using the same logic as AddPageNumbers
      const previews: PagePreview[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        previews.push({
          pageNumber: i,
          preview: canvas.toDataURL(),
          selected: true,
        });
      }

      setPages(previews);

    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    } finally {
      setLoading(false);
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

  const convertPageToImage = async (pageNumber: number): Promise<Blob> => {
    if (!pdfDoc) throw new Error("PDF not loaded");

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: getScaleValue() });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;

    return new Promise((resolve, reject) => {
      const mimeType = imageFormat === "jpg" ? "image/jpeg" : `image/${imageFormat}`;
      const quality = imageFormat === "png" ? undefined : getQualityValue();
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert page to image"));
          }
        },
        mimeType,
        quality
      );
    });
  };

  const downloadSingleImage = async (pageNumber: number) => {
    setConverting(true);
    try {
      const blob = await convertPageToImage(pageNumber);
      const fileName = pdfFile?.name.replace(".pdf", "") || "page";
      saveAs(blob, `${fileName}_page_${pageNumber}.${imageFormat}`);
      showToast(`Page ${pageNumber} downloaded`);
    } catch (error) {
      console.error("Error converting page:", error);
      showToast("Error converting page");
    } finally {
      setConverting(false);
    }
  };

  const downloadSelectedImages = async () => {
    const selectedPages = pages.filter(page => page.selected);
    
    if (selectedPages.length === 0) {
      showToast("Please select at least one page");
      return;
    }

    setConverting(true);

    try {
      if (selectedPages.length === 1) {
        // Download single image directly
        await downloadSingleImage(selectedPages[0].pageNumber);
      } else {
        // Download multiple images as ZIP
        showToast("Creating ZIP file...");
        
        const zip = new JSZip();
        const fileName = pdfFile?.name.replace(".pdf", "") || "document";

        for (const page of selectedPages) {
          try {
            const blob = await convertPageToImage(page.pageNumber);
            zip.file(`${fileName}_page_${page.pageNumber}.${imageFormat}`, blob);
          } catch (error) {
            console.error(`Error converting page ${page.pageNumber}:`, error);
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${fileName}_images.zip`);
        showToast(`${selectedPages.length} images downloaded as ZIP`);
      }
    } catch (error) {
      console.error("Error converting pages:", error);
      showToast("Error converting pages");
    } finally {
      setConverting(false);
    }
  };

  const downloadAllAsZip = async () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
    setSelectAll(true);
    setTimeout(downloadSelectedImages, 100);
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setPages([]);
    setSelectAll(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSelectedCount = (): number => {
    return pages.filter(page => page.selected).length;
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
            <ImageIcon className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            PDF to <span className="text-orange-500">PNG</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert PDF pages to high-quality images
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

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading pages...</p>
              </div>
            )}

            {!loading && pages.length > 0 && (
              <>
                {/* Settings Panel */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Image Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format
                      </label>
                      <select
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value as ImageFormat)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      >
                        
                        <option value="jpg">PNG</option>
                       
                      </select>
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality
                      </label>
                      <select
                        value={imageQuality}
                        onChange={(e) => setImageQuality(e.target.value as ImageQuality)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      >
                        <option value="low">Low (Faster)</option>
                        <option value="medium">Medium</option>
                        <option value="high">High (Best)</option>
                      </select>
                    </div>

                    {/* Selected Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected
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

                {/* Pages Grid/List */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Pages
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleSelectAll}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                      >
                        {selectAll ? (
                          <>
                            <X className="w-4 h-4" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Select All
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        title={viewMode === "grid" ? "List view" : "Grid view"}
                      >
                        {viewMode === "grid" ? (
                          <List className="w-5 h-5 text-gray-700" />
                        ) : (
                          <Grid3x3 className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto">
                      {pages.map((page) => (
                        <div
                          key={page.pageNumber}
                          onClick={() => togglePageSelection(page.pageNumber)}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                            page.selected
                              ? "border-orange-500 ring-2 ring-orange-200"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <img
                            src={page.preview}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium text-center">
                              Page {page.pageNumber}
                            </p>
                          </div>
                          {page.selected && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-orange-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {pages.map((page) => (
                        <div
                          key={page.pageNumber}
                          className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            page.selected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={page.selected}
                            onChange={() => togglePageSelection(page.pageNumber)}
                            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                          />
                          <img
                            src={page.preview}
                            alt={`Page ${page.pageNumber}`}
                            className="w-16 h-20 object-cover rounded border border-gray-300"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Page {page.pageNumber}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Will be converted to {imageFormat.toUpperCase()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleImage(page.pageNumber);
                            }}
                            disabled={converting}
                            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-all"
                            title="Download this page"
                          >
                            <DownloadIcon className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                        Conversion Info
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Click pages to select/deselect for conversion</li>
                        <li>• Multiple pages will be downloaded as a ZIP file</li>
                        <li>• Higher quality produces larger file sizes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  
                  {getSelectedCount() > 1 && (
                    <button
                      onClick={downloadSelectedImages}
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
                          <Archive className="w-5 h-5" />
                          Download as ZIP ({getSelectedCount()} pages)
                        </>
                      )}
                    </button>
                  )}

                  {getSelectedCount() === 1 && (
                    <button
                      onClick={downloadSelectedImages}
                      disabled={converting}
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
                          Download Image
                        </>
                      )}
                    </button>
                  )}
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