export interface ToolConfig {
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

export const toolsMap: Record<string, ToolConfig> = {

  // first 12 tools

  "merge-pdf": {
    metadata: {
      title: "Merge PDF Files Online | Free PDF Merger Tool",
      description: "Combine multiple PDF files into a single PDF quickly and securely. Free online tool with no file size limits.",
      keywords: ["merge pdf", "combine pdf", "pdf merger", "join pdf"],
    },
  },
  "merge-pdf-and-images": {
    metadata: {
      title: "Merge PDF Files & Images Online | Free PDF Merger Tool",
      description: "Easily merge multiple PDF files or images into a single PDF document online. Fast, secure, and free.",
    },
  },
  "merge-pdf-text": {
    metadata: {
      title: "Merge PDF Text Online | Free PDF Text Merger Tool",
      description: "Combine text content from multiple PDFs into a single PDF quickly and securely. Free online tool.",
    },
  },
  "split-pdf-online": {
    metadata: {
      title: "Split PDF Online | Free PDF Splitter Tool",
      description: "Split your PDF into individual pages or smaller PDFs easily. Fast, secure, and free.",
    },
  },
  "split-pdf-into-parts": {
    metadata: {
      title: "Divide PDF Into Parts | Free PDF Splitter Tool",
      description: "Divide a PDF into multiple parts or sections quickly and easily online.",
    },
  },
  "split-pdf-text": {
    metadata: {
      title: "Split PDF Text Online | Free PDF Text Splitter Tool",
      description: "Split the text content of PDF files into separate documents online. Quick, secure, and free.",
    },
  },
  "compress-pdf": {
    metadata: {
      title: "Compress PDF Online | Free PDF Compressor Tool",
      description: "Reduce the file size of your PDF documents without losing quality. Free and fast online PDF compression.",
    },
  },
  "edit-pdf": {
    metadata: {
      title: "Edit PDF Online | Free PDF Editor Tool",
      description: "Edit, modify, and annotate your PDF files easily online without downloading any software.",
    },
  },
  "protect-pdf": {
    metadata: {
      title: "Protect PDF Online | Add Password & Security",
      description: "Secure your PDF files by adding passwords or permissions. Keep your documents safe online.",
    },
  },
  "add-blank-pages-to-pdf": {
    metadata: {
      title: "Add Blank Pages to PDF | Free PDF Page Manager",
      description: "Insert blank pages into your PDF or manage existing pages quickly and easily online.",
    },
  },
  "add-watermark-to-pdf": {
    metadata: {
      title: "Add Watermark to PDF Online | Text & Image Watermark",
      description: "Apply text or image watermarks to your PDF documents online. Keep your content protected and branded.",
    },
  },
  "add-text-to-pdf": {
    metadata: {
      title: "Add Text to PDF Online | Free PDF Text Editor",
      description: "Insert custom text into your PDF documents quickly and easily using this free online tool.",
    },
  },

  // second 12 tools
  "add-page-number-to-pdf": {
    metadata: {
      title: "Add Page Numbers to PDF Online | Free PDF Editor",
      description: "Easily insert page numbers into your PDF documents online. Customize the position and style of the numbers quickly and for free.",
    },
  },

  "add-pdf-meta-data": {
    metadata: {
      title: "Edit PDF Metadata Online | Free PDF Tool",
      description: "Modify the metadata of your PDF files, including title, author, subject, and keywords, directly in your browser.",
    },
  },

  "add-stroke-to-pdf": {
    metadata: {
      title: "Draw or Annotate PDF Online | Free PDF Editor",
      description: "Add strokes, highlights, or annotations to your PDF documents easily with this online tool.",
    },
  },

  "crop-pdf": {
    metadata: {
      title: "Crop PDF Pages Online | Free PDF Tool",
      description: "Trim or crop PDF pages to remove unwanted areas or adjust page size quickly and easily online.",
    },
  },

  "crop-pdf-online": {
    metadata: {
      title: "Crop PDF Online | Free PDF Editor",
      description: "Easily crop pages of your PDF documents online. Adjust page size or remove unnecessary margins in seconds.",
    },
  },

  "rotate-pdf": {
    metadata: {
      title: "Rotate PDF Pages Online | Free PDF Editor",
      description: "Rotate PDF pages clockwise or counterclockwise with this free online tool. Perfect for adjusting scanned documents.",
    },
  },

  "reverse-pdf": {
    metadata: {
      title: "Reverse PDF Pages Online | Free PDF Tool",
      description: "Reorder your PDF pages in reverse or custom order quickly and easily online.",
    },
  },

  "pdf-reader": {
    metadata: {
      title: "View PDF Online | Free PDF Reader",
      description: "Open and read PDF documents directly in your browser without downloading any software.",
    },
  },

  "extract-pdf-pages": {
    metadata: {
      title: "Extract PDF Pages Online | Free PDF Tool",
      description: "Select and extract specific pages from your PDF documents quickly and download them as a new PDF.",
    },
  },

  "remove-pdf-pages": {
    metadata: {
      title: "Remove Pages from PDF Online | Free PDF Editor",
      description: "Delete unwanted pages from your PDF files easily with this online tool.",
    },
  },

  "extract-images-from-pdf": {
    metadata: {
      title: "Extract Images from PDF Online | Free PDF Tool",
      description: "Pull images out of PDF documents quickly and download them as separate files.",
    },
  },

  "image-to-pdf-converter": {
    metadata: {
      title: "Convert Images to PDF Online | Free PDF Tool",
      description: "Convert your images (JPG, PNG, etc.) into a single PDF file quickly and easily online.",
    },
  },



  // 3rd 12 tools
  "jpg-to-pdf": {
    metadata: {
      title: "JPG to PDF Converter | Convert JPG Images to PDF Online",
      description: "Easily convert your JPG images into a single, high-quality PDF file online for free.",
    },
  },
  "png-to-pdf-converter": {
    metadata: {
      title: "PNG to PDF Converter | Convert PNG Images to PDF Online",
      description: "Convert your PNG images into a single PDF file instantly with our free online converter.",
    },
  },
  "webp-to-pdf-converter": {
    metadata: {
      title: "WEBP to PDF Converter | Free Online Image to PDF Tool",
      description: "Turn WEBP images into PDF documents quickly and easily with this free online converter.",
    },
  },
  "svg-to-pdf-converter": {
    metadata: {
      title: "SVG to PDF Converter | Convert SVG Files to PDF Online",
      description: "Convert SVG vector images into PDF files online without losing quality or detail.",
    },
  },
  "ico-to-pdf": {
    metadata: {
      title: "ICO to PDF Converter | Convert Icons to PDF Online",
      description: "Easily convert ICO icon files into PDF format for easy sharing and storage.",
    },
  },
  "tga-to-pdf-converter": {
    metadata: {
      title: "TGA to PDF Converter | Convert TGA Images to PDF Online",
      description: "Free online tool to convert your TGA images into a single PDF file quickly.",
    },
  },
  "pdf-to-image-converter": {
    metadata: {
      title: "PDF to Image Converter | Convert PDF Pages to Images Online",
      description: "Convert your PDF pages into high-quality images (JPG, PNG, etc.) easily online.",
    },
  },
  "pdf-to-jpg": {
    metadata: {
      title: "PDF to JPG Converter | Convert PDF Pages to JPG Online",
      description: "Quickly convert your PDF files into JPG images online for free.",
    },
  },
  "pdf-to-png": {
    metadata: {
      title: "PDF to PNG Converter | Convert PDF to PNG Online",
      description: "Extract all PDF pages as PNG images with our free online converter.",
    },
  },
  "pdf-to-webp-converter": {
    metadata: {
      title: "PDF to WEBP Converter | Convert PDF to WEBP Images Online",
      description: "Easily convert PDF files into WEBP images for optimized storage and sharing.",
    },
  },
  "word-to-pdf": {
    metadata: {
      title: "Word to PDF Converter | Convert DOC or DOCX to PDF Online",
      description: "Convert your Word documents into professional, print-ready PDF files instantly online.",
    },
  },
  "word-to-pdf-simple": {
    metadata: {
      title: "Simple Word to PDF Converter | Free Online DOC to PDF Tool",
      description: "A simple, one-click tool to convert your Word files to PDF quickly and easily.",
    },
  },

  // 4th 12 tools
  "convert-pdf-to-word": {
    metadata: {
      title: "PDF to Word Converter | Convert PDF Files to DOCX Online",
      description: "Easily convert PDF files into editable Word documents online for free.",
    },
  },
  "pdf-to-word-simple": {
    metadata: {
      title: "Simple PDF to Word Converter | Free Online Tool",
      description: "Quickly convert PDF files to editable DOCX format with this simple online tool.",
    },
  },
  "excel-to-pdf": {
    metadata: {
      title: "Excel to PDF Converter | Convert XLS or XLSX to PDF Online",
      description: "Convert your Excel spreadsheets into PDF format while preserving layout and formatting.",
    },
  },
  "convert-pdf-to-excel": {
    metadata: {
      title: "PDF to Excel Converter | Convert PDF Tables to XLSX Online",
      description: "Extract tables and data from PDF documents and convert them into editable Excel files.",
    },
  },
  "text-to-pdf-converter": {
    metadata: {
      title: "Text to PDF Converter | Convert Plain Text to PDF Online",
      description: "Convert your plain text content into a well-formatted PDF file in seconds.",
    },
  },
  "txt-to-pdf-converter": {
    metadata: {
      title: "TXT to PDF Converter | Convert .txt Files to PDF Online",
      description: "Free online tool to convert your .txt files into readable and printable PDF documents.",
    },
  },
  "pdf-to-text": {
    metadata: {
      title: "PDF to Text Converter | Extract Text from PDF Online",
      description: "Extract text content from your PDF files easily and convert it into plain text format.",
    },
  },
  "json-to-pdf": {
    metadata: {
      title: "JSON to PDF Converter | Convert JSON Data to PDF Online",
      description: "Convert your structured JSON data into a clean, printable PDF format instantly.",
    },
  },
  "pdf-to-json": {
    metadata: {
      title: "PDF to JSON Converter | Extract PDF Data as JSON Online",
      description: "Easily convert PDF files into structured JSON data for processing or storage.",
    },
  },
  "sign-pdf": {
    metadata: {
      title: "Sign PDF Online | Add Digital Signatures to PDF Files",
      description: "Add your digital or electronic signature to PDF files securely and easily online.",
    },
  },
  "translate-pdf-text": {
    metadata: {
      title: "Translate PDF Text Online | Free PDF Translator Tool",
      description: "Translate text within PDF documents into multiple languages easily using this free online tool.",
    },
  },
    "hyper-compress-pdf": {
    metadata: {
      title: "Hyper Compress PDF Online | Ultra-Fast PDF Compressor",
      description: "Compress PDF files to the smallest size possible while maintaining quality. Fast, secure, and free.",
    },
  },

};
