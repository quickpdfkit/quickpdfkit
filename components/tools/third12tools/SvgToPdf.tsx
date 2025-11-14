"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  Image as ImageIcon,
  X,
  GripVertical,
  RotateCw,
  Plus,
  Trash2,
  FileImage,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  rotation: number;
}

type PageSize = "A4" | "Letter" | "Legal" | "A3" | "Custom";
type Orientation = "portrait" | "landscape";

export default function SvgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [customWidth, setCustomWidth] = useState(595);
  const [customHeight, setCustomHeight] = useState(842);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const pageSizes: { [key: string]: { width: number; height: number } } = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
    A3: { width: 842, height: 1191 },
  };

  const getPageDimensions = () => {
    const dimensions = pageSize === "Custom" 
      ? { width: customWidth, height: customHeight }
      : pageSizes[pageSize];

    if (orientation === "landscape") {
      return { width: dimensions.height, height: dimensions.width };
    }
    return dimensions;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      showToast("Please upload valid image files");
      return;
    }

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      rotation: 0,
    }));

    setImages(prev => [...prev, ...newImages]);
    showToast(`${validFiles.length} image(s) added`);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
    showToast("Image removed");
  };

  const rotateImage = (id: string) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const rotateCanvas = (canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement => {
    if (degrees === 0) return canvas;

    const rotatedCanvas = document.createElement("canvas");
    const ctx = rotatedCanvas.getContext("2d");
    if (!ctx) return canvas;

    const radians = (degrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    rotatedCanvas.width = canvas.height * sin + canvas.width * cos;
    rotatedCanvas.height = canvas.height * cos + canvas.width * sin;

    ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotatedCanvas;
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      showToast("Please add at least one image");
      return;
    }

    setConverting(true);

    try {
      showToast("Creating PDF...");

      const pdfDoc = await PDFDocument.create();
      const pageDimensions = getPageDimensions();

      for (const imageFile of images) {
        try {
          // Load image
          const img = await loadImage(imageFile.preview);

          // Draw to canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }

          // Rotate if needed
          const finalCanvas = imageFile.rotation !== 0 
            ? rotateCanvas(canvas, imageFile.rotation) 
            : canvas;

          // FIXED: Always convert to PNG format
          const blob = await new Promise<Blob>((resolve, reject) => {
            finalCanvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to create blob"));
                }
              },
              "image/png",
              1.0
            );
          });

          // Embed as PNG (works for all image types after canvas conversion)
          const imageBytes = await blob.arrayBuffer();
          const pdfImage = await pdfDoc.embedPng(imageBytes);

          // Create page
          const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);

          // Calculate scaling to fit image on page
          const imageAspect = pdfImage.width / pdfImage.height;
          const pageAspect = pageDimensions.width / pageDimensions.height;

          let drawWidth, drawHeight, x, y;

          if (imageAspect > pageAspect) {
            // Image is wider than page
            drawWidth = pageDimensions.width - 40; // 20px margin on each side
            drawHeight = drawWidth / imageAspect;
            x = 20;
            y = (pageDimensions.height - drawHeight) / 2;
          } else {
            // Image is taller than page
            drawHeight = pageDimensions.height - 40;
            drawWidth = drawHeight * imageAspect;
            x = (pageDimensions.width - drawWidth) / 2;
            y = 20;
          }

          page.drawImage(pdfImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          });

        } catch (error) {
          console.error(`Error processing image ${imageFile.file.name}:`, error);
          showToast(`Error processing ${imageFile.file.name}`);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      saveAs(blob, `images_${Date.now()}.pdf`);
      showToast("PDF created successfully!");

      // Reset after short delay
      setTimeout(() => {
        resetAll();
      }, 2000);

    } catch (error) {
      console.error("Error creating PDF:", error);
      showToast("Error creating PDF. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const resetAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAll = () => {
    if (images.length === 0) return;
    
    if (confirm(`Remove all ${images.length} images?`)) {
      resetAll();
      showToast("All images removed");
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <FileImage className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            SVG to <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert SVG image to PDF documents
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          <label
            htmlFor="image-upload"
            className="w-full p-8 sm:p-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl bg-white cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group mb-6"
          >
            <div className="p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-all duration-300">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
            </div>
            <div className="text-center">
              <span className="text-gray-900 text-base sm:text-lg font-medium block">
                Click to upload or drag & drop
              </span>
              <span className="text-gray-500 text-xs sm:text-sm mt-1 block">
                SVG files supported
              </span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>

        {images.length > 0 && (
          <div className="space-y-6">
            {/* Settings Panel */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                    <option value="Legal">Legal (8.5 × 14 in)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as Orientation)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Image Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Images
                  </label>
                  <div className="flex items-center gap-2 h-10">
                    <span className="text-2xl font-bold text-orange-500">{images.length}</span>
                    <span className="text-sm text-gray-600">image{images.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Custom Size */}
              {pageSize === "Custom" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Images List */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Images ({images.length})
                </h3>
                <div className="flex gap-2">
                  <label
                    htmlFor="add-more"
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add More
                  </label>
                  <input
                    id="add-more"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-2 transition-all ${
                      draggedIndex === index ? "border-orange-500 opacity-50" : "border-gray-200"
                    } hover:border-orange-300`}
                  >
                    {/* Drag Handle */}
                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Preview */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-full object-cover rounded-lg border border-gray-300"
                        style={{ transform: `rotate(${image.rotation}deg)` }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(image.file.size / 1024).toFixed(2)} KB
                        {image.rotation !== 0 && ` • Rotated ${image.rotation}°`}
                      </p>
                    </div>

                    {/* Order */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        disabled={index === images.length - 1}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rotateImage(image.id)}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-all"
                        title="Rotate"
                      >
                        <RotateCw className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 transition-all"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Drag and drop images to reorder them. Each image will become a separate page in the PDF.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetAll}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={convertToPdf}
                disabled={converting || images.length === 0}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {converting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to PDF ({images.length} pages)
                  </>
                )}
              </button>
            </div>
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