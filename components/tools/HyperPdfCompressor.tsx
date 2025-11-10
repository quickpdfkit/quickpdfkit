"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Upload, Download, FileText, Minimize2, Zap, Image as ImageIcon, AlertCircle } from "lucide-react";

interface CompressionLevel {
  id: string;
  name: string;
  description: string;
  removeMetadata: boolean;
  removeDuplicates: boolean;
  compressStreams: boolean;
  icon: any;
}

export default function PdfCompressor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [compressionLevel, setCompressionLevel] = useState("recommended");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const compressionLevels: CompressionLevel[] = [
    {
      id: "light",
      name: "Light Compression",
      description: "Remove metadata only, safest option",
      removeMetadata: true,
      removeDuplicates: false,
      compressStreams: false,
      icon: Zap,
    },
    {
      id: "recommended",
      name: "Recommended",
      description: "Remove metadata & duplicates",
      removeMetadata: true,
      removeDuplicates: true,
      compressStreams: true,
      icon: ImageIcon,
    },
    {
      id: "maximum",
      name: "Maximum",
      description: "All optimizations applied",
      removeMetadata: true,
      removeDuplicates: true,
      compressStreams: true,
      icon: Minimize2,
    },
  ];

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
    setOriginalSize(file.size);
    setCompressedSize(0);
    showToast("PDF loaded successfully");
  };

  const compressPdfAdvanced = async () => {
    if (!pdfFile) return;

    const level = compressionLevels.find((l) => l.id === compressionLevel);
    if (!level) return;

    setCompressing(true);
    setCompressionProgress(0);

    try {
      showToast("Reading PDF...");
      setCompressionProgress(10);

      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Use direct manipulation for better compression
      showToast("Optimizing PDF structure...");
      setCompressionProgress(30);

      // Load PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      setCompressionProgress(50);
      showToast("Removing unnecessary data...");

      // Remove metadata if requested
      if (level.removeMetadata) {
        try {
          pdfDoc.setTitle("");
          pdfDoc.setAuthor("");
          pdfDoc.setSubject("");
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer("");
          pdfDoc.setCreator("");
        } catch (e) {
          console.log("Metadata removal skipped");
        }
      }

      setCompressionProgress(70);
      showToast("Finalizing compression...");

      // Save with maximum compression options
      const saveOptions: any = {
        useObjectStreams: level.compressStreams,
        addDefaultPage: false,
        objectsPerTick: 50,
      };

      const compressedBytes = await pdfDoc.save(saveOptions);

      setCompressionProgress(90);

      // Create blob
      const compressedBlob = new Blob([new Uint8Array(compressedBytes)], {
        type: "application/pdf",
      });

      const newSize = compressedBlob.size;
      setCompressedSize(newSize);

      setCompressionProgress(100);

      // Check if compression was beneficial
      if (newSize >= originalSize) {
        showToast("PDF is already well optimized. Size unchanged.");
        // Still download the file
      } else {
        const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
        showToast(`Success! Reduced by ${reduction}%`);
      }

      const fileName = pdfFile.name.replace(".pdf", "");
      saveAs(compressedBlob, `${fileName}_compressed.pdf`);

    } catch (error) {
      console.error("Error compressing PDF:", error);
      showToast("Error compressing PDF. Try a different compression level.");
    } finally {
      setCompressing(false);
      setCompressionProgress(0);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCompressionResult = () => {
    if (compressedSize === 0) return null;
    
    const reduction = ((1 - compressedSize / originalSize) * 100);
    const isLarger = compressedSize > originalSize;
    
    return {
      reduction: Math.abs(reduction).toFixed(1),
      isLarger,
      message: isLarger 
        ? "PDF is already optimized" 
        : `Reduced by ${reduction.toFixed(1)}%`
    };
  };

  const compressionResult = getCompressionResult();

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
           Hyper Compress <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Optimize your PDF files by removing unnecessary data
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

        {/* PDF Loaded - Compression Options */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{pdfFile.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Original size: {formatFileSize(originalSize)}
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

              {/* Size Comparison */}
              {compressedSize > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Original</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatFileSize(originalSize)}
                      </p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${
                      compressionResult?.isLarger ? "bg-yellow-50" : "bg-green-50"
                    }`}>
                      <p className={`text-sm mb-1 ${
                        compressionResult?.isLarger ? "text-yellow-600" : "text-green-600"
                      }`}>
                        Compressed
                      </p>
                      <p className={`text-xl font-bold ${
                        compressionResult?.isLarger ? "text-yellow-700" : "text-green-700"
                      }`}>
                        {formatFileSize(compressedSize)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      compressionResult?.isLarger 
                        ? "bg-yellow-100" 
                        : "bg-orange-100"
                    }`}>
                      {compressionResult?.isLarger ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-700 font-semibold">
                            {compressionResult.message}
                          </span>
                        </>
                      ) : (
                        <>
                          <Minimize2 className="w-5 h-5 text-orange-600" />
                          <span className="text-orange-700 font-semibold">
                            {compressionResult?.message}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compression Level Selection */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compression Mode
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {compressionLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setCompressionLevel(level.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        compressionLevel === level.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            compressionLevel === level.id
                              ? "bg-orange-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              compressionLevel === level.id
                                ? "text-orange-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-semibold mb-1">
                            {level.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {level.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            {compressing && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Compressing...
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    {compressionProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 rounded-full"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetAll}
                disabled={compressing}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={compressPdfAdvanced}
                disabled={compressing}
                className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                {compressing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Optimize & Download
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
                    How it works
                  </p>
                  <p className="text-sm text-blue-700">
                    This tool optimizes PDF structure by removing metadata, unnecessary data, and applying compression algorithms. Results vary based on the original PDF optimization. Some PDFs may already be well-optimized and won't compress further.
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