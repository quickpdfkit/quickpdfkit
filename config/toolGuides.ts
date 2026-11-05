export interface ToolHowToGuide {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}

const addBlankPagesText =
  "Add blank pages to your PDF document by specifying the position and page number. The blank pages will be inserted with the same dimensions as your original PDF pages and include a subtle watermark for identification.";

const hyperCompressText =
  "This tool optimizes PDF structure by removing metadata, unnecessary data, and applying compression algorithms. Results vary based on the original PDF optimization. Some PDFs may already be well-optimized and won't compress further.";

export const toolHowToById: Record<string, ToolHowToGuide> = {
  "add-blank-pages-to-pdf": {
    name: "Add blank pages to a PDF",
    description: addBlankPagesText,
    steps: [{ name: "How it works", text: addBlankPagesText }],
  },
  "hyper-compress-pdf": {
    name: "Hyper compress a PDF",
    description: hyperCompressText,
    steps: [{ name: "How it works", text: hyperCompressText }],
  },
};
