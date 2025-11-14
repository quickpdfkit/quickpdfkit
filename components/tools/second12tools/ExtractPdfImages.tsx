"use client";

import { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { 
  Upload, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Check,
  Grid3x3,
  List,
  DownloadIcon,
  
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

interface ExtractedImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  pageNumber: number;
  format: string;
  size: number;
}

export default function ExtractImages() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  
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
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);
    setExtractedImages([]);
    setSelectedImages(new Set());

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      
      showToast(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
      setPdfFile(null);
    } finally {
      setLoading(false);
    }
  };

  const extractImagesFromPdf = async () => {
  if (!pdfDoc) return;

  setExtracting(true);
  setProgress(0);
  const images: ExtractedImage[] = [];

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);

      const viewport = page.getViewport({ scale: 2 }); // Increase resolution
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/png");
      const base64Length = dataUrl.split(",")[1].length;
      const size = (base64Length * 3) / 4;

      images.push({
        id: `page-${pageNum}`,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        pageNumber: pageNum,
        format: "PNG",
        size,
      });

      setProgress(Math.round((pageNum / totalPages) * 100));
    }

    setExtractedImages(images);
    showToast(`Extracted ${images.length} image${images.length > 1 ? "s" : ""}`);
  } catch (error) {
    console.error("Error extracting images:", error);
    showToast("Error extracting images from PDF");
  } finally {
    setExtracting(false);
    setProgress(0);
  }
};


  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    if (selectedImages.size === extractedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(extractedImages.map(img => img.id)));
    }
  };

  const downloadSingleImage = (image: ExtractedImage) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = `${pdfFile?.name.replace(".pdf", "")}_page${image.pageNumber}_${image.id}.png`;
    link.click();
    showToast("Image downloaded");
  };

  const downloadSelectedImages = async () => {
    const imagesToDownload = extractedImages.filter(img => selectedImages.has(img.id));
    
    if (imagesToDownload.length === 0) {
      showToast("No images selected");
      return;
    }

    if (imagesToDownload.length === 1) {
      downloadSingleImage(imagesToDownload[0]);
      return;
    }

    setDownloading(true);
    
    try {
      const zip = new JSZip();
      const fileName = pdfFile?.name.replace(".pdf", "") || "pdf";

      for (const image of imagesToDownload) {
        const base64Data = image.dataUrl.split(",")[1];
        const imageName = `${fileName}_page${image.pageNumber}_${image.id}.png`;
        zip.file(imageName, base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${fileName}_images.zip`);
      
      showToast(`Downloaded ${imagesToDownload.length} images as ZIP`);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      showToast("Error downloading images");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllImages = async () => {
    if (extractedImages.length === 0) return;

    if (extractedImages.length === 1) {
      downloadSingleImage(extractedImages[0]);
      return;
    }

    setDownloading(true);
    
    try {
      const zip = new JSZip();
      const fileName = pdfFile?.name.replace(".pdf", "") || "pdf";

      for (const image of extractedImages) {
        const base64Data = image.dataUrl.split(",")[1];
        const imageName = `${fileName}_page${image.pageNumber}_${image.id}.png`;
        zip.file(imageName, base64Data, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${fileName}_all_images.zip`);
      
      showToast(`Downloaded all ${extractedImages.length} images as ZIP`);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      showToast("Error downloading images");
    } finally {
      setDownloading(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setExtractedImages([]);
    setSelectedImages(new Set());
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
            Extract <span className="text-orange-500">Images</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract all images from your PDF file
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
                    {extractedImages.length > 0 && ` • ${extractedImages.length} images extracted`}
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

            {!loading && pdfDoc && extractedImages.length === 0 && (
              <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                  <ImageIcon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Extract Images
                </h3>
                <p className="text-gray-600 mb-6">
                  Click the button below to extract all images from your PDF
                </p>
                <button
                  onClick={extractImagesFromPdf}
                  disabled={extracting}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 inline-flex items-center gap-2"
                >
                  {extracting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Extracting... {progress}%
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Extract Images
                    </>
                  )}
                </button>
              </div>
            )}

            {extractedImages.length > 0 && (
              <>
                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={selectAll}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        {selectedImages.size === extractedImages.length ? "Deselect All" : "Select All"}
                      </button>
                      {selectedImages.size > 0 && (
                        <span className="text-sm text-gray-600">
                          {selectedImages.size} selected
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                      title={viewMode === "grid" ? "List view" : "Grid view"}
                    >
                      {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Images Display */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Extracted Images ({extractedImages.length})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click on images to select them for download
                    </p>
                  </div>

                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-auto p-2">
                      {extractedImages.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => toggleImageSelection(image.id)}
                          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-orange-400 ${
                            selectedImages.has(image.id) ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200"
                          }`}
                        >
                          <img
                            src={image.dataUrl}
                            alt={`Image ${image.id}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium">
                              Page {image.pageNumber}
                            </p>
                            <p className="text-white/80 text-xs">
                              {image.width}×{image.height}
                            </p>
                          </div>
                          {selectedImages.has(image.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-orange-500 rounded-full p-1">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-auto">
                      {extractedImages.map((image) => (
                        <div
                          key={image.id}
                          onClick={() => toggleImageSelection(image.id)}
                          className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-orange-400 ${
                            selectedImages.has(image.id) ? "border-orange-500 bg-orange-50" : "border-gray-200"
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={image.dataUrl}
                              alt={`Image ${image.id}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            {selectedImages.has(image.id) && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-orange-500 rounded-full p-1">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {image.id}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Page {image.pageNumber} • {image.width}×{image.height} • {formatFileSize(image.size)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingleImage(image);
                            }}
                            className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all"
                          >
                            <Download className="w-4 h-4" />
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
                        Download Options
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Select specific images and download them as a ZIP file</li>
                        <li>• Download all images at once using the "Download All" button</li>
                        <li>• Click individual download icons in list view for single images</li>
                        <li>• All images are extracted in PNG format for best quality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Upload New PDF
                  </button>
                  {selectedImages.size > 0 && (
                    <button
                      onClick={downloadSelectedImages}
                      disabled={downloading}
                      className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {downloading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Selected ({selectedImages.size})
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={downloadAllImages}
                    disabled={downloading}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparing ZIP...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-5 h-5" />
                        Download All ({extractedImages.length})
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