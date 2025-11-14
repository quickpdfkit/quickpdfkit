import HyperPdfCompressor from "@/components/tools/first12tools/HyperPdfCompressor";
import MergePDF from "@/components/tools/first12tools/MergePDF";
import PdfCompressor from "@/components/tools/first12tools/PdfCompressor";
import PdfDivideByParts from "@/components/tools/first12tools/PdfDivideByParts";
import PdfImageMerger from "@/components/tools/first12tools/PdfImageMerger";
import PdfPageManager from "@/components/tools/first12tools/AddPdfPages";
import PdfProtector from "@/components/tools/first12tools/PdfProtector";
import PdfSplitter from "@/components/tools/first12tools/PdfSplitter";
import PdfTextInsert from "@/components/tools/first12tools/PdfTextInsert";
import PdfTextMerger from "@/components/tools/first12tools/PdfTextMerger";
import PdfTextSplitter from "@/components/tools/first12tools/PdfTextSplitter";
import PdfWatermark from "@/components/tools/first12tools/PdfWaterMark";
import AddPageNumbers from "@/components/tools/second12tools/AddPageNumbers";
import PdfMetadataEditor from "@/components/tools/second12tools/PdfMetadataEditor";
import PdfStrokeAnnotator from "@/components/tools/second12tools/AddPdfStroke";
import PdfCropper from "@/components/tools/second12tools/PdfCropper";
import CropPdfOnline from "@/components/tools/second12tools/CropPdfOnline";
import PdfRotator from "@/components/tools/second12tools/PdfRotator";
import ReversePdf from "@/components/tools/second12tools/ReversePdf";
import PdfViewer from "@/components/tools/second12tools/PdfViewer";
import ExtractPdf from "@/components/tools/second12tools/ExtractPdfPages";
import RemovePdfPages from "@/components/tools/second12tools/RemovePdfPages";
import ExtractImages from "@/components/tools/second12tools/ExtractPdfImages";
import ImageToPdf from "@/components/tools/second12tools/ImageToPdf";
import JpgToPdf from "@/components/tools/third12tools/JpgToPdf";
import PngToPdf from "@/components/tools/third12tools/PngToPdf";
import WebpToPdf from "@/components/tools/third12tools/WebpToPdf";
import SvgToPdf from "@/components/tools/third12tools/SvgToPdf";
import IcoToPdf from "@/components/tools/third12tools/IcoToPdf";
import TgaToPdf from "@/components/tools/third12tools/TgaToPdf";
import PdfToImage from "@/components/tools/third12tools/PdfToImage";
import PdfToJpg from "@/components/tools/third12tools/PdfToJpg";
import PdfToPng from "@/components/tools/third12tools/PdfToPng";
import PdfToWebp from "@/components/tools/third12tools/PdfToWebp";
import WordToPdf from "@/components/tools/third12tools/WordToPdf";
import WordToPdfSimple from "@/components/tools/third12tools/WordToPdfSimple";
import PdfToWord from "@/components/tools/forth12tools/PdfToWord";
import PdfToWordSimple from "@/components/tools/forth12tools/PdfToWordSimple";
import ExcelToPdf from "@/components/tools/forth12tools/ExcelToPdf";
import PdfToExcel from "@/components/tools/forth12tools/PdfToExcel";
import TextToPdf from "@/components/tools/forth12tools/TextToPdf";
import TxtToPdf from "@/components/tools/forth12tools/TxtToPdf";
import PdfToText from "@/components/tools/forth12tools/PdfToText";
import JsonToPdf from "@/components/tools/forth12tools/JsonToPdf";
import PdfToJson from "@/components/tools/forth12tools/PdfToJson";
import EditPdf from "@/components/tools/forth12tools/EditPdf";
import SignPdf from "@/components/tools/forth12tools/SignPdf";
import TranslatePdf from "@/components/tools/forth12tools/TranslatePdf";


export interface ToolConfig {

  component: React.ComponentType;
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

export const toolsMap: Record<string, ToolConfig> = {

  // first 12 tools

  "merge-pdf": {
    component: MergePDF,
    metadata: {
      title: "Merge PDF Files Online | Free PDF Merger Tool",
      description: "Combine multiple PDF files into a single PDF quickly and securely. Free online tool with no file size limits.",
      keywords: ["merge pdf", "combine pdf", "pdf merger", "join pdf"],
    },
  },
  "merge-pdf-and-images": {
    component: PdfImageMerger,
    metadata: {
      title: "Merge PDF Files & Images Online | Free PDF Merger Tool",
      description: "Easily merge multiple PDF files or images into a single PDF document online. Fast, secure, and free.",
    },
  },
  "merge-pdf-text": {
    component: PdfTextMerger,
    metadata: {
      title: "Merge PDF Text Online | Free PDF Text Merger Tool",
      description: "Combine text content from multiple PDFs into a single PDF quickly and securely. Free online tool.",
    },
  },
  "split-pdf-online": {
    component: PdfSplitter,
    metadata: {
      title: "Split PDF Online | Free PDF Splitter Tool",
      description: "Split your PDF into individual pages or smaller PDFs easily. Fast, secure, and free.",
    },
  },
  "split-pdf-into-parts": {
    component: PdfDivideByParts,
    metadata: {
      title: "Divide PDF Into Parts | Free PDF Splitter Tool",
      description: "Divide a PDF into multiple parts or sections quickly and easily online.",
    },
  },
  "split-pdf-text": {
    component: PdfTextSplitter,
    metadata: {
      title: "Split PDF Text Online | Free PDF Text Splitter Tool",
      description: "Split the text content of PDF files into separate documents online. Quick, secure, and free.",
    },
  },
  "compress-pdf": {
    component: PdfCompressor,
    metadata: {
      title: "Compress PDF Online | Free PDF Compressor Tool",
      description: "Reduce the file size of your PDF documents without losing quality. Free and fast online PDF compression.",
    },
  },
  "edit-pdf": {
    component: EditPdf,
    metadata: {
      title: "Edit PDF Online | Free PDF Editor Tool",
      description: "Edit, modify, and annotate your PDF files easily online without downloading any software.",
    },
  },
  "protect-pdf": {
    component: PdfProtector,
    metadata: {
      title: "Protect PDF Online | Add Password & Security",
      description: "Secure your PDF files by adding passwords or permissions. Keep your documents safe online.",
    },
  },
  "add-blank-pages-to-pdf": {
    component: PdfPageManager,
    metadata: {
      title: "Add Blank Pages to PDF | Free PDF Page Manager",
      description: "Insert blank pages into your PDF or manage existing pages quickly and easily online.",
    },
  },
  "add-watermark-to-pdf": {
    component: PdfWatermark,
    metadata: {
      title: "Add Watermark to PDF Online | Text & Image Watermark",
      description: "Apply text or image watermarks to your PDF documents online. Keep your content protected and branded.",
    },
  },
  "add-text-to-pdf": {
    component: PdfTextInsert,
    metadata: {
      title: "Add Text to PDF Online | Free PDF Text Editor",
      description: "Insert custom text into your PDF documents quickly and easily using this free online tool.",
    },
  },

  // second 12 tools
  "add-page-number-to-pdf": {
    component: AddPageNumbers,
    metadata: {
      title: "Add Page Numbers to PDF Online | Free PDF Editor",
      description: "Easily insert page numbers into your PDF documents online. Customize the position and style of the numbers quickly and for free.",
    },
  },

  "add-pdf-meta-data": {
    component: PdfMetadataEditor,
    metadata: {
      title: "Edit PDF Metadata Online | Free PDF Tool",
      description: "Modify the metadata of your PDF files, including title, author, subject, and keywords, directly in your browser.",
    },
  },

  "add-stroke-to-pdf": {
    component: PdfStrokeAnnotator,
    metadata: {
      title: "Draw or Annotate PDF Online | Free PDF Editor",
      description: "Add strokes, highlights, or annotations to your PDF documents easily with this online tool.",
    },
  },

  "crop-pdf": {
    component: PdfCropper,
    metadata: {
      title: "Crop PDF Pages Online | Free PDF Tool",
      description: "Trim or crop PDF pages to remove unwanted areas or adjust page size quickly and easily online.",
    },
  },

  "crop-pdf-online": {
    component: CropPdfOnline,
    metadata: {
      title: "Crop PDF Online | Free PDF Editor",
      description: "Easily crop pages of your PDF documents online. Adjust page size or remove unnecessary margins in seconds.",
    },
  },

  "rotate-pdf": {
    component: PdfRotator,
    metadata: {
      title: "Rotate PDF Pages Online | Free PDF Editor",
      description: "Rotate PDF pages clockwise or counterclockwise with this free online tool. Perfect for adjusting scanned documents.",
    },
  },

  "reverse-pdf": {
    component: ReversePdf,
    metadata: {
      title: "Reverse PDF Pages Online | Free PDF Tool",
      description: "Reorder your PDF pages in reverse or custom order quickly and easily online.",
    },
  },

  "pdf-reader": {
    component: PdfViewer,
    metadata: {
      title: "View PDF Online | Free PDF Reader",
      description: "Open and read PDF documents directly in your browser without downloading any software.",
    },
  },

  "extract-pdf-pages": {
    component: ExtractPdf,
    metadata: {
      title: "Extract PDF Pages Online | Free PDF Tool",
      description: "Select and extract specific pages from your PDF documents quickly and download them as a new PDF.",
    },
  },

  "remove-pdf-pages": {
    component: RemovePdfPages,
    metadata: {
      title: "Remove Pages from PDF Online | Free PDF Editor",
      description: "Delete unwanted pages from your PDF files easily with this online tool.",
    },
  },

  "extract-images-from-pdf": {
    component: ExtractImages,
    metadata: {
      title: "Extract Images from PDF Online | Free PDF Tool",
      description: "Pull images out of PDF documents quickly and download them as separate files.",
    },
  },

  "image-to-pdf-converter": {
    component: ImageToPdf,
    metadata: {
      title: "Convert Images to PDF Online | Free PDF Tool",
      description: "Convert your images (JPG, PNG, etc.) into a single PDF file quickly and easily online.",
    },
  },



  // 3rd 12 tools
  "jpg-to-pdf": {
    component: JpgToPdf,
    metadata: {
      title: "JPG to PDF Converter | Convert JPG Images to PDF Online",
      description: "Easily convert your JPG images into a single, high-quality PDF file online for free.",
    },
  },
  "png-to-pdf-converter": {
    component: PngToPdf,
    metadata: {
      title: "PNG to PDF Converter | Convert PNG Images to PDF Online",
      description: "Convert your PNG images into a single PDF file instantly with our free online converter.",
    },
  },
  "webp-to-pdf-converter": {
    component: WebpToPdf,
    metadata: {
      title: "WEBP to PDF Converter | Free Online Image to PDF Tool",
      description: "Turn WEBP images into PDF documents quickly and easily with this free online converter.",
    },
  },
  "svg-to-pdf-converter": {
    component: SvgToPdf,
    metadata: {
      title: "SVG to PDF Converter | Convert SVG Files to PDF Online",
      description: "Convert SVG vector images into PDF files online without losing quality or detail.",
    },
  },
  "ico-to-pdf": {
    component: IcoToPdf,
    metadata: {
      title: "ICO to PDF Converter | Convert Icons to PDF Online",
      description: "Easily convert ICO icon files into PDF format for easy sharing and storage.",
    },
  },
  "tga-to-pdf-converter": {
    component: TgaToPdf,
    metadata: {
      title: "TGA to PDF Converter | Convert TGA Images to PDF Online",
      description: "Free online tool to convert your TGA images into a single PDF file quickly.",
    },
  },
  "pdf-to-image-converter": {
    component: PdfToImage,
    metadata: {
      title: "PDF to Image Converter | Convert PDF Pages to Images Online",
      description: "Convert your PDF pages into high-quality images (JPG, PNG, etc.) easily online.",
    },
  },
  "pdf-to-jpg": {
    component: PdfToJpg,
    metadata: {
      title: "PDF to JPG Converter | Convert PDF Pages to JPG Online",
      description: "Quickly convert your PDF files into JPG images online for free.",
    },
  },
  "pdf-to-png": {
    component: PdfToPng,
    metadata: {
      title: "PDF to PNG Converter | Convert PDF to PNG Online",
      description: "Extract all PDF pages as PNG images with our free online converter.",
    },
  },
  "pdf-to-webp-converter": {
    component: PdfToWebp,
    metadata: {
      title: "PDF to WEBP Converter | Convert PDF to WEBP Images Online",
      description: "Easily convert PDF files into WEBP images for optimized storage and sharing.",
    },
  },
  "word-to-pdf": {
    component: WordToPdf,
    metadata: {
      title: "Word to PDF Converter | Convert DOC or DOCX to PDF Online",
      description: "Convert your Word documents into professional, print-ready PDF files instantly online.",
    },
  },
  "word-to-pdf-simple": {
    component: WordToPdfSimple,
    metadata: {
      title: "Simple Word to PDF Converter | Free Online DOC to PDF Tool",
      description: "A simple, one-click tool to convert your Word files to PDF quickly and easily.",
    },
  },

  // 4th 12 tools
  "convert-pdf-to-word": {
    component: PdfToWord,
    metadata: {
      title: "PDF to Word Converter | Convert PDF Files to DOCX Online",
      description: "Easily convert PDF files into editable Word documents online for free.",
    },
  },
  "pdf-to-word-simple": {
    component: PdfToWordSimple,
    metadata: {
      title: "Simple PDF to Word Converter | Free Online Tool",
      description: "Quickly convert PDF files to editable DOCX format with this simple online tool.",
    },
  },
  "excel-to-pdf": {
    component: ExcelToPdf,
    metadata: {
      title: "Excel to PDF Converter | Convert XLS or XLSX to PDF Online",
      description: "Convert your Excel spreadsheets into PDF format while preserving layout and formatting.",
    },
  },
  "convert-pdf-to-excel": {
    component: PdfToExcel,
    metadata: {
      title: "PDF to Excel Converter | Convert PDF Tables to XLSX Online",
      description: "Extract tables and data from PDF documents and convert them into editable Excel files.",
    },
  },
  "text-to-pdf-converter": {
    component: TextToPdf,
    metadata: {
      title: "Text to PDF Converter | Convert Plain Text to PDF Online",
      description: "Convert your plain text content into a well-formatted PDF file in seconds.",
    },
  },
  "txt-to-pdf-converter": {
    component: TxtToPdf,
    metadata: {
      title: "TXT to PDF Converter | Convert .txt Files to PDF Online",
      description: "Free online tool to convert your .txt files into readable and printable PDF documents.",
    },
  },
  "pdf-to-text": {
    component: PdfToText,
    metadata: {
      title: "PDF to Text Converter | Extract Text from PDF Online",
      description: "Extract text content from your PDF files easily and convert it into plain text format.",
    },
  },
  "json-to-pdf": {
    component: JsonToPdf,
    metadata: {
      title: "JSON to PDF Converter | Convert JSON Data to PDF Online",
      description: "Convert your structured JSON data into a clean, printable PDF format instantly.",
    },
  },
  "pdf-to-json": {
    component: PdfToJson,
    metadata: {
      title: "PDF to JSON Converter | Extract PDF Data as JSON Online",
      description: "Easily convert PDF files into structured JSON data for processing or storage.",
    },
  },
  "sign-pdf": {
    component: SignPdf,
    metadata: {
      title: "Sign PDF Online | Add Digital Signatures to PDF Files",
      description: "Add your digital or electronic signature to PDF files securely and easily online.",
    },
  },
  "translate-pdf-text": {
    component: TranslatePdf,
    metadata: {
      title: "Translate PDF Text Online | Free PDF Translator Tool",
      description: "Translate text within PDF documents into multiple languages easily using this free online tool.",
    },
  },
    "hyper-compress-pdf": {
    component: HyperPdfCompressor,
    metadata: {
      title: "Hyper Compress PDF Online | Ultra-Fast PDF Compressor",
      description: "Compress PDF files to the smallest size possible while maintaining quality. Fast, secure, and free.",
    },
  },

};
