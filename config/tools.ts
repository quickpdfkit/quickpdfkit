import HyperPdfCompressor from "@/components/tools/HyperPdfCompressor";
import MergePDF from "@/components/tools/MergePDF";
import PdfCompressor from "@/components/tools/PdfCompressor";
import PdfDivideByParts from "@/components/tools/PdfDivideByParts";
import PdfImageMerger from "@/components/tools/PdfImageMerger";
import PdfPageManager from "@/components/tools/PdfPageManager";
import PdfProtector from "@/components/tools/PdfProtector";
import PdfSplitter from "@/components/tools/PdfSplitter";
import PdfTextInsert from "@/components/tools/PdfTextInsert";
import PdfTextMerger from "@/components/tools/PdfTextMerger";
import PdfTextSplitter from "@/components/tools/PdfTextSplitter";
import PdfWatermark from "@/components/tools/PdfWaterMark";


export interface ToolConfig {

  component: React.ComponentType;
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

export const toolsMap: Record<string, ToolConfig> = {
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
  "hyper-compress-pdf": {
    component: HyperPdfCompressor,
    metadata: {
      title: "Hyper Compress PDF Online | Ultra-Fast PDF Compressor",
      description: "Compress PDF files to the smallest size possible while maintaining quality. Fast, secure, and free.",
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
};
