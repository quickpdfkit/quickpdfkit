"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function ToolLoading() {
  return (
    <div className="flex justify-center py-16" aria-hidden="true">
      <div className="h-10 w-10 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
    </div>
  );
}

const toolComponents: Record<string, ComponentType> = {
  "merge-pdf": dynamic(() => import("@/components/tools/first12tools/MergePDF"), { ssr: false, loading: ToolLoading }),
  "merge-pdf-and-images": dynamic(() => import("@/components/tools/first12tools/PdfImageMerger"), { ssr: false, loading: ToolLoading }),
  "merge-pdf-text": dynamic(() => import("@/components/tools/first12tools/PdfTextMerger"), { ssr: false, loading: ToolLoading }),
  "split-pdf-online": dynamic(() => import("@/components/tools/first12tools/PdfSplitter"), { ssr: false, loading: ToolLoading }),
  "split-pdf-into-parts": dynamic(() => import("@/components/tools/first12tools/PdfDivideByParts"), { ssr: false, loading: ToolLoading }),
  "split-pdf-text": dynamic(() => import("@/components/tools/first12tools/PdfTextSplitter"), { ssr: false, loading: ToolLoading }),
  "compress-pdf": dynamic(() => import("@/components/tools/first12tools/PdfCompressor"), { ssr: false, loading: ToolLoading }),
  "edit-pdf": dynamic(() => import("@/components/tools/forth12tools/EditPdf"), { ssr: false, loading: ToolLoading }),
  "protect-pdf": dynamic(() => import("@/components/tools/first12tools/PdfProtector"), { ssr: false, loading: ToolLoading }),
  "add-blank-pages-to-pdf": dynamic(() => import("@/components/tools/first12tools/AddPdfPages"), { ssr: false, loading: ToolLoading }),
  "add-watermark-to-pdf": dynamic(() => import("@/components/tools/first12tools/PdfWaterMark"), { ssr: false, loading: ToolLoading }),
  "add-text-to-pdf": dynamic(() => import("@/components/tools/first12tools/PdfTextInsert"), { ssr: false, loading: ToolLoading }),
  "add-page-number-to-pdf": dynamic(() => import("@/components/tools/second12tools/AddPageNumbers"), { ssr: false, loading: ToolLoading }),
  "add-pdf-meta-data": dynamic(() => import("@/components/tools/second12tools/PdfMetadataEditor"), { ssr: false, loading: ToolLoading }),
  "add-stroke-to-pdf": dynamic(() => import("@/components/tools/second12tools/AddPdfStroke"), { ssr: false, loading: ToolLoading }),
  "crop-pdf": dynamic(() => import("@/components/tools/second12tools/PdfCropper"), { ssr: false, loading: ToolLoading }),
  "crop-pdf-online": dynamic(() => import("@/components/tools/second12tools/CropPdfOnline"), { ssr: false, loading: ToolLoading }),
  "rotate-pdf": dynamic(() => import("@/components/tools/second12tools/PdfRotator"), { ssr: false, loading: ToolLoading }),
  "reverse-pdf": dynamic(() => import("@/components/tools/second12tools/ReversePdf"), { ssr: false, loading: ToolLoading }),
  "pdf-reader": dynamic(() => import("@/components/tools/second12tools/PdfViewer"), { ssr: false, loading: ToolLoading }),
  "extract-pdf-pages": dynamic(() => import("@/components/tools/second12tools/ExtractPdfPages"), { ssr: false, loading: ToolLoading }),
  "remove-pdf-pages": dynamic(() => import("@/components/tools/second12tools/RemovePdfPages"), { ssr: false, loading: ToolLoading }),
  "extract-images-from-pdf": dynamic(() => import("@/components/tools/second12tools/ExtractPdfImages"), { ssr: false, loading: ToolLoading }),
  "image-to-pdf-converter": dynamic(() => import("@/components/tools/second12tools/ImageToPdf"), { ssr: false, loading: ToolLoading }),
  "jpg-to-pdf": dynamic(() => import("@/components/tools/third12tools/JpgToPdf"), { ssr: false, loading: ToolLoading }),
  "png-to-pdf-converter": dynamic(() => import("@/components/tools/third12tools/PngToPdf"), { ssr: false, loading: ToolLoading }),
  "webp-to-pdf-converter": dynamic(() => import("@/components/tools/third12tools/WebpToPdf"), { ssr: false, loading: ToolLoading }),
  "svg-to-pdf-converter": dynamic(() => import("@/components/tools/third12tools/SvgToPdf"), { ssr: false, loading: ToolLoading }),
  "ico-to-pdf": dynamic(() => import("@/components/tools/third12tools/IcoToPdf"), { ssr: false, loading: ToolLoading }),
  "tga-to-pdf-converter": dynamic(() => import("@/components/tools/third12tools/TgaToPdf"), { ssr: false, loading: ToolLoading }),
  "pdf-to-image-converter": dynamic(() => import("@/components/tools/third12tools/PdfToImage"), { ssr: false, loading: ToolLoading }),
  "pdf-to-jpg": dynamic(() => import("@/components/tools/third12tools/PdfToJpg"), { ssr: false, loading: ToolLoading }),
  "pdf-to-png": dynamic(() => import("@/components/tools/third12tools/PdfToPng"), { ssr: false, loading: ToolLoading }),
  "pdf-to-webp-converter": dynamic(() => import("@/components/tools/third12tools/PdfToWebp"), { ssr: false, loading: ToolLoading }),
  "word-to-pdf": dynamic(() => import("@/components/tools/third12tools/WordToPdf"), { ssr: false, loading: ToolLoading }),
  "word-to-pdf-simple": dynamic(() => import("@/components/tools/third12tools/WordToPdfSimple"), { ssr: false, loading: ToolLoading }),
  "convert-pdf-to-word": dynamic(() => import("@/components/tools/forth12tools/PdfToWord"), { ssr: false, loading: ToolLoading }),
  "pdf-to-word-simple": dynamic(() => import("@/components/tools/forth12tools/PdfToWordSimple"), { ssr: false, loading: ToolLoading }),
  "excel-to-pdf": dynamic(() => import("@/components/tools/forth12tools/ExcelToPdf"), { ssr: false, loading: ToolLoading }),
  "convert-pdf-to-excel": dynamic(() => import("@/components/tools/forth12tools/PdfToExcel"), { ssr: false, loading: ToolLoading }),
  "text-to-pdf-converter": dynamic(() => import("@/components/tools/forth12tools/TextToPdf"), { ssr: false, loading: ToolLoading }),
  "txt-to-pdf-converter": dynamic(() => import("@/components/tools/forth12tools/TxtToPdf"), { ssr: false, loading: ToolLoading }),
  "pdf-to-text": dynamic(() => import("@/components/tools/forth12tools/PdfToText"), { ssr: false, loading: ToolLoading }),
  "json-to-pdf": dynamic(() => import("@/components/tools/forth12tools/JsonToPdf"), { ssr: false, loading: ToolLoading }),
  "pdf-to-json": dynamic(() => import("@/components/tools/forth12tools/PdfToJson"), { ssr: false, loading: ToolLoading }),
  "sign-pdf": dynamic(() => import("@/components/tools/forth12tools/SignPdf"), { ssr: false, loading: ToolLoading }),
  "translate-pdf-text": dynamic(() => import("@/components/tools/forth12tools/TranslatePdf"), { ssr: false, loading: ToolLoading }),
  "hyper-compress-pdf": dynamic(() => import("@/components/tools/first12tools/HyperPdfCompressor"), { ssr: false, loading: ToolLoading }),
};

export default function ClientTool({ id }: { id: string }) {
  const Tool = toolComponents[id];
  if (!Tool) return null;
  return <Tool />;
}
