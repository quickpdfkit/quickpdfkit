"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  ChevronLeft,
  ChevronRight,
  PenTool,
  Image as ImageIcon,
  Type,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
  FileText,
  X,
  Check,
  RotateCcw,
  MousePointer2,
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

interface SignaturePosition {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signatureData: string; // Base64 image
  type: "draw" | "image" | "text";
  text?: string;
}

type Mode = "place" | "draw" | "type" | "select";

export default function SignPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLibDoc, setPdfLibDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string>("");
  const [pageScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Signature states
  const [mode, setMode] = useState<Mode>("select");
  const [signatures, setSignatures] = useState<SignaturePosition[]>([]);
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
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

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

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
    drawSignatures();
  }, [pageImage, signatures, zoom, currentPage, selectedSignature]);

  const drawSignatures = () => {
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

        const pageSignatures = signatures.filter(s => s.pageNumber === currentPage);
        
        pageSignatures.forEach(signature => {
          ctx.save();
          ctx.scale(zoom, zoom);

          // Draw signature
          if (signature.type === "draw" || signature.type === "image") {
            const sigImg = new Image();
            sigImg.src = signature.signatureData;
            sigImg.onload = () => {
              ctx.drawImage(
                sigImg,
                signature.x,
                signature.y,
                signature.width,
                signature.height
              );

              // Draw selection border if selected
              if (selectedSignature === signature.id) {
                ctx.strokeStyle = "#FF6B35";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  signature.x,
                  signature.y,
                  signature.width,
                  signature.height
                );

                // Draw resize handles
                const handleSize = 8;
                ctx.fillStyle = "#FF6B35";
                // Top-left
                ctx.fillRect(signature.x - handleSize/2, signature.y - handleSize/2, handleSize, handleSize);
                // Top-right
                ctx.fillRect(signature.x + signature.width - handleSize/2, signature.y - handleSize/2, handleSize, handleSize);
                // Bottom-left
                ctx.fillRect(signature.x - handleSize/2, signature.y + signature.height - handleSize/2, handleSize, handleSize);
                // Bottom-right
                ctx.fillRect(signature.x + signature.width - handleSize/2, signature.y + signature.height - handleSize/2, handleSize, handleSize);
              }
            };
          } else if (signature.type === "text") {
            ctx.fillStyle = "#000000";
            ctx.font = `${signature.height}px "Brush Script MT", cursive`;
            ctx.fillText(signature.text || "", signature.x, signature.y + signature.height);

            // Draw selection border if selected
            if (selectedSignature === signature.id) {
              ctx.strokeStyle = "#FF6B35";
              ctx.lineWidth = 2;
              ctx.strokeRect(
                signature.x,
                signature.y,
                signature.width,
                signature.height
              );
            }
          }

          ctx.restore();
        });
      }
    };
  };

  // Signature Pad Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignaturePad = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL("image/png");
    setCurrentSignature(signatureData);
    setShowSignaturePad(false);
    setMode("place");
    showToast("Click on the PDF to place your signature");
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const signatureData = event.target?.result as string;
      setCurrentSignature(signatureData);
      setMode("place");
      showToast("Click on the PDF to place your signature");
    };
    reader.readAsDataURL(file);
  };

  const createTextSignature = () => {
    if (!signatureText.trim()) {
      showToast("Please enter your signature text");
      return;
    }

    // Create canvas with text
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.font = '48px "Brush Script MT", cursive';
      ctx.textBaseline = "middle";
      ctx.fillText(signatureText, 20, canvas.height / 2);
    }

    const signatureData = canvas.toDataURL("image/png");
    setCurrentSignature(signatureData);
    setShowTextInput(false);
    setMode("place");
    showToast("Click on the PDF to place your signature");
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (mode === "place" && currentSignature) {
      // Place signature
      const newSignature: SignaturePosition = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        x: pos.x - 75,
        y: pos.y - 37.5,
        width: 150,
        height: 75,
        signatureData: currentSignature,
        type: signatureText ? "text" : "draw",
        text: signatureText,
      };

      setSignatures([...signatures, newSignature]);
      setCurrentSignature("");
      setSignatureText("");
      setMode("select");
      showToast("Signature placed! You can drag to reposition or resize.");
    } else if (mode === "select") {
      // Check if clicked on a signature
      const clickedSignature = signatures.find(sig => {
        if (sig.pageNumber !== currentPage) return false;
        return (
          pos.x >= sig.x &&
          pos.x <= sig.x + sig.width &&
          pos.y >= sig.y &&
          pos.y <= sig.y + sig.height
        );
      });

      if (clickedSignature) {
        setSelectedSignature(clickedSignature.id);
      } else {
        setSelectedSignature(null);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "select") return;

    const pos = getMousePos(e);
    const signature = signatures.find(sig => 
      sig.id === selectedSignature && sig.pageNumber === currentPage
    );

    if (!signature) return;

    // Check if clicking on resize handle
    const handleSize = 8 / zoom;
    const handles = [
      { x: signature.x, y: signature.y, cursor: "nw-resize" },
      { x: signature.x + signature.width, y: signature.y, cursor: "ne-resize" },
      { x: signature.x, y: signature.y + signature.height, cursor: "sw-resize" },
      { x: signature.x + signature.width, y: signature.y + signature.height, cursor: "se-resize" },
    ];

    for (const handle of handles) {
      if (
        pos.x >= handle.x - handleSize &&
        pos.x <= handle.x + handleSize &&
        pos.y >= handle.y - handleSize &&
        pos.y <= handle.y + handleSize
      ) {
        setIsResizing(true);
        return;
      }
    }

    // Start dragging
    if (
      pos.x >= signature.x &&
      pos.x <= signature.x + signature.width &&
      pos.y >= signature.y &&
      pos.y <= signature.y + signature.height
    ) {
      setIsDragging(true);
      setDragOffset({
        x: pos.x - signature.x,
        y: pos.y - signature.y,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedSignature) return;

    const pos = getMousePos(e);
    const signature = signatures.find(sig => sig.id === selectedSignature);

    if (!signature) return;

    if (isDragging) {
      const newSignatures = signatures.map(sig => {
        if (sig.id === selectedSignature) {
          return {
            ...sig,
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y,
          };
        }
        return sig;
      });
      setSignatures(newSignatures);
    } else if (isResizing) {
      const newSignatures = signatures.map(sig => {
        if (sig.id === selectedSignature) {
          const newWidth = Math.max(50, pos.x - sig.x);
          const newHeight = Math.max(25, pos.y - sig.y);
          return {
            ...sig,
            width: newWidth,
            height: newHeight,
          };
        }
        return sig;
      });
      setSignatures(newSignatures);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const deleteSelectedSignature = () => {
    if (!selectedSignature) return;

    setSignatures(signatures.filter(sig => sig.id !== selectedSignature));
    setSelectedSignature(null);
    showToast("Signature removed");
  };

  const savePdf = async () => {
    if (!pdfLibDoc || signatures.length === 0) {
      showToast(signatures.length === 0 ? "Please add at least one signature" : "No PDF loaded");
      return;
    }

    setSaving(true);

    try {
      showToast("Saving signed PDF...");

      const pdfDoc = await PDFDocument.create();
      const pages = pdfLibDoc.getPages();

      for (let i = 0; i < totalPages; i++) {
        const [copiedPage] = await pdfDoc.copyPages(pdfLibDoc, [i]);
        pdfDoc.addPage(copiedPage);

        const page = pdfDoc.getPages()[i];
        const { width, height } = page.getSize();

        const pageSignatures = signatures.filter(s => s.pageNumber === i + 1);

        for (const signature of pageSignatures) {
          try {
            // Convert base64 to bytes
            const imageBytes = await fetch(signature.signatureData).then(res => res.arrayBuffer());
            
            let image;
            if (signature.signatureData.startsWith("data:image/png")) {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              image = await pdfDoc.embedJpg(imageBytes);
            }

            const pdfX = signature.x / pageScale;
            const pdfY = height - (signature.y / pageScale) - (signature.height / pageScale);

            page.drawImage(image, {
              x: pdfX,
              y: pdfY,
              width: signature.width / pageScale,
              height: signature.height / pageScale,
            });
          } catch (error) {
            console.error("Error embedding signature:", error);
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
         const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
        const blob = new Blob([safeBytes], { type: "application/pdf" });
      const fileName = pdfFile?.name.replace(".pdf", "") || "document";
      saveAs(blob, `${fileName}_signed.pdf`);

      showToast("PDF signed successfully!");

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
    setSignatures([]);
    setCurrentSignature("");
    setSelectedSignature(null);
    setMode("select");
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
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-gray-900">
            Sign <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Add your signature to PDF documents
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
                  <p className="text-gray-900 font-semibold text-sm">{pdfFile.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages • {signatures.length} signature(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={savePdf}
                  disabled={saving || signatures.length === 0}
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
                      Save Signed PDF
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
                    {/* Signature Actions */}
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                        mode === "draw"
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <PenTool className="w-4 h-4" />
                      Draw Signature
                    </button>

                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureImageUpload}
                    />
                    <button
                      onClick={() => signatureInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Image
                    </button>

                    <button
                      onClick={() => setShowTextInput(true)}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 text-sm"
                    >
                      <Type className="w-4 h-4" />
                      Type Signature
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    {/* Delete */}
                    <button
                      onClick={deleteSelectedSignature}
                      disabled={!selectedSignature}
                      className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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

                  {/* Mode indicator */}
                  {mode === "place" && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                      <MousePointer2 className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-900">
                        Click on the PDF where you want to place your signature
                      </span>
                    </div>
                  )}
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
                            onClick={handleCanvasClick}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                            className={`absolute top-0 left-0 ${
                              mode === "place" ? "cursor-crosshair" : "cursor-pointer"
                            }`}
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
                    {signatures.filter(s => s.pageNumber === currentPage).length > 0 && (
                      <span className="ml-2 text-orange-500">
                        ({signatures.filter(s => s.pageNumber === currentPage).length} signature(s))
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Draw Your Signature</h3>
              <button
                onClick={() => setShowSignaturePad(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="border-2 border-gray-300 rounded-lg bg-white mb-4">
              <canvas
                ref={signatureCanvasRef}
                width={700}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSignaturePad}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={saveDrawnSignature}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Use Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Signature Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Type Your Signature</h3>
              <button
                onClick={() => setShowTextInput(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />

            <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 min-h-[80px] flex items-center justify-center">
              <span
                style={{ fontFamily: '"Brush Script MT", cursive' }}
                className="text-4xl text-gray-900"
              >
                {signatureText || "Your signature preview"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createTextSignature}
                disabled={!signatureText.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Use Signature
              </button>
            </div>
          </div>
        </div>
      )}

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