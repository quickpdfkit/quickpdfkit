"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  Upload,
  Download,
  FileText,
  Type,
  Settings,
  ImagePlus,
} from "lucide-react";

export default function PdfWatermark() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [textColor, setTextColor] = useState("#FF6B35");
  const [textSize, setTextSize] = useState(48);
  const [textOpacity, setTextOpacity] = useState(30);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imageOpacity, setImageOpacity] = useState(30);
  const [position, setPosition] = useState<"center" | "diagonal" | "tiled">(
    "diagonal"
  );
  const [rotation, setRotation] = useState(-45);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleFileUpload = (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    showToast("PDF loaded successfully");
  };

  const handleImageUpload = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file");
      return;
    }

    setWatermarkImage(file);
    showToast("Watermark image loaded successfully");
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 1, g: 0, b: 0 };
  };

  const addWatermarkToPdf = async () => {
    if (!pdfFile) return;

    if (watermarkType === "text" && !watermarkText.trim()) {
      showToast("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      showToast("Please upload a watermark image");
      return;
    }

    setProcessing(true);
    showToast("Adding watermark to PDF...");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (watermarkType === "text") {
        const color = hexToRgb(textColor);

        for (const page of pages) {
          const { width, height } = page.getSize();

          if (position === "center") {
            page.drawText(watermarkText, {
              x: width / 2 - (watermarkText.length * textSize) / 4,
              y: height / 2,
              size: textSize,
              color: rgb(color.r, color.g, color.b),
              opacity: textOpacity / 100,
            });
          } else if (position === "diagonal") {
            page.drawText(watermarkText, {
              x: width / 2 - (watermarkText.length * textSize) / 4,
              y: height / 2,
              size: textSize,
              color: rgb(color.r, color.g, color.b),
              opacity: textOpacity / 100,
              rotate: degrees(rotation),
            });
          } else if (position === "tiled") {
            const textWidth = watermarkText.length * textSize * 0.6;
            const textHeight = textSize;
            const spacingX = textWidth + 50;
            const spacingY = textHeight + 50;

            for (let x = -spacingX; x < width + spacingX; x += spacingX) {
              for (let y = -spacingY; y < height + spacingY; y += spacingY) {
                page.drawText(watermarkText, {
                  x: x,
                  y: y,
                  size: textSize,
                  color: rgb(color.r, color.g, color.b),
                  opacity: textOpacity / 100,
                  rotate: degrees(rotation),
                });
              }
            }
          }
        }
      } else if (watermarkType === "image" && watermarkImage) {
        const imageBytes = await watermarkImage.arrayBuffer();
        let image;

        const mimeType = watermarkImage.type;

        if (mimeType === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (mimeType === "image/jpeg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          showToast("Unsupported image format. Please upload PNG or JPEG.");
          setProcessing(false);
          return;
        }

        const imageDims = image.scale(0.3); // Scale image to 30% of original size

        for (const page of pages) {
          const { width, height } = page.getSize();

          if (position === "center") {
            page.drawImage(image, {
              x: width / 2 - imageDims.width / 2,
              y: height / 2 - imageDims.height / 2,
              width: imageDims.width,
              height: imageDims.height,
              opacity: imageOpacity / 100,
            });
          } else if (position === "diagonal") {
            page.drawImage(image, {
              x: width / 2 - imageDims.width / 2,
              y: height / 2 - imageDims.height / 2,
              width: imageDims.width,
              height: imageDims.height,
              opacity: imageOpacity / 100,
              rotate: degrees(rotation),
            });
          } else if (position === "tiled") {
            const spacingX = imageDims.width + 50;
            const spacingY = imageDims.height + 50;

            for (let x = -spacingX; x < width + spacingX; x += spacingX) {
              for (let y = -spacingY; y < height + spacingY; y += spacingY) {
                page.drawImage(image, {
                  x: x,
                  y: y,
                  width: imageDims.width,
                  height: imageDims.height,
                  opacity: imageOpacity / 100,
                  rotate: degrees(rotation),
                });
              }
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // pdfBytes is Uint8Array<ArrayBufferLike>
const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
const blob = new Blob([safeBytes], { type: "application/pdf" });

      saveAs(blob, `watermarked_${pdfFile.name}`);

      setProcessing(false);
      showToast("PDF with watermark downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to add watermark. Please try again.");
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setWatermarkImage(null);
    setWatermarkText("CONFIDENTIAL");
    setTextColor("#FF6B35");
    setTextSize(48);
    setTextOpacity(30);
    setImageOpacity(30);
    setPosition("diagonal");
    setRotation(-45);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex flex-col items-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            PDF <span className="text-orange-500">Watermark</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Add text or image watermarks to your PDF documents
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              handleFileUpload(file);
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
                  PDF files only • Maximum file size: 100MB
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
        )}

        {/* PDF Loaded - Watermark Options */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {pdfFile.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatFileSize(pdfFile.size)}
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
            </div>

            {/* Watermark Type Selection */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Watermark Type
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setWatermarkType("text")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    watermarkType === "text"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Type className="w-6 h-6 text-orange-500" />
                    <span className="text-gray-900 font-semibold">
                      Text Watermark
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add custom text as watermark
                  </p>
                </button>

                <button
                  onClick={() => setWatermarkType("image")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    watermarkType === "image"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ImagePlus className="w-6 h-6 text-orange-500" />
                    <span className="text-gray-900 font-semibold">
                      Image Watermark
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add logo or image as watermark
                  </p>
                </button>
              </div>
            </div>

            {/* Text Watermark Options */}
            {watermarkType === "text" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Text Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">
                          {textColor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Size: {textSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={textSize}
                        onChange={(e) => setTextSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opacity: {textOpacity}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={textOpacity}
                        onChange={(e) =>
                          setTextOpacity(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Watermark Options */}
            {watermarkType === "image" && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Image Settings
                </h3>

                <div className="space-y-4">
                  {!watermarkImage ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        handleImageUpload(file);
                      }}
                    >
                      <label
                        htmlFor="image-upload"
                        className="w-full p-8 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-300"
                      >
                        <ImagePlus className="w-8 h-8 text-orange-500" />
                        <div className="text-center">
                          <span className="text-gray-900 text-sm font-medium block">
                            Click to upload watermark image
                          </span>
                          <span className="text-gray-500 text-xs mt-1 block">
                            PNG or JPG • Recommended: Transparent PNG
                          </span>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={imageInputRef}
                          onChange={(e) =>
                            handleImageUpload(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <ImagePlus className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {watermarkImage.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(watermarkImage.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWatermarkImage(null)}
                        className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity: {imageOpacity}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={imageOpacity}
                      onChange={(e) =>
                        setImageOpacity(parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Position and Rotation */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Position & Rotation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Position
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: "center",
                        label: "Center",
                        description: "Single watermark in center",
                      },
                      {
                        value: "diagonal",
                        label: "Diagonal",
                        description: "Single watermark at angle",
                      },
                      {
                        value: "tiled",
                        label: "Tiled",
                        description: "Repeated across page",
                      },
                    ].map((pos) => (
                      <label
                        key={pos.value}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="position"
                          value={pos.value}
                          checked={position === pos.value}
                          onChange={(e) => setPosition(e.target.value as any)}
                          className="mt-0.5 w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-400"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            {pos.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {pos.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mb-4"
                  />
                  <div className="text-sm text-gray-600">
                    Adjust the angle of your watermark. -45° is typical for
                    diagonal watermarks.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                disabled={processing}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={addWatermarkToPdf}
                disabled={
                  processing ||
                  (watermarkType === "text" && !watermarkText.trim()) ||
                  (watermarkType === "image" && !watermarkImage)
                }
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding Watermark...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Watermarked PDF
                  </>
                )}
              </button>
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
                    Watermark Tips
                  </p>
                  <p className="text-sm text-blue-700">
                    For best results with text watermarks, use a large font size
                    and low opacity. For image watermarks, transparent PNG files
                    work best. The watermark will be applied to all pages of
                    your PDF document.
                  </p>
                </div>
              </div>
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

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ff6b35;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
