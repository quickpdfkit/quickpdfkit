"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { 
  Upload, 
  Download, 
  FileText, 
  Type,
  Settings,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

type PageSize = "A4" | "Letter" | "Legal" | "A3";
type Orientation = "portrait" | "landscape";
type FontFamily = "helvetica" | "times" | "courier";
type TextAlignment = "left" | "center" | "right" | "justify";

export default function TextToPdf() {
  const [text, setText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("document");
  const [converting, setConverting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Page Settings
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  
  // Text Settings
  const [fontFamily, setFontFamily] = useState<FontFamily>("helvetica");
  const [fontSize, setFontSize] = useState<number>(12);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [textAlignment, setTextAlignment] = useState<TextAlignment>("left");
  
  // Margins (in mm)
  const [marginTop, setMarginTop] = useState<number>(25);
  const [marginRight, setMarginRight] = useState<number>(25);
  const [marginBottom, setMarginBottom] = useState<number>(25);
  const [marginLeft, setMarginLeft] = useState<number>(25);
  
  const [showPreview, setShowPreview] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const text = await file.text();
      setText(text);
      setFileName(file.name.replace(/\.(txt|md)$/i, ""));
      showToast("File loaded successfully");
    } catch (error) {
      console.error("Error reading file:", error);
      showToast("Error reading file");
    }
  };

  const pageDimensions: { [key: string]: { width: number; height: number } } = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
    A3: { width: 297, height: 420 },
  };

  const getPageDimensions = () => {
    let dimensions = pageDimensions[pageSize];
    if (orientation === "landscape") {
      return { width: dimensions.height, height: dimensions.width };
    }
    return dimensions;
  };

  const wrapText = (text: string, maxWidth: number, pdf: jsPDF): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = pdf.getTextWidth(testLine);

      if (textWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, need to break it
          lines.push(word);
          currentLine = '';
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const convertToPdf = async () => {
    if (!text.trim()) {
      showToast("Please enter some text");
      return;
    }

    setConverting(true);

    try {
      showToast("Creating PDF...");

      const dimensions = getPageDimensions();
      
      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize.toLowerCase() as any,
      });

      // Set font
      pdf.setFont(fontFamily);
      pdf.setFontSize(fontSize);

      // Calculate text area dimensions
      const textWidth = dimensions.width - marginLeft - marginRight;
      const textHeight = dimensions.height - marginTop - marginBottom;
      const lineHeight = fontSize * 0.3527 * lineSpacing; // Convert pt to mm

      // Split text into paragraphs
      const paragraphs = text.split('\n');
      
      let currentY = marginTop;
      let pageCount = 1;

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
          // Empty line - add spacing
          currentY += lineHeight;
          continue;
        }

        // Wrap text to fit width
        const lines = wrapText(paragraph, textWidth, pdf);

        for (const line of lines) {
          // Check if we need a new page
          if (currentY + lineHeight > dimensions.height - marginBottom) {
            pdf.addPage();
            pageCount++;
            currentY = marginTop;
          }

          // Calculate X position based on alignment
          let xPosition = marginLeft;
          
          if (textAlignment === "center") {
            const textWidthMm = pdf.getTextWidth(line);
            xPosition = (dimensions.width - textWidthMm) / 2;
          } else if (textAlignment === "right") {
            const textWidthMm = pdf.getTextWidth(line);
            xPosition = dimensions.width - marginRight - textWidthMm;
          } else if (textAlignment === "justify" && lines.indexOf(line) < lines.length - 1) {
            // Justify text (except last line of paragraph)
            const words = line.split(' ');
            if (words.length > 1) {
              const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
              const totalSpacing = textWidth - totalTextWidth;
              const spaceBetween = totalSpacing / (words.length - 1);
              
              let currentX = marginLeft;
              for (let i = 0; i < words.length; i++) {
                pdf.text(words[i], currentX, currentY);
                currentX += pdf.getTextWidth(words[i]) + spaceBetween;
              }
              currentY += lineHeight;
              continue;
            }
          }

          // Draw text
          pdf.text(line, xPosition, currentY);
          currentY += lineHeight;
        }

        // Add paragraph spacing
        currentY += lineHeight * 0.5;
      }

      // Add page numbers (optional)
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          dimensions.width / 2,
          dimensions.height - 10,
          { align: "center" }
        );
      }

      // Save PDF
      pdf.save(`${fileName}.pdf`);
      showToast("PDF created successfully!");

    } catch (error) {
      console.error("Error creating PDF:", error);
      showToast("Error creating PDF. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const getCharCount = (): number => text.length;
  const getWordCount = (): number => text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const getLineCount = (): number => text.split('\n').length;

  const clearAll = () => {
    setText("");
    setFileName("document");
    showToast("Text cleared");
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      showToast("Text pasted from clipboard");
    } catch (error) {
      showToast("Unable to access clipboard");
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
            <Type className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Text to <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Convert plain text to professionally formatted PDF documents
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload & Actions */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap items-center gap-3">
            <label
              htmlFor="text-file-upload"
              className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload TXT File
            </label>
            <input
              id="text-file-upload"
              type="file"
              accept=".txt,.md,text/plain"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            />

            <button
              onClick={pasteFromClipboard}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium"
            >
              Paste from Clipboard
            </button>

            <button
              onClick={clearAll}
              disabled={!text}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Clear All
            </button>

            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Document name"
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <EyeOff className="w-5 h-5 text-gray-700" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Text Input - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Text Content</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{getCharCount()} characters</span>
                  <span>•</span>
                  <span>{getWordCount()} words</span>
                  <span>•</span>
                  <span>{getLineCount()} lines</span>
                </div>
              </div>

              <textarea
                ref={textAreaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here or upload a .txt file..."
                className="w-full h-[500px] px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none font-mono text-sm"
                style={{
                  fontFamily: fontFamily === "courier" ? "monospace" : 
                              fontFamily === "times" ? "serif" : "sans-serif",
                  fontSize: `${fontSize}px`,
                  lineHeight: lineSpacing,
                  textAlign: textAlignment,
                }}
              />
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* Page Settings */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Page Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as PageSize)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                      <option value="A3">A3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as Orientation)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margins (mm)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={marginTop}
                        onChange={(e) => setMarginTop(Number(e.target.value))}
                        placeholder="Top"
                        min="0"
                        max="100"
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={marginRight}
                        onChange={(e) => setMarginRight(Number(e.target.value))}
                        placeholder="Right"
                        min="0"
                        max="100"
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={marginBottom}
                        onChange={(e) => setMarginBottom(Number(e.target.value))}
                        placeholder="Bottom"
                        min="0"
                        max="100"
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={marginLeft}
                        onChange={(e) => setMarginLeft(Number(e.target.value))}
                        placeholder="Left"
                        min="0"
                        max="100"
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Formatting */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Text Format</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="helvetica">Helvetica (Sans-serif)</option>
                      <option value="times">Times (Serif)</option>
                      <option value="courier">Courier (Monospace)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size: {fontSize}pt
                    </label>
                    <input
                      type="range"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="8"
                      max="24"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Spacing: {lineSpacing}
                    </label>
                    <input
                      type="range"
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(Number(e.target.value))}
                      min="1"
                      max="3"
                      step="0.1"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alignment
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setTextAlignment("left")}
                        className={`p-2 rounded-lg border transition-all ${
                          textAlignment === "left"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Left"
                      >
                        <AlignLeft className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setTextAlignment("center")}
                        className={`p-2 rounded-lg border transition-all ${
                          textAlignment === "center"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Center"
                      >
                        <AlignCenter className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setTextAlignment("right")}
                        className={`p-2 rounded-lg border transition-all ${
                          textAlignment === "right"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Right"
                      >
                        <AlignRight className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setTextAlignment("justify")}
                        className={`p-2 rounded-lg border transition-all ${
                          textAlignment === "justify"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Justify"
                      >
                        <AlignJustify className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview (Optional) */}
          {showPreview && text && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div 
                className="border border-gray-300 rounded-lg p-8 max-h-96 overflow-y-auto bg-white shadow-inner"
                style={{
                  fontFamily: fontFamily === "courier" ? "monospace" : 
                              fontFamily === "times" ? "serif" : "sans-serif",
                  fontSize: `${fontSize}px`,
                  lineHeight: lineSpacing,
                  textAlign: textAlignment,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {text}
              </div>
            </div>
          )}

          {/* Convert Button */}
          <div className="flex gap-3">
            <button
              onClick={convertToPdf}
              disabled={converting || !text.trim()}
              className="flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        </div>
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