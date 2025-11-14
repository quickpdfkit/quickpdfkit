"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Type,
  Pen,
  Highlighter,
  Square,
  Circle,
  Minus,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
  MousePointer,
  FileText,
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

type Tool =
  | "select"
  | "text"
  | "pen"
  | "highlighter"
  | "rectangle"
  | "circle"
  | "line"
  | "eraser";

interface Annotation {
  id: string;
  type: Tool;
  pageNumber: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  fontSize?: number;
  lineWidth?: number;
}

export default function EditPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLibDoc, setPdfLibDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string>("");
  const [pageScale, setPageScale] = useState(2); // Scale used for rendering
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Drawing states
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [fontSize, setFontSize] = useState(16);
  const [lineWidth, setLineWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      const viewport = page.getViewport({ scale: pageScale });

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
      const pdfLibBuffer = arrayBuffer.slice(0);

      // Load with pdf.js for rendering
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

      // Load with pdf-lib for editing/saving
      const pdfLib = await PDFDocument.load(pdfLibBuffer);
      setPdfLibDoc(pdfLib);

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
    drawAnnotations();
  }, [pageImage, annotations, zoom, currentPage]);

  const drawAnnotations = () => {
    const canvas = overlayCanvasRef.current;
    const img = new Image();
    img.src = pageImage;

    img.onload = () => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width * zoom;
        canvas.height = img.height * zoom;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all annotations for current page
        const pageAnnotations = annotations.filter(
          (a) => a.pageNumber === currentPage
        );

        pageAnnotations.forEach((annotation) => {
          ctx.save();
          ctx.scale(zoom, zoom);

          switch (annotation.type) {
            case "text":
              ctx.fillStyle = annotation.color;
              ctx.font = `${annotation.fontSize}px Arial`;
              ctx.fillText(annotation.text || "", annotation.x, annotation.y);
              break;

            case "pen":
              if (annotation.points && annotation.points.length > 1) {
                ctx.strokeStyle = annotation.color;
                ctx.lineWidth = annotation.lineWidth || 2;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
                annotation.points.forEach((point) => {
                  ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
              }
              break;

            case "highlighter":
              if (annotation.points && annotation.points.length > 1) {
                ctx.globalAlpha = 0.3;
                ctx.strokeStyle = annotation.color;
                ctx.lineWidth = annotation.lineWidth || 20;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
                annotation.points.forEach((point) => {
                  ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
              break;

            case "rectangle":
              ctx.strokeStyle = annotation.color;
              ctx.lineWidth = annotation.lineWidth || 2;
              ctx.strokeRect(
                annotation.x,
                annotation.y,
                annotation.width || 0,
                annotation.height || 0
              );
              break;

            case "circle":
              ctx.strokeStyle = annotation.color;
              ctx.lineWidth = annotation.lineWidth || 2;
              ctx.beginPath();
              const radius =
                Math.sqrt(
                  Math.pow(annotation.width || 0, 2) +
                    Math.pow(annotation.height || 0, 2)
                ) / 2;
              ctx.arc(
                annotation.x + (annotation.width || 0) / 2,
                annotation.y + (annotation.height || 0) / 2,
                radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();
              break;

            case "line":
              ctx.strokeStyle = annotation.color;
              ctx.lineWidth = annotation.lineWidth || 2;
              ctx.beginPath();
              ctx.moveTo(annotation.x, annotation.y);
              ctx.lineTo(
                annotation.x + (annotation.width || 0),
                annotation.y + (annotation.height || 0)
              );
              ctx.stroke();
              break;
          }

          ctx.restore();
        });
      }
    };
  };

  const getMousePos = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "select") return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "text",
          pageNumber: currentPage,
          x: pos.x,
          y: pos.y,
          text,
          color: selectedColor,
          fontSize,
        };
        addAnnotation(newAnnotation);
      }
      setIsDrawing(false);
      return;
    }

    if (selectedTool === "eraser") {
      const annotationToRemove = annotations.find((a) => {
        if (a.pageNumber !== currentPage) return false;
        const distance = Math.sqrt(
          Math.pow(a.x - pos.x, 2) + Math.pow(a.y - pos.y, 2)
        );
        return distance < 20;
      });

      if (annotationToRemove) {
        removeAnnotation(annotationToRemove.id);
      }
      setIsDrawing(false);
      return;
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      pageNumber: currentPage,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      points:
        selectedTool === "pen" || selectedTool === "highlighter"
          ? [pos]
          : undefined,
      color: selectedColor,
      lineWidth,
    };

    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const pos = getMousePos(e);

    if (
      currentAnnotation.type === "pen" ||
      currentAnnotation.type === "highlighter"
    ) {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...(currentAnnotation.points || []), pos],
      });
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: pos.x - currentAnnotation.x,
        height: pos.y - currentAnnotation.y,
      });
    }

    const tempAnnotations = [...annotations, currentAnnotation];
    drawTempAnnotations(tempAnnotations);
  };

  const handleMouseUp = () => {
    if (currentAnnotation && isDrawing) {
      addAnnotation(currentAnnotation);
      setCurrentAnnotation(null);
    }
    setIsDrawing(false);
  };

  const drawTempAnnotations = (tempAnnotations: Annotation[]) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !pageImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = pageImage;

    img.onload = () => {
      canvas.width = img.width * zoom;
      canvas.height = img.height * zoom;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pageAnnotations = tempAnnotations.filter(
        (a) => a.pageNumber === currentPage
      );

      pageAnnotations.forEach((annotation) => {
        ctx.save();
        ctx.scale(zoom, zoom);

        switch (annotation.type) {
          case "pen":
            if (annotation.points && annotation.points.length > 1) {
              ctx.strokeStyle = annotation.color;
              ctx.lineWidth = annotation.lineWidth || 2;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
              annotation.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
            }
            break;

          case "highlighter":
            if (annotation.points && annotation.points.length > 1) {
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = annotation.color;
              ctx.lineWidth = annotation.lineWidth || 20;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
              annotation.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
            break;

          case "rectangle":
            ctx.strokeStyle = annotation.color;
            ctx.lineWidth = annotation.lineWidth || 2;
            ctx.strokeRect(
              annotation.x,
              annotation.y,
              annotation.width || 0,
              annotation.height || 0
            );
            break;

          case "circle":
            ctx.strokeStyle = annotation.color;
            ctx.lineWidth = annotation.lineWidth || 2;
            ctx.beginPath();
            const radius =
              Math.sqrt(
                Math.pow(annotation.width || 0, 2) +
                  Math.pow(annotation.height || 0, 2)
              ) / 2;
            ctx.arc(
              annotation.x + (annotation.width || 0) / 2,
              annotation.y + (annotation.height || 0) / 2,
              radius,
              0,
              2 * Math.PI
            );
            ctx.stroke();
            break;

          case "line":
            ctx.strokeStyle = annotation.color;
            ctx.lineWidth = annotation.lineWidth || 2;
            ctx.beginPath();
            ctx.moveTo(annotation.x, annotation.y);
            ctx.lineTo(
              annotation.x + (annotation.width || 0),
              annotation.y + (annotation.height || 0)
            );
            ctx.stroke();
            break;
        }

        ctx.restore();
      });
    };
  };

  const addAnnotation = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const removeAnnotation = (id: string) => {
    const newAnnotations = annotations.filter((a) => a.id !== id);
    setAnnotations(newAnnotations);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  };

  const clearAllAnnotations = () => {
    if (confirm("Clear all annotations on this page?")) {
      const newAnnotations = annotations.filter(
        (a) => a.pageNumber !== currentPage
      );
      setAnnotations(newAnnotations);
      showToast("Annotations cleared");
    }
  };

  // Helper to convert hex color to RGB
  const hexToRgb = (
    hex: string
  ): { r: number; g: number; b: number } | null => {
    const colorMatch = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (colorMatch) {
      return {
        r: parseInt(colorMatch[1], 16) / 255,
        g: parseInt(colorMatch[2], 16) / 255,
        b: parseInt(colorMatch[3], 16) / 255,
      };
    }
    return null;
  };

  const savePdf = async () => {
    if (!pdfLibDoc) {
      showToast("No PDF loaded");
      return;
    }

    setSaving(true);

    try {
      showToast("Saving PDF with annotations...");

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Copy all pages from original
      const pages = pdfLibDoc.getPages();

      for (let i = 0; i < totalPages; i++) {
        const [copiedPage] = await pdfDoc.copyPages(pdfLibDoc, [i]);
        pdfDoc.addPage(copiedPage);

        const page = pdfDoc.getPages()[i];
        const { width, height } = page.getSize();

        // Get annotations for this page
        const pageAnnotations = annotations.filter(
          (a) => a.pageNumber === i + 1
        );

        // Scale factor: canvas coordinates to PDF coordinates
        const scaleX = width / (pageImage ? new Image().width : width);
        const scaleY = height / (pageImage ? new Image().height : height);

        // Draw each annotation on the PDF
        for (const annotation of pageAnnotations) {
          const color = hexToRgb(annotation.color);
          if (!color) continue;

          // PDF coordinate system: (0,0) is bottom-left
          const pdfX = annotation.x / pageScale;
          const pdfY = height - annotation.y / pageScale;

          switch (annotation.type) {
            case "text":
              try {
                page.drawText(annotation.text || "", {
                  x: pdfX,
                  y: pdfY,
                  size: (annotation.fontSize || 16) / pageScale,
                  color: rgb(color.r, color.g, color.b),
                });
              } catch (error) {
                console.error("Error drawing text:", error);
              }
              break;

            case "rectangle":
              try {
                const rectWidth = (annotation.width || 0) / pageScale;
                const rectHeight = (annotation.height || 0) / pageScale;

                page.drawRectangle({
                  x: pdfX,
                  y: pdfY - rectHeight,
                  width: rectWidth,
                  height: rectHeight,
                  borderColor: rgb(color.r, color.g, color.b),
                  borderWidth: (annotation.lineWidth || 2) / pageScale,
                });
              } catch (error) {
                console.error("Error drawing rectangle:", error);
              }
              break;

            case "circle":
              try {
                const radius =
                  Math.sqrt(
                    Math.pow((annotation.width || 0) / pageScale, 2) +
                      Math.pow((annotation.height || 0) / pageScale, 2)
                  ) / 2;

                page.drawCircle({
                  x: pdfX + (annotation.width || 0) / pageScale / 2,
                  y: pdfY - (annotation.height || 0) / pageScale / 2,
                  size: radius,
                  borderColor: rgb(color.r, color.g, color.b),
                  borderWidth: (annotation.lineWidth || 2) / pageScale,
                });
              } catch (error) {
                console.error("Error drawing circle:", error);
              }
              break;

            case "line":
              try {
                const endX = pdfX + (annotation.width || 0) / pageScale;
                const endY = pdfY - (annotation.height || 0) / pageScale;

                page.drawLine({
                  start: { x: pdfX, y: pdfY },
                  end: { x: endX, y: endY },
                  thickness: (annotation.lineWidth || 2) / pageScale,
                  color: rgb(color.r, color.g, color.b),
                });
              } catch (error) {
                console.error("Error drawing line:", error);
              }
              break;

            case "pen":
            case "highlighter":
              // Draw pen/highlighter as series of small lines
              if (annotation.points && annotation.points.length > 1) {
                try {
                  const opacity = annotation.type === "highlighter" ? 0.3 : 1.0;
                  const thickness =
                    annotation.type === "highlighter"
                      ? (annotation.lineWidth || 20) / pageScale
                      : (annotation.lineWidth || 2) / pageScale;

                  for (let j = 0; j < annotation.points.length - 1; j++) {
                    const point1 = annotation.points[j];
                    const point2 = annotation.points[j + 1];

                    page.drawLine({
                      start: {
                        x: point1.x / pageScale,
                        y: height - point1.y / pageScale,
                      },
                      end: {
                        x: point2.x / pageScale,
                        y: height - point2.y / pageScale,
                      },
                      thickness: thickness,
                      color: rgb(color.r, color.g, color.b),
                      opacity: opacity,
                    });
                  }
                } catch (error) {
                  console.error("Error drawing pen/highlighter:", error);
                }
              }
              break;
          }
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const fileName = pdfFile?.name.replace(".pdf", "") || "document";
      saveAs(blob, `${fileName}_edited.pdf`);

      showToast("PDF saved successfully with all annotations!");
    } catch (error) {
      console.error("Error saving PDF:", error);
      showToast("Error saving PDF. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setPdfLibDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageImage("");
    setAnnotations([]);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "pen", icon: Pen, label: "Pen" },
    { id: "highlighter", icon: Highlighter, label: "Highlighter" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  const colors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#000000", // Black
    "#FFFFFF", // White
    "#FFA500", // Orange
    "#800080", // Purple
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex flex-col items-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gray-900">
            Edit <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Add annotations, text, and drawings to your PDF
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
            {/* File Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">
                    {pdfFile.name}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={savePdf}
                  disabled={saving || annotations.length === 0}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save PDF
                    </>
                  )}
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all"
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
                <div className="border-b border-gray-200 p-3 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tools */}
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => setSelectedTool(tool.id)}
                          className={`p-2 rounded-lg transition-all ${
                            selectedTool === tool.id
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                          title={tool.label}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    {/* Color Picker */}
                    <div className="flex gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded border-2 transition-all ${
                            selectedColor === color
                              ? "border-orange-500 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    {/* Font/Line Size */}
                    {(selectedTool === "text" ||
                      selectedTool === "pen" ||
                      selectedTool === "highlighter") && (
                      <>
                        <select
                          value={selectedTool === "text" ? fontSize : lineWidth}
                          onChange={(e) => {
                            if (selectedTool === "text") {
                              setFontSize(Number(e.target.value));
                            } else {
                              setLineWidth(Number(e.target.value));
                            }
                          }}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                        >
                          {selectedTool === "text" ? (
                            <>
                              <option value="12">12pt</option>
                              <option value="14">14pt</option>
                              <option value="16">16pt</option>
                              <option value="18">18pt</option>
                              <option value="20">20pt</option>
                              <option value="24">24pt</option>
                            </>
                          ) : (
                            <>
                              <option value="1">Thin</option>
                              <option value="2">Normal</option>
                              <option value="4">Thick</option>
                              <option value="6">Extra Thick</option>
                            </>
                          )}
                        </select>
                        <div className="h-6 w-px bg-gray-300 mx-1" />
                      </>
                    )}

                    {/* Undo/Redo */}
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Undo"
                    >
                      <Undo className="w-5 h-5" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Redo"
                    >
                      <Redo className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    {/* Clear */}
                    <button
                      onClick={clearAllAnnotations}
                      disabled={
                        annotations.filter((a) => a.pageNumber === currentPage)
                          .length === 0
                      }
                      className="p-2 rounded-lg bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Clear page"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      {/* Zoom */}
                      <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                        disabled={zoom <= 0.5}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-700 min-w-[50px] text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                        disabled={zoom >= 2}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div
                  ref={containerRef}
                  className="overflow-auto bg-gray-100 p-4"
                  style={{ height: "calc(100vh - 400px)", minHeight: "400px" }}
                >
                  <div className="flex items-center justify-center min-h-full">
                    <div className="relative inline-block">
                      {pageImage && (
                        <>
                          <canvas
                            ref={canvasRef}
                            style={{
                              display: "none",
                            }}
                          />
                          <img
                            src={pageImage}
                            alt={`Page ${currentPage}`}
                            className="shadow-2xl"
                            style={{
                              transform: `scale(${zoom})`,
                              transformOrigin: "top left",
                            }}
                          />
                          <canvas
                            ref={overlayCanvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className="absolute top-0 left-0 cursor-crosshair"
                            style={{
                              transformOrigin: "top left",
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="border-t border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-sm text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                    {annotations.filter((a) => a.pageNumber === currentPage)
                      .length > 0 && (
                      <span className="ml-2 text-orange-500">
                        (
                        {
                          annotations.filter(
                            (a) => a.pageNumber === currentPage
                          ).length
                        }{" "}
                        annotations)
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
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
