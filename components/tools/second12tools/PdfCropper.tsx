"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  RefreshCw,
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

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageCrops {
  [pageNumber: number]: CropArea;
}

export default function PdfCropper() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Crop states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [pageCrops, setPageCrops] = useState<PageCrops>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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

      setPageImage(canvas.toDataURL());
      setCanvasSize({ width: viewport.width, height: viewport.height });

      // Load existing crop for this page if available
      if (pageCrops[pageNumber]) {
        setCropArea(pageCrops[pageNumber]);
      } else {
        setCropArea(null);
      }
    } catch (error) {
      console.error("Error loading page:", error);
      showToast("Error loading page");
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
    }
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    redrawCanvas();
  }, [pageImage, cropArea]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = pageImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw crop area overlay
      if (cropArea) {
        // Darken outside crop area
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, cropArea.y);
        ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
        ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - (cropArea.x + cropArea.width), cropArea.height);
        ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - (cropArea.y + cropArea.height));

        // Draw crop rectangle
        ctx.strokeStyle = "#ff6b35";
        ctx.lineWidth = 3;
        ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

        // Draw resize handles
        const handleSize = 12;
        ctx.fillStyle = "#ff6b35";
        
        // Corner handles
        ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);

        // Edge handles
        ctx.fillRect(cropArea.x + cropArea.width/2 - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width/2 - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height/2 - handleSize/2, handleSize, handleSize);
      }
    };
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getResizeHandle = (x: number, y: number): string => {
    if (!cropArea) return "";

    const handleSize = 12;
    const tolerance = handleSize;

    // Check corners
    if (Math.abs(x - cropArea.x) < tolerance && Math.abs(y - cropArea.y) < tolerance) return "nw";
    if (Math.abs(x - (cropArea.x + cropArea.width)) < tolerance && Math.abs(y - cropArea.y) < tolerance) return "ne";
    if (Math.abs(x - cropArea.x) < tolerance && Math.abs(y - (cropArea.y + cropArea.height)) < tolerance) return "sw";
    if (Math.abs(x - (cropArea.x + cropArea.width)) < tolerance && Math.abs(y - (cropArea.y + cropArea.height)) < tolerance) return "se";

    // Check edges
    if (Math.abs(y - cropArea.y) < tolerance && x > cropArea.x && x < cropArea.x + cropArea.width) return "n";
    if (Math.abs(y - (cropArea.y + cropArea.height)) < tolerance && x > cropArea.x && x < cropArea.x + cropArea.width) return "s";
    if (Math.abs(x - cropArea.x) < tolerance && y > cropArea.y && y < cropArea.y + cropArea.height) return "w";
    if (Math.abs(x - (cropArea.x + cropArea.width)) < tolerance && y > cropArea.y && y < cropArea.y + cropArea.height) return "e";

    return "";
  };

  const isInsideCropArea = (x: number, y: number): boolean => {
    if (!cropArea) return false;
    return x >= cropArea.x && x <= cropArea.x + cropArea.width &&
           y >= cropArea.y && y <= cropArea.y + cropArea.height;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const handle = getResizeHandle(pos.x, pos.y);

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setStartPoint(pos);
    } else if (cropArea && isInsideCropArea(pos.x, pos.y)) {
      setIsDragging(true);
      setStartPoint(pos);
    } else {
      // Start new crop area
      setCropArea({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      });
      setStartPoint(pos);
      setIsResizing(true);
      setResizeHandle("se");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isResizing && cropArea && startPoint) {
      const dx = pos.x - startPoint.x;
      const dy = pos.y - startPoint.y;

      let newCrop = { ...cropArea };

      switch (resizeHandle) {
        case "nw":
          newCrop = {
            x: cropArea.x + dx,
            y: cropArea.y + dy,
            width: cropArea.width - dx,
            height: cropArea.height - dy,
          };
          break;
        case "ne":
          newCrop = {
            x: cropArea.x,
            y: cropArea.y + dy,
            width: cropArea.width + dx,
            height: cropArea.height - dy,
          };
          break;
        case "sw":
          newCrop = {
            x: cropArea.x + dx,
            y: cropArea.y,
            width: cropArea.width - dx,
            height: cropArea.height + dy,
          };
          break;
        case "se":
          newCrop = {
            x: cropArea.x,
            y: cropArea.y,
            width: cropArea.width + dx,
            height: cropArea.height + dy,
          };
          break;
        case "n":
          newCrop = {
            ...cropArea,
            y: cropArea.y + dy,
            height: cropArea.height - dy,
          };
          break;
        case "s":
          newCrop = {
            ...cropArea,
            height: cropArea.height + dy,
          };
          break;
        case "w":
          newCrop = {
            x: cropArea.x + dx,
            y: cropArea.y,
            width: cropArea.width - dx,
            height: cropArea.height,
          };
          break;
        case "e":
          newCrop = {
            ...cropArea,
            width: cropArea.width + dx,
          };
          break;
      }

      // Ensure crop area stays within bounds
      newCrop.x = Math.max(0, Math.min(newCrop.x, canvasSize.width));
      newCrop.y = Math.max(0, Math.min(newCrop.y, canvasSize.height));
      newCrop.width = Math.max(50, Math.min(newCrop.width, canvasSize.width - newCrop.x));
      newCrop.height = Math.max(50, Math.min(newCrop.height, canvasSize.height - newCrop.y));

      setCropArea(newCrop);
      setStartPoint(pos);
    } else if (isDragging && cropArea && startPoint) {
      const dx = pos.x - startPoint.x;
      const dy = pos.y - startPoint.y;

      let newX = cropArea.x + dx;
      let newY = cropArea.y + dy;

      // Keep within bounds
      newX = Math.max(0, Math.min(newX, canvasSize.width - cropArea.width));
      newY = Math.max(0, Math.min(newY, canvasSize.height - cropArea.height));

      setCropArea({
        ...cropArea,
        x: newX,
        y: newY,
      });
      setStartPoint(pos);
    } else {
      // Update cursor based on position
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handle = getResizeHandle(pos.x, pos.y);
      if (handle) {
        const cursors: { [key: string]: string } = {
          nw: "nw-resize",
          ne: "ne-resize",
          sw: "sw-resize",
          se: "se-resize",
          n: "n-resize",
          s: "s-resize",
          w: "w-resize",
          e: "e-resize",
        };
        canvas.style.cursor = cursors[handle] || "default";
      } else if (cropArea && isInsideCropArea(pos.x, pos.y)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "crosshair";
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
    setStartPoint(null);
  };

  const resetCropArea = () => {
    setCropArea(null);
    showToast("Crop area reset");
  };

  const setFullPageCrop = () => {
    setCropArea({
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
    });
    showToast("Full page selected");
  };

  const applyCrop = () => {
    if (!cropArea) {
      showToast("Please select a crop area first");
      return;
    }

    if (applyToAll) {
      // Apply to all pages
      const newPageCrops: PageCrops = {};
      for (let i = 1; i <= totalPages; i++) {
        newPageCrops[i] = { ...cropArea };
      }
      setPageCrops(newPageCrops);
      showToast(`Crop applied to all ${totalPages} pages`);
    } else {
      // Apply to current page only
      setPageCrops((prev) => ({
        ...prev,
        [currentPage]: { ...cropArea },
      }));
      showToast(`Crop applied to page ${currentPage}`);
    }
  };

  const saveCroppedPdf = async () => {
    if (!pdfFile || Object.keys(pageCrops).length === 0) {
      showToast("Please apply crop to at least one page");
      return;
    }

    setCropping(true);

    try {
      showToast("Cropping PDF...");

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfLibDoc.getPages();

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const crop = pageCrops[pageNum];
        if (!crop) continue;

        const page = pages[pageNum - 1];
        const { height } = page.getSize();

        // Convert canvas coordinates to PDF coordinates
        const pdfCrop = {
          x: crop.x,
          y: height - crop.y - crop.height,
          width: crop.width,
          height: crop.height,
        };

        // Set the crop box
        page.setCropBox(pdfCrop.x, pdfCrop.y, pdfCrop.width, pdfCrop.height);
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      const fileName = pdfFile.name.replace(".pdf", "");
      saveAs(blob, `${fileName}_cropped.pdf`);

      showToast("PDF cropped successfully!");
    } catch (error) {
      console.error("Error cropping PDF:", error);
      showToast("Error cropping PDF");
    } finally {
      setCropping(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageImage("");
    setCropArea(null);
    setPageCrops({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCroppedPagesCount = (): number => {
    return Object.keys(pageCrops).length;
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
            Crop <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Trim and crop your PDF pages to focus on what matters
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
                    {formatFileSize(pdfFile.size)} • {totalPages} pages • {getCroppedPagesCount()} cropped
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={setFullPageCrop}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                        title="Select full page"
                      >
                        <Maximize2 className="w-4 h-4" />
                        Full Page
                      </button>
                      <button
                        onClick={resetCropArea}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                        title="Reset crop"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyToAll}
                          onChange={(e) => setApplyToAll(e.target.checked)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                        />
                        <span className="text-sm text-gray-700">Apply to all pages</span>
                      </label>
                      <button
                        onClick={applyCrop}
                        disabled={!cropArea}
                        className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Apply Crop
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  {/* Page Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {cropArea ? (
                        <span className="text-orange-600 font-medium">
                          Crop: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px
                        </span>
                      ) : (
                        "Drag to select crop area"
                      )}
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
                        {pageCrops[currentPage] && (
                          <span className="ml-2 text-orange-500">✓</span>
                        )}
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

                  {/* Canvas */}
                  <div 
                    ref={containerRef}
                    className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="mx-auto block cursor-crosshair"
                    />
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Drag to create crop area. Use handles to resize. Click and drag inside to move.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCroppedPdf}
                    disabled={cropping || getCroppedPagesCount() === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {cropping ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cropping...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Save Cropped PDF ({getCroppedPagesCount()} pages)
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