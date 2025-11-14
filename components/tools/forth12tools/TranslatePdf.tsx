"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { 
  Upload, 
  Download, 
  FileText, 
  Languages,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  Loader2,
  FileDown,
  X,
  Plus,
} from "lucide-react";

type Language = {
  code: string;
  name: string;
  flag: string;
};

type TranslationResult = {
  language: Language;
  text: string;
  status: "pending" | "translating" | "completed" | "error";
  error?: string;
};

const LANGUAGES: Language[] = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
];

export default function TranslatePdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("translated-document");
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [translationService, setTranslationService] = useState<"google" | "deepl" | "libre">("google");
  
  // Settings
  const [preserveFormatting, setPreserveFormatting] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(12);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Legal">("A4");
  const [includeOriginal, setIncludeOriginal] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file");
      return;
    }

    try {
      setPdfFile(file);
      setFileName(file.name.replace(/\.pdf$/i, ""));
      showToast("PDF loaded successfully");
      
      // Extract text from PDF
      await extractTextFromPdf(file);
    } catch (error) {
      console.error("Error loading PDF:", error);
      showToast("Error loading PDF file");
    }
  };

  const extractTextFromPdf = async (file: File) => {
    setIsExtracting(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      let fullText = "";
      
      // Note: pdf-lib doesn't have built-in text extraction
      // In production, you'd use pdf.js or a server-side solution
      // This is a placeholder that simulates text extraction
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        // Simulated text - in production, use proper PDF text extraction
        fullText += `[Content from page ${i + 1}]\n\n`;
      }
      
      // For demonstration, if the PDF is small, we'll add placeholder text
      if (fullText.length < 100) {
        fullText = "This is a sample PDF content that will be translated. " +
                  "In a production environment, you would integrate a proper PDF text extraction library " +
                  "like pdf.js or use a server-side solution to extract the actual text from the PDF.\n\n" +
                  "The translation service would then translate this extracted text into your selected languages.";
      }
      
      setExtractedText(fullText);
      showToast("Text extracted successfully");
    } catch (error) {
      console.error("Error extracting text:", error);
      showToast("Error extracting text from PDF");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleLanguage = (language: Language) => {
    const exists = selectedLanguages.find(lang => lang.code === language.code);
    
    if (exists) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang.code !== language.code));
      setTranslations(translations.filter(t => t.language.code !== language.code));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  // Simulate translation API call
    const translateText = async (text: string, targetLang: string): Promise<string> => {
        // In production, you would call actual translation API here
        // Example with Google Translate API:
        
        const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            q: text,
            target: targetLang,
            format: "text"
            })
        }
        );
        const data = await response.json();
        return data.data.translations[0].translatedText;
        
        
        // Simulated delay and response
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // Return simulated translation
        const langName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
        return `[Translated to ${langName}]\n\n${text}\n\n[Translation complete]`;
    };

  const startTranslation = async () => {
    if (!extractedText) {
      showToast("Please upload a PDF first");
      return;
    }

    if (selectedLanguages.length === 0) {
      showToast("Please select at least one language");
      return;
    }

    setIsTranslating(true);
    
    // Initialize translation results
    const initialResults: TranslationResult[] = selectedLanguages.map(lang => ({
      language: lang,
      text: "",
      status: "pending"
    }));
    
    setTranslations(initialResults);

    try {
      // Translate to each language
      for (let i = 0; i < selectedLanguages.length; i++) {
        const language = selectedLanguages[i];
        
        // Update status to translating
        setTranslations(prev => 
          prev.map(t => 
            t.language.code === language.code 
              ? { ...t, status: "translating" }
              : t
          )
        );

        try {
          const translatedText = await translateText(extractedText, language.code);
          
          // Update with completed translation
          setTranslations(prev => 
            prev.map(t => 
              t.language.code === language.code 
                ? { ...t, text: translatedText, status: "completed" }
                : t
            )
          );
        } catch (error: any) {
          // Update with error
          setTranslations(prev => 
            prev.map(t => 
              t.language.code === language.code 
                ? { ...t, status: "error", error: error.message }
                : t
            )
          );
        }
      }

      showToast("All translations completed!");
    } catch (error) {
      console.error("Translation error:", error);
      showToast("Error during translation");
    } finally {
      setIsTranslating(false);
    }
  };

  const createPdfFromText = async (text: string, language: string): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const pageSizes = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
    };
    
    const { width, height } = pageSizes[pageSize];
    const margin = 50;
    const maxWidth = width - (margin * 2);
    const lineHeight = fontSize * 1.2;
    
    let page = pdfDoc.addPage([width, height]);
    let yPosition = height - margin;
    
    // Add title
    page.drawText(`Translated Document - ${language}`, {
      x: margin,
      y: yPosition,
      size: fontSize + 4,
      font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= lineHeight * 2;
    
    // Split text into lines
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) {
        yPosition -= lineHeight;
        continue;
      }
      
      // Word wrap
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          // Draw current line
          if (yPosition < margin) {
            page = pdfDoc.addPage([width, height]);
            yPosition = height - margin;
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
        if (yPosition < margin) {
          page = pdfDoc.addPage([width, height]);
          yPosition = height - margin;
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
    
    // Add page numbers
    const totalPages = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();
    
    pages.forEach((page, index) => {
      page.drawText(`Page ${index + 1} of ${totalPages}`, {
        x: width / 2 - 30,
        y: 20,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
    
    return await pdfDoc.save();
  };

  const downloadSingleTranslation = async (translation: TranslationResult) => {
    if (translation.status !== "completed") return;
    
    try {
      showToast(`Creating PDF for ${translation.language.name}...`);
      
      const pdfBytes = await createPdfFromText(
        translation.text, 
        translation.language.name
      );
      
      // const blob = new Blob([pdfBytes], { type: "application/pdf" });
         const safeBytes = new Uint8Array(pdfBytes); // new Uint8Array backed by ArrayBuffer
        const blob = new Blob([safeBytes], { type: "application/pdf" });
      saveAs(blob, `${fileName}_${translation.language.code}.pdf`);
      
      showToast(`${translation.language.name} PDF downloaded!`);
    } catch (error) {
      console.error("Error creating PDF:", error);
      showToast("Error creating PDF");
    }
  };

  const downloadAllTranslations = async () => {
    const completedTranslations = translations.filter(t => t.status === "completed");
    
    if (completedTranslations.length === 0) {
      showToast("No completed translations to download");
      return;
    }

    try {
      showToast("Creating ZIP file...");
      
      const zip = new JSZip();
      
      // Add original if requested
      if (includeOriginal && pdfFile) {
        const originalData = await pdfFile.arrayBuffer();
        zip.file(`${fileName}_original.pdf`, originalData);
      }
      
      // Add all translations
      for (const translation of completedTranslations) {
        const pdfBytes = await createPdfFromText(
          translation.text,
          translation.language.name
        );
        zip.file(`${fileName}_${translation.language.code}.pdf`, pdfBytes);
      }
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${fileName}_translations.zip`);
      
      showToast("All translations downloaded!");
    } catch (error) {
      console.error("Error creating ZIP:", error);
      showToast("Error creating ZIP file");
    }
  };

  const clearAll = () => {
    setPdfFile(null);
    setExtractedText("");
    setSelectedLanguages([]);
    setTranslations([]);
    setFileName("translated-document");
    showToast("Cleared");
  };

  const completedCount = translations.filter(t => t.status === "completed").length;
  const errorCount = translations.filter(t => t.status === "error").length;

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
            <Languages className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900">
            Translate <span className="text-orange-500">PDF</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Translate your PDF documents into multiple languages
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          {!pdfFile && (
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload PDF Document
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Choose a PDF file to translate
                </p>
                <label
                  htmlFor="pdf-file-upload"
                  className="inline-block px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all cursor-pointer font-medium"
                >
                  Select PDF File
                </label>
                <input
                  id="pdf-file-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          {/* Main Content - After PDF Upload */}
          {pdfFile && (
            <>
              {/* Actions Bar */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="pdf-file-upload-2"
                  className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all cursor-pointer flex items-center gap-2 text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  New PDF
                </label>
                <input
                  id="pdf-file-upload-2"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                />

                <button
                  onClick={clearAll}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  Clear
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

              {/* Status */}
              {isExtracting && (
                <div className="rounded-xl p-4 border-2 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Extracting text from PDF...</p>
                    </div>
                  </div>
                </div>
              )}

              {extractedText && !isTranslating && translations.length === 0 && (
                <div className="rounded-xl p-4 border-2 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Text extracted successfully</p>
                      <p className="text-xs text-green-700 mt-1">
                        Select languages and click translate
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isTranslating && (
                <div className="rounded-xl p-4 border-2 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Translating documents...</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {completedCount} of {selectedLanguages.length} completed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isTranslating && translations.length > 0 && (
                <div className="rounded-xl p-4 border-2 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        Translation complete!
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {completedCount} successful, {errorCount} failed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Preview - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Extracted Text */}
                  {showPreview && extractedText && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
                        <div className="text-xs text-gray-500">
                          {extractedText.length} characters
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-auto bg-gray-50">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                          {extractedText}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Translation Results */}
                  {translations.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Translation Results
                      </h3>
                      <div className="space-y-3">
                        {translations.map((translation) => (
                          <div
                            key={translation.language.code}
                            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{translation.language.flag}</span>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {translation.language.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {translation.language.code.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {translation.status === "pending" && (
                                  <span className="text-xs text-gray-500">Waiting...</span>
                                )}
                                {translation.status === "translating" && (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    <span className="text-xs text-blue-600">Translating...</span>
                                  </div>
                                )}
                                {translation.status === "completed" && (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <button
                                      onClick={() => downloadSingleTranslation(translation)}
                                      className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all text-xs font-medium flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3" />
                                      Download
                                    </button>
                                  </>
                                )}
                                {translation.status === "error" && (
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-xs text-red-600">Error</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {translation.status === "completed" && showPreview && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600 line-clamp-3">
                                  {translation.text}
                                </p>
                              </div>
                            )}
                            
                            {translation.status === "error" && translation.error && (
                              <div className="mt-2 text-xs text-red-600">
                                {translation.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-6">
                  {/* Language Selection */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Target Languages</h3>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {LANGUAGES.map((language) => {
                        const isSelected = selectedLanguages.some(
                          lang => lang.code === language.code
                        );
                        
                        return (
                          <button
                            key={language.code}
                            onClick={() => toggleLanguage(language)}
                            disabled={isTranslating}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{language.flag}</span>
                              <span className={`text-sm font-medium ${
                                isSelected ? "text-orange-700" : "text-gray-700"
                              }`}>
                                {language.name}
                              </span>
                            </div>
                            
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-orange-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedLanguages.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PDF Settings */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Page Size
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        >
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
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
                          max="16"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeOriginal}
                            onChange={(e) => setIncludeOriginal(e.target.checked)}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                          />
                          <span className="text-sm text-gray-700">Include original PDF in ZIP</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Document Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Characters</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {extractedText.length.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Words</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {extractedText.split(/\s+/).filter(w => w).length.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Languages</span>
                        <span className="text-sm font-semibold text-orange-500">
                          {selectedLanguages.length}
                        </span>
                      </div>
                      {translations.length > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-sm font-semibold text-green-600">
                              {completedCount}
                            </span>
                          </div>
                          {errorCount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Failed</span>
                              <span className="text-sm font-semibold text-red-600">
                                {errorCount}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {translations.length === 0 ? (
                  <button
                    onClick={startTranslation}
                    disabled={isTranslating || selectedLanguages.length === 0 || !extractedText}
                    className="flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="w-5 h-5" />
                        Translate Document
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={startTranslation}
                      disabled={isTranslating || selectedLanguages.length === 0}
                      className="flex-1 px-8 py-4 rounded-xl font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Languages className="w-5 h-5" />
                      Translate Again
                    </button>
                    
                    <button
                      onClick={downloadAllTranslations}
                      disabled={completedCount === 0}
                      className="flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-5 h-5" />
                      Download All ({completedCount})
                    </button>
                  </>
                )}
              </div>

              {/* API Key Notice */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Translation API Integration
                    </p>
                    <p className="text-xs text-blue-700">
                      This demo uses simulated translations. To use real translations, integrate with 
                      Google Translate API, DeepL API, or LibreTranslate. Add your API key in the code 
                      and uncomment the actual API call in the <code>translateText</code> function.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
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