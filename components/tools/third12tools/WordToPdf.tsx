"use client";

import { useState, useRef } from "react";
import mammoth from "mammoth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  File,
  Eye,
  Settings,
  AlertCircle,
} from "lucide-react";

type PageSize = "A4" | "Letter" | "Legal";
type Orientation = "portrait" | "landscape";

export default function WordToPdf() {
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [showPreview, setShowPreview] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const pageDimensions: { [key: string]: { width: number; height: number } } = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    const validExtensions = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validExtensions.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      showToast("Please upload a valid Word document (.docx or .doc)");
      return;
    }

    setLoading(true);
    setWordFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "b => strong",
            "i => em",
          ],
        }
      );

      if (result.messages.length > 0) {
        console.log("Conversion messages:", result.messages);
      }

      // Wrap content in a styled container
      const styledHtml = `
        <div style="
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          background: white;
        ">
          ${result.value}
        </div>
      `;

      setHtmlContent(styledHtml);
      showToast("Document loaded successfully");

    } catch (error) {
      console.error("Error loading Word document:", error);
      showToast("Error loading document. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  const convertToPdf = async () => {
    if (!htmlContent || !previewRef.current) {
      showToast("No document to convert");
      return;
    }

    setConverting(true);

    try {
      showToast("Converting to PDF...");

      const element = previewRef.current;
      
      // Get page dimensions in mm
      const dimensions = pageDimensions[pageSize];
      let pdfWidth = dimensions.width;
      let pdfHeight = dimensions.height;

      if (orientation === "landscape") {
        [pdfWidth, pdfHeight] = [pdfHeight, pdfWidth];
      }

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const imgWidth = pdfWidth - 20; // 10mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize.toLowerCase() as any,
      });

      let heightLeft = imgHeight;
      let position = 10; // Top margin

      // Add first page
      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Subtract page height minus margins

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10; // Position for next page
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      // Save PDF
      const fileName = wordFile?.name.replace(/\.(docx|doc)$/i, "") || "document";
      pdf.save(`${fileName}.pdf`);

      showToast("PDF created successfully!");

    } catch (error) {
      console.error("Error converting to PDF:", error);
      showToast("Error converting to PDF. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const resetAll = () => {
    setWordFile(null);
    setHtmlContent("");
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <File className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Word to <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert Word documents to PDF format
          </p>
        </div>

        {/* Upload Area */}
        {!wordFile ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files[0]);
            }}
          >
            <label
              htmlFor="word-upload"
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
                  .docx or .doc files
                </span>
              </div>
              <input
                id="word-upload"
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
            </label>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Browser-Based Conversion
                  </p>
                  <p className="text-sm text-blue-700">
                    This tool converts Word documents to PDF directly in your browser. 
                    Complex formatting, advanced features, and some images may not be perfectly preserved. 
                    For best results, use simple documents with standard formatting.
                  </p>
                </div>
              </div>
            </div>
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
                  <p className="text-gray-900 font-semibold">{wordFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(wordFile.size)}
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
                <p className="text-gray-600">Loading document...</p>
              </div>
            )}

            {!loading && htmlContent && (
              <>
                {/* Settings Panel */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                  </div>
                  
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

                    {/* Preview Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`w-full px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                          showPreview
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                {showPreview && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Document Preview
                      </h3>
                      <span className="text-sm text-gray-500">
                        Preview may differ from final PDF
                      </span>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="max-h-[600px] overflow-y-auto bg-gray-50 p-6"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}
                      >
                        <div
                          ref={previewRef}
                          className="bg-white shadow-lg mx-auto"
                          style={{
                            maxWidth: orientation === "portrait" ? "800px" : "1000px",
                          }}
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversion Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900 font-medium mb-1">
                        Before Converting
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Check the preview to ensure content looks correct</li>
                        <li>• Complex tables and images may require adjustment</li>
                        <li>• Headers, footers, and page numbers may not transfer</li>
                        <li>• For professional documents, consider using desktop software</li>
                      </ul>
                    </div>
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
                    disabled={converting}
                    className="flex-1 px-8 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {converting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Convert to PDF
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