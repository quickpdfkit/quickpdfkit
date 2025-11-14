"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileText, X, GripVertical, Upload, Settings2, Image as ImageIcon } from "lucide-react";

interface FileItem {
  file: File;
  id: string;
  type: "pdf" | "image";
  pageRange?: string;
  pageCount?: number;
  preview?: string;
}

export default function PdfImageMerger() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [outputFilename, setOutputFilename] = useState("merged-document.pdf");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const getPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch {
      return 0;
    }
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;
    
    const validFiles = Array.from(uploadedFiles).filter((f) => {
      const isPdf = f.type === "application/pdf";
      const isImage = f.type.startsWith("image/");
      return isPdf || isImage;
    });

    if (validFiles.length === 0) return showToast("No PDF or image files selected");

    const filesWithData = await Promise.all(
      validFiles.map(async (f) => {
        const isPdf = f.type === "application/pdf";
        return {
          file: f,
          id: crypto.randomUUID(),
          type: isPdf ? "pdf" : "image",
          pageRange: "",
          pageCount: isPdf ? await getPageCount(f) : 1,
          preview: !isPdf ? await createImagePreview(f) : undefined,
        } as FileItem;
      })
    );

    setFiles((prev) => [...prev, ...filesWithData]);
    showToast(`${validFiles.length} file(s) added`);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast("File removed");
  };

  const clearAll = () => {
    setFiles([]);
    showToast("All files cleared");
  };

  const updatePageRange = (id: string, range: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pageRange: range } : f))
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const parsePageRange = (range: string, totalPages: number): number[] => {
    if (!range.trim()) return Array.from({ length: totalPages }, (_, i) => i);
    
    const pages: number[] = [];
    const parts = range.split(",");
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim()) - 1);
        for (let i = start; i <= Math.min(end, totalPages - 1); i++) {
          if (i >= 0 && !pages.includes(i)) pages.push(i);
        }
      } else {
        const page = parseInt(trimmed) - 1;
        if (page >= 0 && page < totalPages && !pages.includes(page)) {
          pages.push(page);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  };

  const mergePdfsAndImages = async () => {
    if (files.length === 0) return showToast("No files to merge");
    setLoading(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileItem of files) {
        if (fileItem.type === "pdf") {
          // Handle PDF files
          const arrayBuffer = await fileItem.file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          
          const pageIndices = fileItem.pageRange
            ? parsePageRange(fileItem.pageRange, pdfDoc.getPageCount())
            : pdfDoc.getPageIndices();

          if (pageIndices.length === 0) continue;
          
          const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
          pages.forEach((p) => mergedPdf.addPage(p));
        } else {
          // Handle image files
          const imageBytes = await fileItem.file.arrayBuffer();
          let embeddedImage;

          // Embed image based on type
          if (fileItem.file.type === "image/jpeg" || fileItem.file.type === "image/jpg") {
            embeddedImage = await mergedPdf.embedJpg(imageBytes);
          } else if (fileItem.file.type === "image/png") {
            embeddedImage = await mergedPdf.embedPng(imageBytes);
          } else {
            // For other image types, try to convert to PNG first
            const img = new Image();
            img.src = fileItem.preview || "";
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);

            const pngBlob = await new Promise<Blob>((resolve) =>
              canvas.toBlob((blob) => resolve(blob!), "image/png")
            );
            const pngBytes = await pngBlob.arrayBuffer();
            embeddedImage = await mergedPdf.embedPng(pngBytes);
          }

          // Create a page with the image
          const { width, height } = embeddedImage.scale(1);
          
          // Calculate page size (A4 max, maintain aspect ratio)
          const maxWidth = 595; // A4 width in points
          const maxHeight = 842; // A4 height in points
          let pageWidth = width;
          let pageHeight = height;

          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            pageWidth = width * scale;
            pageHeight = height * scale;
          }

          const page = mergedPdf.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      saveAs(blob, outputFilename);
      showToast("Files merged successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error merging files");
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    
    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
            Merge PDFs & <span className="text-orange-500">Images</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Combine PDFs and images into a single PDF document
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <label
            htmlFor="file-upload"
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
                PDF, JPG, PNG, WEBP • Multiple files supported
              </span>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Files ({files.length})
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all text-sm text-gray-700"
              >
                <Settings2 className="w-4 h-4" />
                {showAdvanced ? "Hide" : "Show"} Options
              </button>
            </div>

            {/* Draggable List */}
            <div className="space-y-2">
              {files.map((f, index) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group p-3 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing pt-1">
                      <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>

                    {/* Preview Thumbnail for Images */}
                    {f.type === "image" && f.preview && (
                      <div className="flex-shrink-0">
                        <img
                          src={f.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {/* File Icon & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {f.type === "pdf" ? (
                          <FileText className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 text-sm sm:text-base font-medium truncate">
                              {f.file.name}
                            </p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              f.type === "pdf" 
                                ? "bg-orange-100 text-orange-600" 
                                : "bg-blue-100 text-blue-600"
                            }`}>
                              {f.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {formatFileSize(f.file.size)}
                            {f.pageCount !== undefined && f.type === "pdf" && ` • ${f.pageCount} pages`}
                          </p>
                        </div>
                      </div>

                      {/* Page Range Input (only for PDFs) */}
                      {showAdvanced && f.type === "pdf" && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={f.pageRange}
                            onChange={(e) => updatePageRange(f.id, e.target.value)}
                            placeholder="e.g., 1-3, 5, 7-9 (leave empty for all)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(f.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-all group/btn flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Output Settings */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Filename
              </label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                placeholder="merged-document.pdf"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={clearAll}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95"
              >
                Clear All
              </button>

              <button
                onClick={mergePdfsAndImages}
                disabled={loading}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Merging...
                  </span>
                ) : (
                  "Merge to PDF"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center mt-12 text-gray-500 text-sm">
            No files uploaded yet. Start by adding PDFs or images above.
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