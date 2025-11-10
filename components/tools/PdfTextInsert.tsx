"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Upload, Download, FileText, Plus, Trash2 } from "lucide-react";

export default function PdfTextInsert() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [textElements, setTextElements] = useState<
    Array<{
      id: string;
      text: string;
      page: number;
      x: number;
      y: number;
      size: number;
      color: string;
    }>
  >([]);
  const [newText, setNewText] = useState("");
  const [textSize, setTextSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [selectedPage, setSelectedPage] = useState(1);
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

  const handleFileUpload = (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    setTextElements([]);
    setSelectedPage(1);
    showToast("PDF loaded successfully");
  };

  const addTextElement = () => {
    if (!newText.trim()) {
      showToast("Please enter some text");
      return;
    }

    const newElement = {
      id: Math.random().toString(36).substr(2, 9),
      text: newText,
      page: selectedPage,
      x: 50, // Default position
      y: 500, // Default position
      size: textSize,
      color: textColor,
    };

    setTextElements((prev) => [...prev, newElement]);
    setNewText("");
    showToast("Text element added");
  };

  const updateTextProperty = (id: string, property: string, value: any) => {
    setTextElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, [property]: value } : element
      )
    );
  };

  const removeTextElement = (id: string) => {
    setTextElements((prev) => prev.filter((element) => element.id !== id));
    showToast("Text element removed");
  };

  const clearAllText = () => {
    setTextElements([]);
    showToast("All text elements cleared");
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  const addTextToPdf = async () => {
    if (!pdfFile) return;

    if (textElements.length === 0) {
      showToast("Please add at least one text element");
      return;
    }

    setProcessing(true);
    showToast("Adding text to PDF...");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Group text elements by page
      const elementsByPage: { [key: number]: typeof textElements } = {};
      textElements.forEach((element) => {
        if (!elementsByPage[element.page]) {
          elementsByPage[element.page] = [];
        }
        elementsByPage[element.page].push(element);
      });

      // Add text to each page
      Object.entries(elementsByPage).forEach(([pageNum, elements]) => {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];

          elements.forEach((element) => {
            const color = hexToRgb(element.color);
            page.drawText(element.text, {
              x: element.x,
              y: element.y,
              size: element.size,
              color: rgb(color.r, color.g, color.b),
            });
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
      // pdfBytes is Uint8Array<ArrayBufferLike>
      const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
      const blob = new Blob([safeBytes], { type: "application/pdf" });

      saveAs(blob, `text-added_${pdfFile.name}`);

      setProcessing(false);
      showToast("PDF with text added downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to add text to PDF. Please try again.");
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setTextElements([]);
    setNewText("");
    setTextSize(12);
    setTextColor("#000000");
    setSelectedPage(1);
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

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Add <span className="text-orange-500">Text</span> to PDF
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Insert custom text anywhere in your PDF documents
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

        {/* PDF Loaded - Text Editor */}
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

            {/* Add Text Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Text
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Text Input */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text to add..."
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Page Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedPage}
                    onChange={(e) =>
                      setSelectedPage(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Add Button */}
                <div className="flex items-end">
                  <button
                    onClick={addTextElement}
                    disabled={!newText.trim()}
                    className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Text
                  </button>
                </div>
              </div>

              {/* Text Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {textSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

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
                    <span className="text-sm text-gray-600">{textColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Elements List */}
            {textElements.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Text Elements ({textElements.length})
                  </h3>
                  <button
                    onClick={clearAllText}
                    className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {textElements.map((element, index) => (
                    <div
                      key={element.id}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {element.text}
                            </p>
                            <p className="text-sm text-gray-600">
                              Page {element.page} • Size: {element.size}px •
                              Color: {element.color}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTextElement(element.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Position Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            X Position: {element.x}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="600"
                            value={element.x}
                            onChange={(e) =>
                              updateTextProperty(
                                element.id,
                                "x",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Y Position: {element.y}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="800"
                            value={element.y}
                            onChange={(e) =>
                              updateTextProperty(
                                element.id,
                                "y",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size: {element.size}px
                          </label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={element.size}
                            onChange={(e) =>
                              updateTextProperty(
                                element.id,
                                "size",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>

                      {/* Quick Position Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "x", 50)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Left
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "x", 300)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Center
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "x", 550)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Right
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "y", 700)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Top
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "y", 400)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Middle
                        </button>
                        <button
                          onClick={() =>
                            updateTextProperty(element.id, "y", 50)
                          }
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                        >
                          Bottom
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                onClick={addTextToPdf}
                disabled={processing || textElements.length === 0}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding Text...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF with Text
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
                    Text Positioning Guide
                  </p>
                  <p className="text-sm text-blue-700">
                    Use the X and Y position sliders to place your text exactly
                    where you want it. Typical PDF pages are around 600x800
                    pixels. You can add text to any page by changing the page
                    number. Use the quick position buttons for common
                    placements.
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
