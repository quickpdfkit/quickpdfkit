"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Pencil, 
  Eraser, 
  Type, 
  Minus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Undo,
  ZoomIn,
  ZoomOut,
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

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  type: "draw" | "line" | "text";
  text?: string;
}

interface PageAnnotations {
  [pageNumber: number]: Stroke[];
}

export default function PdfStrokeAnnotator() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"draw" | "line" | "text" | "eraser">("draw");
  const [color, setColor] = useState("#ff6b35");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [annotations, setAnnotations] = useState<PageAnnotations>({});
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  }, [pageImage, annotations, currentPage, scale]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = pageImage;
    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw all annotations for current page
      const pageStrokes = annotations[currentPage] || [];
      pageStrokes.forEach((stroke) => {
        if (stroke.type === "text" && stroke.text) {
          ctx.font = `${stroke.width * 5}px Arial`;
          ctx.fillStyle = stroke.color;
          ctx.fillText(stroke.text, stroke.points[0].x * scale, stroke.points[0].y * scale);
        } else {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          stroke.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x * scale, point.y * scale);
            } else {
              ctx.lineTo(point.x * scale, point.y * scale);
            }
          });
          ctx.stroke();
        }
      });
    };
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === "text") {
      setTextPosition(pos);
      return;
    }

    if (tool === "eraser") {
      // Find and remove strokes near the click point
      const pageStrokes = annotations[currentPage] || [];
      const newStrokes = pageStrokes.filter((stroke) => {
        return !stroke.points.some((point) => {
          const distance = Math.sqrt(
            Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)
          );
          return distance < 20;
        });
      });
      
      setAnnotations((prev) => ({
        ...prev,
        [currentPage]: newStrokes,
      }));
      return;
    }

    setIsDrawing(true);
    setCurrentStroke([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    setCurrentStroke((prev) => [...prev, pos]);

    // Draw temporary stroke
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    redrawCanvas();

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    [...currentStroke, pos].forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x * scale, point.y * scale);
      } else {
        ctx.lineTo(point.x * scale, point.y * scale);
      }
    });
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentStroke.length === 0) return;

    const newStroke: Stroke = {
      points: tool === "line" ? [currentStroke[0], currentStroke[currentStroke.length - 1]] : currentStroke,
      color,
      width: strokeWidth,
      type: tool === "line" ? "line" : "draw",
    };

    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newStroke],
    }));

    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const addTextAnnotation = () => {
    if (!textInput || !textPosition) return;

    const newStroke: Stroke = {
      points: [textPosition],
      color,
      width: strokeWidth,
      type: "text",
      text: textInput,
    };

    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newStroke],
    }));

    setTextInput("");
    setTextPosition(null);
    showToast("Text added");
  };

  const clearCurrentPage = () => {
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [],
    }));
    showToast("Page annotations cleared");
  };

  const undoLastStroke = () => {
    const pageStrokes = annotations[currentPage] || [];
    if (pageStrokes.length === 0) return;

    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: pageStrokes.slice(0, -1),
    }));
    showToast("Undone");
  };

  const savePdfWithAnnotations = async () => {
    if (!pdfFile || !pdfDoc) return;

    setSaving(true);

    try {
      showToast("Saving annotations...");

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfLibDoc.getPages();

      // Add annotations to each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageStrokes = annotations[pageNum] || [];
        if (pageStrokes.length === 0) continue;

        const page = pages[pageNum - 1];
        const { height } = page.getSize();

        pageStrokes.forEach((stroke) => {
          if (stroke.type === "text" && stroke.text) {
            page.drawText(stroke.text, {
              x: stroke.points[0].x,
              y: height - stroke.points[0].y,
              size: stroke.width * 5,
              color: hexToRgb(stroke.color),
            });
          } else {
            // Draw stroke paths
            for (let i = 0; i < stroke.points.length - 1; i++) {
              const start = stroke.points[i];
              const end = stroke.points[i + 1];

              page.drawLine({
                start: { x: start.x, y: height - start.y },
                end: { x: end.x, y: height - end.y },
                thickness: stroke.width,
                color: hexToRgb(stroke.color),
              });
            }
          }
        });
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      const fileName = pdfFile.name.replace(".pdf", "");
      saveAs(blob, `${fileName}_annotated.pdf`);

      showToast("PDF saved with annotations!");
    } catch (error) {
      console.error("Error saving PDF:", error);
      showToast("Error saving PDF");
    } finally {
      setSaving(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        )
      : rgb(0, 0, 0);
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageImage("");
    setAnnotations({});
    setCurrentStroke([]);
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
            Annotate <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Draw, write, and add annotations to your PDF documents
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
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            )}

            {!loading && pdfDoc && (
              <>
                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Tools */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTool("draw")}
                        className={`p-3 rounded-lg transition-all ${
                          tool === "draw"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Draw"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setTool("line")}
                        className={`p-3 rounded-lg transition-all ${
                          tool === "line"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Line"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setTool("text")}
                        className={`p-3 rounded-lg transition-all ${
                          tool === "text"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Text"
                      >
                        <Type className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setTool("eraser")}
                        className={`p-3 rounded-lg transition-all ${
                          tool === "eraser"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Eraser"
                      >
                        <Eraser className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Color and Width */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Color:</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Size:</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={strokeWidth}
                          onChange={(e) => setStrokeWidth(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-700 w-6">{strokeWidth}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={undoLastStroke}
                        className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        title="Undo"
                      >
                        <Undo className="w-5 h-5" />
                      </button>
                      <button
                        onClick={clearCurrentPage}
                        className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        title="Clear page"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  {/* Zoom and Page Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-5 h-5 text-gray-700" />
                      </button>
                      <span className="text-sm text-gray-700 w-16 text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <button
                        onClick={() => setScale(Math.min(2, scale + 0.1))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-5 h-5 text-gray-700" />
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
                      <span className="text-sm text-gray-700">
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

                  {/* Canvas */}
                  <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="cursor-crosshair mx-auto block"
                    />
                  </div>
                </div>

                {/* Text Input Modal */}
                {textPosition && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Add Text
                      </h3>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter text..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        autoFocus
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => {
                            setTextPosition(null);
                            setTextInput("");
                          }}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addTextAnnotation}
                          className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePdfWithAnnotations}
                    disabled={saving || Object.keys(annotations).length === 0}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Save Annotated PDF
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