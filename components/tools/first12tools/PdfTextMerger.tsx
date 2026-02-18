"use client";

import { useState, useRef } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileText, X, GripVertical, Upload, Download, Eye, EyeOff } from "lucide-react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";

if (typeof window !== "undefined") {
  const workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}


interface PdfTextFile {
  file: File;
  id: string;
  extractedText: string;
  pageCount: number;
  status: "pending" | "extracting" | "completed" | "error";
}

export default function PdfTextMerger() {
  const [pdfFiles, setPdfFiles] = useState<PdfTextFile[]>([]);
  const [outputFilename, setOutputFilename] = useState("merged-text");
  const [outputFormat, setOutputFormat] = useState<"txt" | "pdf">("txt");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showPreviews, setShowPreviews] = useState<{ [key: string]: boolean }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const extractTextFromPdf = async (file: File): Promise<{ text: string; pageCount: number }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      return { text: fullText.trim(), pageCount };
    } catch (error) {
      console.error("Error extracting text:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type === "application/pdf");

    if (newFiles.length === 0) return showToast("No PDF files selected");

    // Add files with pending status
    const filesWithData: PdfTextFile[] = newFiles.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      extractedText: "",
      pageCount: 0,
      status: "pending" as const,
    }));

    setPdfFiles((prev) => [...prev, ...filesWithData]);
    showToast(`${newFiles.length} PDF file(s) added`);

    // Extract text from each file
    for (const fileData of filesWithData) {
      try {
        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id ? { ...f, status: "extracting" as const } : f
          )
        );

        const { text, pageCount } = await extractTextFromPdf(fileData.file);

        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id
              ? { ...f, extractedText: text, pageCount, status: "completed" as const }
              : f
          )
        );
      } catch {
        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id ? { ...f, status: "error" as const } : f
          )
        );
        showToast(`Error extracting text from ${fileData.file.name}`);
      }
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    showToast("File removed");
  };

  const clearAll = () => {
    setPdfFiles([]);
    setShowPreviews({});
    showToast("All files cleared");
  };

  const togglePreview = (id: string) => {
    setShowPreviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const mergeAsTextFile = () => {
    const completedFiles = pdfFiles.filter((f) => f.status === "completed");
    if (completedFiles.length === 0) {
      return showToast("No text extracted to merge");
    }

    const mergedText = completedFiles
      .map((f, index) => {
        return `\n\n${"=".repeat(60)}\nFILE ${index + 1}: ${f.file.name}\n${"=".repeat(60)}\n${f.extractedText}`;
      })
      .join("\n");

    const blob = new Blob([mergedText], { type: "text/plain" });
    saveAs(blob, `${outputFilename}.txt`);
    showToast("Text file downloaded successfully!");
  };
  const sanitizeText = (text: string) => {
    return text
      .replace(/\uF0B7/g, "•")   // Fix MS Word bullet
      .replace(/\u2022/g, "•")   // Normalize bullet
      .replace(/[^\x00-\xFF]/g, ""); // Remove unsupported WinAnsi chars
  };

  const mergeAsPdf = async () => {
    const completedFiles = pdfFiles.filter((f) => f.status === "completed");
    if (completedFiles.length === 0) {
      return showToast("No text extracted to merge");
    }

    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const lineHeight = fontSize * 1.2;
      const margin = 50;
      const pageWidth = 595; // A4 width
      const pageHeight = 842; // A4 height
      const maxWidth = pageWidth - 2 * margin;

      for (const file of completedFiles) {
        // Add separator header
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        // Draw file header
        const header = `FILE: ${file.file.name}`;
        page.drawText(header, {
          x: margin,
          y: yPosition,
          size: 14,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= lineHeight * 2;

        // Split text into lines that fit the page width
        const cleanText = sanitizeText(file.extractedText);
        const lines = cleanText.split("\n");

        for (const line of lines) {
          const words = line.split(" ");
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, fontSize);

            if (width > maxWidth && currentLine) {
              // Draw current line
              if (yPosition < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
              }

              page.drawText(currentLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
              yPosition -= lineHeight;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          // Draw remaining text
          if (currentLine) {
            if (yPosition < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              yPosition = pageHeight - margin;
            }

            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      saveAs(blob, `${outputFilename}.pdf`);
      showToast("PDF file created successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error creating PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = () => {
    if (outputFormat === "txt") {
      mergeAsTextFile();
    } else {
      mergeAsPdf();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...pdfFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setPdfFiles(newFiles);
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
            Merge PDF <span className="text-orange-500">Text</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Extract and combine text content from multiple PDFs
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
                PDF files only • Text will be extracted automatically
              </span>
            </div>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>

        {/* Files List */}
        {pdfFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Files ({pdfFiles.length})
              </h2>
            </div>

            {/* Draggable List */}
            <div className="space-y-2">
              {pdfFiles.map((f, index) => (
                <div
                  key={f.id}
                  draggable={f.status === "completed"}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group p-3 sm:p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 ${draggedIndex === index ? "opacity-50" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    {f.status === "completed" && (
                      <div className="cursor-grab active:cursor-grabbing pt-1">
                        <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    )}

                    {/* File Icon & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-gray-900 text-sm sm:text-base font-medium truncate">
                              {f.file.name}
                            </p>
                            {f.status === "extracting" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                                Extracting...
                              </span>
                            )}
                            {f.status === "completed" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600">
                                ✓ Extracted
                              </span>
                            )}
                            {f.status === "error" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                                Error
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {formatFileSize(f.file.size)}
                            {f.pageCount > 0 && ` • ${f.pageCount} pages`}
                            {f.extractedText && ` • ${f.extractedText.length} characters`}
                          </p>
                        </div>
                      </div>

                      {/* Text Preview */}
                      {f.status === "completed" && f.extractedText && (
                        <div className="mt-3">
                          <button
                            onClick={() => togglePreview(f.id)}
                            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            {showPreviews[f.id] ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Hide Preview
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Show Preview
                              </>
                            )}
                          </button>
                          {showPreviews[f.id] && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                {f.extractedText.substring(0, 500)}
                                {f.extractedText.length > 500 && "..."}
                              </pre>
                            </div>
                          )}
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
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOutputFormat("txt")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${outputFormat === "txt"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Text File (.txt)
                  </button>
                  <button
                    onClick={() => setOutputFormat("pdf")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${outputFormat === "pdf"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    PDF File (.pdf)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Filename
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="merged-text"
                  />
                  <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-700 font-medium">
                    .{outputFormat}
                  </div>
                </div>
              </div>
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
                onClick={handleMerge}
                disabled={loading || pdfFiles.filter((f) => f.status === "completed").length === 0}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Merge & Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {pdfFiles.length === 0 && (
          <div className="text-center mt-12 text-gray-500 text-sm">
            No files uploaded yet. Start by adding some PDFs above.
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