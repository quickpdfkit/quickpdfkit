"use client";

import { useState, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  File,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
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
interface PageContent {
  pageNumber: number;
  text: string;
  items: any[];
}

export default function PdfToWordSimple() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [extractedContent, setExtractedContent] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  
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

  const extractTextFromPage = async (page: any): Promise<PageContent> => {
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");

    return {
      pageNumber: page.pageNumber,
      text: pageText,
      items: textContent.items,
    };
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    setLoading(true);
    setPdfFile(file);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      
      showToast(`PDF loaded: ${pdf.numPages} pages`);

      // Extract text from all pages
      const contentArray: PageContent[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await extractTextFromPage(page);
        contentArray.push(content);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setExtractedContent(contentArray);
      showToast("Text extraction complete");

    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const detectHeading = (text: string): boolean => {
    // Simple heuristic to detect headings
    const headingPatterns = [
      /^(Chapter|CHAPTER)\s+\d+/i,
      /^\d+\.\s+[A-Z]/,
      /^[A-Z][A-Z\s]{5,}$/,
      /^(Introduction|Conclusion|Summary|Abstract)/i,
    ];

    return headingPatterns.some(pattern => pattern.test(text.trim())) && text.length < 100;
  };

  const splitIntoParagraphs = (text: string): string[] => {
    // Split by double line breaks, periods followed by caps, or significant spacing
    const paragraphs = text
      .split(/\n\n+|\. [A-Z]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return paragraphs;
  };

  const convertToWord = async () => {
    if (extractedContent.length === 0) {
      showToast("No content to convert");
      return;
    }

    setConverting(true);
    setProgress(0);

    try {
      showToast("Creating Word document...");

      const docParagraphs: Paragraph[] = [];

      // Add title
      if (pdfFile) {
        docParagraphs.push(
          new Paragraph({
            text: pdfFile.name.replace(".pdf", ""),
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          })
        );
      }

      // Process each page
      for (let i = 0; i < extractedContent.length; i++) {
        const pageContent = extractedContent[i];
        
        // Add page separator for multi-page documents
        if (i > 0) {
          docParagraphs.push(
            new Paragraph({
              text: "",
              spacing: { before: 200, after: 200 },
            })
          );
        }

        // Split content into paragraphs
        const paragraphs = splitIntoParagraphs(pageContent.text);

        for (const para of paragraphs) {
          if (para.length === 0) continue;

          // Detect if it's likely a heading
          if (detectHeading(para)) {
            docParagraphs.push(
              new Paragraph({
                text: para,
                heading: HeadingLevel.HEADING_1,
                spacing: {
                  before: 240,
                  after: 120,
                },
              })
            );
          } else {
            // Regular paragraph
            docParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: para,
                    size: 24, // 12pt
                  }),
                ],
                spacing: {
                  before: 120,
                  after: 120,
                  line: 360, // 1.5 line spacing
                },
              })
            );
          }
        }

        setProgress(Math.round(((i + 1) / extractedContent.length) * 100));
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch = 1440 twips
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: docParagraphs,
          },
        ],
      });

      // Generate and save
      const blob = await Packer.toBlob(doc);
      const fileName = pdfFile?.name.replace(".pdf", "") || "document";
      saveAs(blob, `${fileName}.docx`);

      showToast("Word document created successfully!");

    } catch (error) {
      console.error("Error converting to Word:", error);
      showToast("Error converting to Word. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setExtractedContent([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getPreviewText = (): string => {
    return extractedContent
      .map(page => page.text)
      .join("\n\n")
      .substring(0, 5000); // Show first 5000 characters
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
            PDF to <span className="text-orange-500">Word Simple</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert PDF documents to editable Word format
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile ? (
          <div>
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
                  accept=".pdf,application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Important Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Browser-Based Text Extraction
                  </p>
                  <p className="text-sm text-blue-700 mb-3">
                    This tool extracts text from PDF and creates a Word document. Due to browser limitations:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">Works with text-based PDFs</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">Preserves basic text content</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">Complex layouts may not transfer perfectly</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">Images, tables, and formatting are limited</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">Scanned PDFs require OCR (not supported here)</p>
                    </div>
                  </div>
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
                  <p className="text-gray-900 font-semibold">{pdfFile.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatFileSize(pdfFile.size)} • {totalPages} pages
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

            {/* Loading Progress */}
            {loading && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                  <p className="text-gray-700 font-medium">Extracting text from PDF...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-right">{progress}%</p>
              </div>
            )}

            {/* Conversion Progress */}
            {converting && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                  <p className="text-gray-700 font-medium">Creating Word document...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-right">{progress}%</p>
              </div>
            )}

            {!loading && extractedContent.length > 0 && (
              <>
                {/* Extraction Summary */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Extraction Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Pages Processed</p>
                      <p className="text-2xl font-bold text-orange-500">{extractedContent.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Characters</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {extractedContent.reduce((sum, page) => sum + page.text.length, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Estimated Words</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {Math.round(extractedContent.reduce((sum, page) => sum + page.text.split(/\s+/).length, 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-medium text-green-700">Ready</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Preview */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Extracted Text Preview
                    </h3>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {showPreview ? "Hide" : "Show"} Preview
                    </button>
                  </div>

                  {showPreview && (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {getPreviewText()}
                        {getPreviewText().length >= 5000 && "\n\n... (preview truncated)"}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Conversion Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900 font-medium mb-1">
                        Before Converting
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Review the preview to check extracted text quality</li>
                        <li>• The Word document will contain plain text with basic formatting</li>
                        <li>• You may need to manually adjust formatting after conversion</li>
                        <li>• Images, complex tables, and special layouts won't be preserved</li>
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
                    onClick={convertToWord}
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
                        Convert to Word
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