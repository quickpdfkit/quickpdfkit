"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  Upload,
  Download,
  FileText,
  Info,
  Calendar,
  User,
  Tag,
  FileEdit,
  Save,
} from "lucide-react";

interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export default function PdfMetadataEditor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    creationDate: "",
    modificationDate: "",
  });
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

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    try {
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setPdfFile(file);
    setLoading(true);

    try {
      // Load PDF and extract existing metadata
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const extractedMetadata: PdfMetadata = {
        title: pdfDoc.getTitle() || "",
        author: pdfDoc.getAuthor() || "",
        subject: pdfDoc.getSubject() || "",
        keywords: pdfDoc.getKeywords() || "",
        creator: pdfDoc.getCreator() || "",
        producer: pdfDoc.getProducer() || "",
        creationDate: formatDate(pdfDoc.getCreationDate() ?? null),
        modificationDate: formatDate(pdfDoc.getModificationDate() ?? null),
      };

      setMetadata(extractedMetadata);
      showToast("PDF loaded - metadata extracted");
    } catch (error) {
      console.error("Error reading PDF:", error);
      showToast("Error reading PDF metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleMetadataChange = (field: keyof PdfMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMetadata = async () => {
    if (!pdfFile) {
      showToast("Please select a PDF file first");
      return;
    }

    setProcessing(true);

    try {
      showToast("Updating metadata...");

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Update metadata
      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);

      if (metadata.keywords) {
        const keywordsArray = metadata.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        pdfDoc.setKeywords(keywordsArray);
      }

      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);

      // Update modification date to current date
      pdfDoc.setModificationDate(new Date());

      // If creation date is provided, try to set it
      if (metadata.creationDate) {
        try {
          const creationDate = new Date(metadata.creationDate);
          pdfDoc.setCreationDate(creationDate);
        } catch (e) {
          console.log("Invalid creation date format");
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      const fileName = pdfFile.name.replace(".pdf", "");
      saveAs(blob, `${fileName}_metadata.pdf`);

      showToast("Metadata updated successfully!");

      // Reset after short delay
      setTimeout(() => {
        resetAll();
      }, 2000);
    } catch (error) {
      console.error("Error updating metadata:", error);
      showToast("Error updating metadata. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const clearAllMetadata = () => {
    setMetadata({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
      creationDate: "",
      modificationDate: "",
    });
    showToast("All metadata cleared");
  };

  const resetAll = () => {
    setPdfFile(null);
    setMetadata({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
      creationDate: "",
      modificationDate: "",
    });
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
            PDF <span className="text-orange-500">Metadata</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View, edit, and manage PDF document metadata
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile ? (
          <div onDragOver={handleDragOver} onDrop={handleDrop}>
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
                accept=".pdf,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        ) : (
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

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading metadata...</p>
              </div>
            )}

            {/* Metadata Form */}
            {!loading && (
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Document Metadata
                    </h2>
                  </div>
                  <button
                    onClick={clearAllMetadata}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateMetadata();
                  }}
                  className="space-y-5"
                >
                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Title
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) =>
                        handleMetadataChange("title", e.target.value)
                      }
                      placeholder="Document title"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Author
                    </label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) =>
                        handleMetadataChange("author", e.target.value)
                      }
                      placeholder="Author name"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Info className="w-4 h-4 text-orange-500" />
                      Subject
                    </label>
                    <input
                      type="text"
                      value={metadata.subject}
                      onChange={(e) =>
                        handleMetadataChange("subject", e.target.value)
                      }
                      placeholder="Document subject"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-orange-500" />
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={metadata.keywords}
                      onChange={(e) =>
                        handleMetadataChange("keywords", e.target.value)
                      }
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate keywords with commas
                    </p>
                  </div>

                  {/* Two columns for Creator and Producer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Creator */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileEdit className="w-4 h-4 text-orange-500" />
                        Creator
                      </label>
                      <input
                        type="text"
                        value={metadata.creator}
                        onChange={(e) =>
                          handleMetadataChange("creator", e.target.value)
                        }
                        placeholder="Application/tool used"
                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Producer */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Save className="w-4 h-4 text-orange-500" />
                        Producer
                      </label>
                      <input
                        type="text"
                        value={metadata.producer}
                        onChange={(e) =>
                          handleMetadataChange("producer", e.target.value)
                        }
                        placeholder="PDF producer"
                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Creation Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Creation Date
                      </label>
                      <input
                        type="date"
                        value={metadata.creationDate}
                        onChange={(e) =>
                          handleMetadataChange("creationDate", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Modification Date - Read Only */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Last Modified
                      </label>
                      <input
                        type="date"
                        value={metadata.modificationDate}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-updated on save
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetAll}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Save & Download
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    About PDF Metadata
                  </p>
                  <p className="text-sm text-blue-700">
                    Metadata helps organize and identify your documents. It
                    includes information like title, author, subject, and
                    keywords. This data is searchable and helps with document
                    management and SEO.
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
      `}</style>
    </div>
  );
}
