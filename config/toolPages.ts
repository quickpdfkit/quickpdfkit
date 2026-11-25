export type ToolPageStep = { name: string; text: string };
export type ToolPageFaq = { question: string; answer: string };
export type ToolPageLink = { href: string; label: string; note: string };

export type ToolPageContent = {
  id: string;
  title: string;
  lede: string[];
  stepsTitle: string;
  steps: ToolPageStep[];
  tipsTitle: string;
  tips: string[];
  limitsTitle: string;
  limits: string[];
  privacyTitle: string;
  privacy: string[];
  faqs: ToolPageFaq[];
  related: ToolPageLink[];
};

export const coreToolIds = [
  "merge-pdf",
  "split-pdf-online",
  "compress-pdf",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "edit-pdf",
  "sign-pdf",
  "protect-pdf",
  "rotate-pdf",
  "word-to-pdf",
  "convert-pdf-to-word",
  "extract-pdf-pages",
  "remove-pdf-pages",
  "add-page-number-to-pdf",
  "add-watermark-to-pdf",
  "crop-pdf",
  "image-to-pdf-converter",
  "add-text-to-pdf",
] as const;

/**
 * Near-duplicate routes stay available. They point search engines at the
 * page that has the full guide.
 */
export const duplicateToolCanonical: Record<string, string> = {
  "crop-pdf-online": "/tools/crop-pdf",
  "word-to-pdf-simple": "/tools/word-to-pdf",
  "pdf-to-word-simple": "/tools/convert-pdf-to-word",
  "png-to-pdf-converter": "/tools/image-to-pdf-converter",
  "webp-to-pdf-converter": "/tools/image-to-pdf-converter",
  "svg-to-pdf-converter": "/tools/image-to-pdf-converter",
  "ico-to-pdf": "/tools/image-to-pdf-converter",
  "tga-to-pdf-converter": "/tools/image-to-pdf-converter",
  "pdf-to-png": "/tools/pdf-to-jpg",
  "pdf-to-webp-converter": "/tools/pdf-to-jpg",
  "pdf-to-image-converter": "/tools/pdf-to-jpg",
};

export function isIndexableTool(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(toolPages, id);
}

function wordsOf(page: ToolPageContent): string[] {
  const chunks = [
    page.title,
    ...page.lede,
    page.stepsTitle,
    ...page.steps.flatMap((step) => [step.name, step.text]),
    page.tipsTitle,
    ...page.tips,
    page.limitsTitle,
    ...page.limits,
    page.privacyTitle,
    ...page.privacy,
    ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ...page.related.flatMap((link) => [link.label, link.note]),
  ];
  return chunks.join(" ").trim().split(/\s+/).filter(Boolean);
}

export function toolPageWordCount(page: ToolPageContent): number {
  return wordsOf(page).length;
}

export const toolPages: Record<string, ToolPageContent> = {
  "merge-pdf": {
    id: "merge-pdf",
    title: "Combine PDFs in the order a reader should see",
    lede: [
      "Merge PDF copies pages from two or more PDF files into one new PDF. You choose the order, and you can keep only some pages from a file. The work happens in the browser with pdf-lib. QuickPDFKit never receives the documents.",
      "Use it when the pieces already exist as PDFs: a cover letter in front of a contract, three months of invoices, or a scan followed by the form that explains it. The result is a new file. An existing digital signature, a fillable form, or a set of bookmarks on a source PDF should not be treated as intact after the pages are copied. If a signature has to stay valid, leave that original alone and send it beside the packet.",
    ],
    stepsTitle: "How to merge",
    steps: [
      {
        name: "Add the PDFs",
        text: "Drop files or browse for them. Only files the browser reports as PDFs are added. Each file is opened locally so the page count can be shown. If a file is password-protected and will not open, the count stays at zero. Unlock it in a viewer you already trust, then add the unlocked copy.",
      },
      {
        name: "Drag the list into reading order",
        text: "The list is the document. A cover page left under the appendix is the mistake people notice only after they send the file. Drag a row, or remove a file you added by accident, before you merge.",
      },
      {
        name: "Set a page range only when you need one",
        text: "Leave the range blank to include every page. A range such as 1-3,5 keeps those pages, counting from 1, and drops the rest. Pages inside one file come out in numerical order, even if you typed 5 before 1-3. The range applies to that file only.",
      },
      {
        name: "Name the download and check the joins",
        text: "The suggested name is merged-document.pdf, which is hard to find later. Use a name that says what the packet is. Open the download, read the first page, each place two files meet, and the last page, and compare the page count with the pages you meant to include.",
      },
    ],
    tipsTitle: "Before you send the packet",
    tips: [
      "Rename the source files first. Two scans both called final.pdf are how the wrong draft gets included.",
      "Merging does not shrink anything. Five large scans become a file about as big as their sum. If a mailbox rejects it, compress the finished packet and keep the uncompressed merge until you have looked at the smaller file.",
      "Photos that are not already PDFs belong on JPG to PDF or Image to PDF. This page accepts PDF files only.",
    ],
    limitsTitle: "What this merge will not do",
    limits: [
      "A damaged or encrypted PDF stops that file from being copied. The tool does not skip it quietly and produce a packet that looks complete.",
      "Copying pages into a new PDF is the wrong move when the original has to remain the signed record. Rebuild from the source document if you still have it.",
      "Very large files depend on the memory in the tab. If the tab closes itself, merge the packet in two halves and then merge those results.",
    ],
    privacyTitle: "Where the files go",
    privacy: [
      "Each PDF is read in the tab and the new file is downloaded to your device. There is no account and no upload to QuickPDFKit. Closing the tab drops the in-memory copy. It does not remove the file sitting in your downloads folder.",
    ],
    faqs: [
      {
        question: "Can I merge only the signature page from one file?",
        answer:
          "Yes. Put a page range on that file, for example 4 if the signature is on page 4, and leave the other files blank so they are included in full.",
      },
      {
        question: "Will the merged PDF be smaller?",
        answer:
          "No. The new file holds the pages you copied. Compress it afterward if size is the problem, and judge the result by the size the compressor shows.",
      },
      {
        question: "Why did one file show zero pages?",
        answer:
          "The browser could not open it. Password protection and some damaged files do that. Unlock a copy you are allowed to open, then add that copy.",
      },
      {
        question: "Does the order I drop files in matter?",
        answer:
          "Only as a starting point. Drag the rows until the list matches the order a reader should see. That list is what gets written.",
      },
    ],
    related: [
      {
        href: "/tools/split-pdf-online",
        label: "Split PDF",
        note: "Break one PDF into separate files when you need the pieces apart instead of together.",
      },
      {
        href: "/tools/compress-pdf",
        label: "Compress PDF",
        note: "Rewrite the finished packet and compare the new size with the merge you just made.",
      },
      {
        href: "/tools/jpg-to-pdf",
        label: "JPG to PDF",
        note: "Turn photos into PDF pages first if they are not PDFs yet.",
      },
    ],
  },
  "split-pdf-online": {
    id: "split-pdf-online",
    title: "Split one PDF into the files you actually need",
    lede: [
      "Split PDF takes a single PDF and writes new PDFs from the pages you choose. You can click pages, split every page into its own file, or type ranges. pdf-lib copies the chosen pages in the browser. The original file on your disk is not changed.",
      "A range written with commas, such as 2,4-6, still produces one download per page. Put a vertical bar between groups, such as 1-3|4-6, when you want one PDF per group. That distinction is the part people miss, and it is why a 40-page split suddenly asks the browser to save 40 files.",
    ],
    stepsTitle: "How to split",
    steps: [
      {
        name: "Open one PDF",
        text: "The page accepts a single PDF. After it loads, you get a page list you can select from. If the file is encrypted and will not open, unlock a copy first.",
      },
      {
        name: "Choose how the split should be cut",
        text: "Selected pages uses the pages you tick. Every page makes one PDF per page. Range uses the box: commas and dashes pick pages, and a vertical bar starts a new output file.",
      },
      {
        name: "Run the split and allow the downloads",
        text: "Each output is saved separately, with a short pause between files so the browser is less likely to block them. Names look like the original plus a page number, or plus split_1 when you used grouped ranges.",
      },
      {
        name: "Open one file from each group",
        text: "Check the first page of each download against the range you typed. A range of 1-3|8 is easy to mistype as 1-8. The page count of each file is the fastest check.",
      },
    ],
    tipsTitle: "Ways to avoid a pile of downloads",
    tips: [
      "If you only need one shorter PDF, Extract PDF pages writes the pages you pick into a single file. Split is the tool that creates separate files.",
      "Grouped ranges belong in one box separated by |. 1-2|3-5 gives two PDFs. 1-2,3-5 gives four single-page PDFs.",
      "Browsers throttle many downloads. For a long document, split by ranges of chapters instead of every page, unless you truly want one file per page.",
    ],
    limitsTitle: "Limits of the split",
    limits: [
      "Each new file is a copy of page content. Do not split a signed agreement and then treat one page as the whole contract.",
      "The tool does not extract attachments, outlines, or form fields as their own objects. You get pages.",
      "One PDF at a time. To separate a merged packet you just made, save it first and open that file here.",
    ],
    privacyTitle: "The split stays on this computer",
    privacy: [
      "The PDF is parsed in the tab and the new files download locally. QuickPDFKit does not store the source or the pieces. Move the downloads out of a shared computer's download folder when you are done.",
    ],
    faqs: [
      {
        question: "How do I get two multi-page PDFs instead of single pages?",
        answer:
          "Use range mode and a vertical bar. For example, 1-4|5-9 writes two files. Without the bar, each listed page is its own download.",
      },
      {
        question: "Can I split several PDFs at once?",
        answer:
          "No. Open one file, download the pieces, then start again with the next file.",
      },
      {
        question: "Will the original PDF be deleted?",
        answer:
          "No. The tool only writes new files. Your original stays where you opened it from.",
      },
      {
        question: "Why did the browser ask permission to download multiple files?",
        answer:
          "Each page or group is a separate save. Allow the downloads, or use fewer groups so there are fewer files.",
      },
    ],
    related: [
      {
        href: "/tools/extract-pdf-pages",
        label: "Extract PDF pages",
        note: "Keep the chosen pages together in one PDF instead of one file per page.",
      },
      {
        href: "/tools/remove-pdf-pages",
        label: "Remove PDF pages",
        note: "Drop blank or unwanted pages and download a single shorter file.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Put the pieces back in a chosen order after you have checked them.",
      },
    ],
  },
  "compress-pdf": {
    id: "compress-pdf",
    title: "See whether a PDF actually gets smaller",
    lede: [
      "Compress PDF rebuilds the file in the browser. It copies the pages into a new PDF and saves them with object streams, which tightens the way the file is structured. It does not recompress the photographs inside the pages. A scan that is already a stack of JPEG images often shrinks very little, or not at all. The page shows the original size and the new size so you can judge the result instead of trusting a promise.",
      "That is a different job from a server that downsamples pictures. Those sites can cut a photo-heavy scan dramatically, and they also mean the document left your computer. Here the PDF stays in the tab. If the new file is not smaller, keep the original.",
    ],
    stepsTitle: "How to compress",
    steps: [
      {
        name: "Open one PDF",
        text: "The tool accepts a single PDF and draws a small preview of each page so you can see that the file loaded. Previews are pictures for you. They are not the compression step.",
      },
      {
        name: "Run compress and read both sizes",
        text: "The download is named compressed- plus the original filename. Next to it, the page reports the size before and the size after, and the percent change. A tiny change means the structure was already tight.",
      },
      {
        name: "Open the smaller file before you delete anything",
        text: "Check a page with text and a page with a photo or a logo. Object-stream compression should not blur pictures, because the pictures were not re-encoded. If a page looks wrong, discard the download and keep the original.",
      },
      {
        name: "Stop when the size does not move",
        text: "Running the same file through again rarely helps. The second pass is rewriting an already rewritten structure.",
      },
    ],
    tipsTitle: "When the size will not drop",
    tips: [
      "Phone scans and camera photos are usually the large part. This tool will not resample them. Export the scan at a lower resolution from the scanning app if you still have the source.",
      "A PDF made from a Word file that is mostly text often shrinks more, because the savings come from structure rather than pixels.",
      "Merge first, then compress the finished packet once. Compressing each piece and then merging does not give you a special extra saving.",
    ],
    limitsTitle: "Honest limits",
    limits: [
      "There is no quality slider, because images are not recompressed. Do not expect a 20 MB scan of photographs to become 2 MB.",
      "Password-protected files that will not open cannot be rebuilt. Unlock a copy you are allowed to open.",
      "The preview renders every page. A very long PDF can make the tab slow before you ever press compress. That slowness is the preview, not a queue on a server.",
    ],
    privacyTitle: "Nothing is uploaded to be compressed",
    privacy: [
      "The file is loaded with PDF.js for the preview and rebuilt with pdf-lib for the download. Both run in the browser. QuickPDFKit does not receive the PDF, and there is no account the file could be attached to.",
    ],
    faqs: [
      {
        question: "Why is the compressed file almost the same size?",
        answer:
          "The pictures inside were copied, not re-encoded. The tool only tightens PDF structure. If the original was already saved that way, the number barely moves.",
      },
      {
        question: "Will the text get blurry?",
        answer:
          "It should not. Text stays text, and images keep the encoding they already had. Still open the download, because a damaged source can fail the rebuild.",
      },
      {
        question: "Can I compress several files at once?",
        answer:
          "No. This page handles one PDF. Compress the merged result if you need one smaller packet.",
      },
      {
        question: "Should I use the compressed file as the only copy?",
        answer:
          "Keep the original until you have opened the new file and checked the pages you care about. Delete the original only after that.",
      },
    ],
    related: [
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Combine the files first, then compress the packet once.",
      },
      {
        href: "/tools/pdf-to-jpg",
        label: "PDF to JPG",
        note: "Export pages as images when you need a smaller picture on purpose and can accept a raster page.",
      },
      {
        href: "/tools/protect-pdf",
        label: "Protect PDF",
        note: "Add a password after you are happy with the size. Protect the finished file, not a throwaway copy.",
      },
    ],
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    title: "Turn photos into PDF pages you can print",
    lede: [
      "JPG to PDF places each picture on its own PDF page. You set the page size (A4, Letter, Legal, A3, or a custom size in PDF points), the orientation, and the order. The browser draws the image to a canvas, embeds that as a PNG, and scales it to fit inside a margin of about 20 points. The file never goes to a QuickPDFKit server.",
      "This is the right page for phone photos and scans of paper: receipts, a signed form you photographed, or a set of whiteboard shots you want in one document. A PNG screenshot or an SVG diagram is the same kind of job on Image to PDF. The format-specific pages for ICO, TGA, and similar types are duplicates of that converter.",
    ],
    stepsTitle: "How to build the PDF",
    steps: [
      {
        name: "Add the pictures",
        text: "The file picker accepts images the browser can identify. Each one gets a preview. If a file does not appear, the browser did not treat it as an image.",
      },
      {
        name: "Put them in order and rotate any that are sideways",
        text: "Drag rows, or move them up and down. Rotation here turns the picture before it is placed. It is separate from Rotate PDF, which turns pages that are already inside a PDF.",
      },
      {
        name: "Pick the paper size",
        text: "A4 and Letter cover most printing. Landscape swaps width and height. Custom width and height are in points, 72 points to an inch, and the defaults match A4. The image is fitted inside the page with a small margin, so a very wide photo gets letterboxed rather than cropped.",
      },
      {
        name: "Download and print one test page",
        text: "Open the PDF and check that faces and receipts are upright and that nothing important sits in the margin. The embedded image is a full-resolution canvas copy, so a folder of huge photos can produce a large PDF.",
      },
    ],
    tipsTitle: "Photos that print cleanly",
    tips: [
      "Crop the photo on your phone before you add it if the PDF should not include a table, a thumb, or a second document in the frame. This tool fits the whole image. It does not crop.",
      "One picture per page. If you need two receipts on one sheet, combine them in a photo editor first.",
      "For a stack of screenshots that are already PNG, Image to PDF is the matching page. You do not need a different converter for each file extension.",
    ],
    limitsTitle: "What the page does not do",
    limits: [
      "It does not run OCR. A photo of a letter becomes a picture on a page, not selectable text.",
      "Transparent PNG areas are drawn onto a canvas and then embedded. Do not expect a print shop's color-managed PDF/X file.",
      "The size of the PDF follows the size of the pictures. Fitting them onto A4 does not resample them down to a tiny file.",
    ],
    privacyTitle: "Photos stay in the tab",
    privacy: [
      "Previews and the PDF are built from files you picked on this device. They are not uploaded. A shared computer keeps the download in its downloads folder until you move or delete it.",
    ],
    faqs: [
      {
        question: "Will a wide photo be cropped?",
        answer:
          "No. It is scaled to fit inside the page with a margin, and the empty space is left blank. Crop the picture first if you need a tighter frame.",
      },
      {
        question: "Can I mix portrait and landscape photos?",
        answer:
          "The page size and orientation apply to the whole document. Rotate individual pictures so they read correctly on that page.",
      },
      {
        question: "Why is the PDF larger than the folder of JPGs?",
        answer:
          "Each image is redrawn through a canvas and embedded as PNG, which can be larger than the original JPEG. That preserves the picture you previewed. It is not a compressor.",
      },
      {
        question: "Can I add a PDF I already have into this file?",
        answer:
          "Not on this page. Make the photo PDF here, then use Merge PDF to put it with other PDFs.",
      },
    ],
    related: [
      {
        href: "/tools/image-to-pdf-converter",
        label: "Image to PDF",
        note: "The same kind of page for screenshots and other images the browser can open.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Attach the new photo PDF to a form or a letter.",
      },
      {
        href: "/tools/rotate-pdf",
        label: "Rotate PDF",
        note: "Turn pages after they are already in a PDF.",
      },
    ],
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    title: "Export PDF pages as pictures",
    lede: [
      "PDF to JPG renders the pages you select to images in the browser. PDF.js draws each page on a canvas, and the canvas is saved as JPG, PNG, or WebP. One selected page downloads as a single image. Several pages download as a zip of images. The PDF is not uploaded.",
      "This is a picture of the page, including text, lines, and photos as they appear. It is not a tool that pulls out only the embedded photographs. Use it when a form will only accept an image, or when you need a slide-sized picture of a page. The separate PNG and WebP converter URLs do the same job. This is the page to use.",
    ],
    stepsTitle: "How to export",
    steps: [
      {
        name: "Open the PDF and wait for the page grid",
        text: "A single PDF loads locally. Thumbnails let you see what you are about to export. Encrypted files that will not open need to be unlocked first.",
      },
      {
        name: "Choose format and quality",
        text: "JPG and WebP use a quality setting: low, medium, or high, about 0.7, 0.85, and 0.95. PNG ignores that slider because PNG is lossless. The render scale is 1, 2, or 3 for low, medium, and high. Higher scale means a larger, sharper image and a heavier file.",
      },
      {
        name: "Select pages",
        text: "Pages start selected. Clear the ones you do not want. Exporting every page of a long deck as high-quality PNG will produce a large zip and a busy tab.",
      },
      {
        name: "Download and open one image",
        text: "A single page saves as a file named with the page number and the extension. Multiple pages save as a zip. Open one image at 100 percent and check small type before you send the set.",
      },
    ],
    tipsTitle: "Pick the format for the destination",
    tips: [
      "Use JPG for photographs and for forms that only accept JPEG. Use PNG when the page is a diagram, a screenshot, or text you do not want softened by JPEG blocks.",
      "Medium at scale 2 is enough for a page shown on screen. High at scale 3 is for when someone will zoom or print the image.",
      "If you only need a shorter PDF, Extract pages or Remove pages keeps the result as a PDF. Converting to images throws away real text selection.",
    ],
    limitsTitle: "Limits of a rendered page",
    limits: [
      "Text in the image is not text. You cannot search it or copy a sentence cleanly.",
      "A scanned page is rendered again. It will not become sharper than the scan.",
      "The tab does the rendering. A hundred-page file at high scale can run out of memory. Export the pages you need.",
    ],
    privacyTitle: "Renders stay local",
    privacy: [
      "Page bitmaps are created in the browser and saved to your device, either as one image or as a zip you unpack locally. QuickPDFKit does not receive the PDF or the images.",
    ],
    faqs: [
      {
        question: "Why did I get a zip instead of a JPG?",
        answer:
          "More than one page was selected. The zip contains one image per selected page. Select a single page if you want one image file.",
      },
      {
        question: "Does PNG use the quality slider?",
        answer:
          "No. PNG is saved without a JPEG quality value. The scale still changes how many pixels are drawn.",
      },
      {
        question: "Can I extract only the logo from a page?",
        answer:
          "Not here. The whole page is rendered. Crop the image afterward, or crop the PDF page first and then export that page.",
      },
      {
        question: "Will transparent areas survive as JPG?",
        answer:
          "JPG has no transparency. Use PNG or WebP if the page background has to stay transparent, and check the result, because the render sits on the canvas the browser drew.",
      },
    ],
    related: [
      {
        href: "/tools/jpg-to-pdf",
        label: "JPG to PDF",
        note: "Put images back onto PDF pages if the picture was only an intermediate step.",
      },
      {
        href: "/tools/crop-pdf",
        label: "Crop PDF",
        note: "Trim the page before you render it, so the image is not full of margin.",
      },
      {
        href: "/tools/extract-pdf-pages",
        label: "Extract PDF pages",
        note: "Keep real PDF pages when you do not need a picture.",
      },
    ],
  },
  "edit-pdf": {
    id: "edit-pdf",
    title: "Mark up a PDF without rewriting the paragraph",
    lede: [
      "Edit PDF lets you draw on top of a page: text, a pen, a highlighter, rectangles, circles, and lines, in a color and size you pick. You can undo, and the eraser removes marks you added in this session. When you save, those marks are drawn onto the PDF with pdf-lib and downloaded. The original file is left where it was.",
      "This is annotation, not a word processor. You cannot click a sentence that is already in the PDF and retype it. A highlight sits on top of the words. If the paragraph itself has to change, edit the source document and export again. Use this page to correct a date in the margin, circle a clause, or initial a printed page.",
    ],
    stepsTitle: "How to mark up a page",
    steps: [
      {
        name: "Open one PDF",
        text: "The current page is rendered so you can draw on it. Move between pages with the arrows. Marks remember the page you drew them on.",
      },
      {
        name: "Pick a tool and a color",
        text: "Text asks you for the words to place. Pen and highlighter follow the pointer. Shapes and lines use a drag. The eraser deletes a mark from this session. It does not delete the original printing under the mark.",
      },
      {
        name: "Check the page at a normal zoom",
        text: "A highlight that looked aligned while zoomed in can sit on the wrong line. Zoom back out before you move to the next page.",
      },
      {
        name: "Save and open the download",
        text: "The new file contains the original pages plus the marks that were still in the list when you saved. Undo something you do not want before saving. The download will not include a mark you already erased.",
      },
    ],
    tipsTitle: "Marks that survive sending",
    tips: [
      "Prefer a short text note in the margin over trying to cover an old sentence with a white box and new words. White boxes rarely match the background, and the old text can still be copied from the page.",
      "Use a highlighter for a clause you want someone to read, and a pen only for a signature-like scribble. For a signature you will reuse, the Sign PDF page has a drawing pad and a typed signature.",
      "Save once at the end. Each save is a new download. It is easy to send an earlier file that is missing the last note.",
    ],
    limitsTitle: "What edit mode will not change",
    limits: [
      "Existing text is not reflowed. Fonts, line breaks, and columns stay as they were, with your marks on top.",
      "The eraser does not redact. Covering text with a shape is not the same as removing it. If the words must be gone, delete them in the source and export a new PDF.",
      "A password-protected PDF that will not open cannot be marked up here.",
    ],
    privacyTitle: "The marked-up file is local",
    privacy: [
      "The PDF and every stroke are handled in the tab. The download is the copy that contains your notes. QuickPDFKit does not see the document or the comments you drew.",
    ],
    faqs: [
      {
        question: "Can I change a word in the middle of a paragraph?",
        answer:
          "No. You can place new text on top of the page. You cannot open the existing line and edit it in place. Change the source file if the sentence itself is wrong.",
      },
      {
        question: "Does the highlighter copy the text underneath?",
        answer:
          "No. It draws a translucent mark. The text underneath is still the original text.",
      },
      {
        question: "Will undo remove marks on other pages?",
        answer:
          "Undo walks back the marks you added in this session. Move through the pages and look before you save if you are unsure what is still in the list.",
      },
      {
        question: "Is this a redaction tool?",
        answer:
          "No. Drawing over text does not prove the text is gone. Do not use a box or a pen to hide a secret.",
      },
    ],
    related: [
      {
        href: "/tools/add-text-to-pdf",
        label: "Add text to PDF",
        note: "Place a line of text by page number and coordinates when you do not need the drawing tools.",
      },
      {
        href: "/tools/sign-pdf",
        label: "Sign PDF",
        note: "Put a drawn, typed, or image signature on a page.",
      },
      {
        href: "/tools/add-watermark-to-pdf",
        label: "Add a watermark",
        note: "Stamp the same word across every page instead of marking one spot.",
      },
    ],
  },
  "sign-pdf": {
    id: "sign-pdf",
    title: "Place a signature on the page",
    lede: [
      "Sign PDF puts a visual signature on a page you choose. You can draw it with the pointer, type a name, or upload a picture of a signature. You then drag and resize that image on the rendered page. The download draws the image onto the PDF. It is not a certificate, and a reader's signature panel will not show a verified digital signature.",
      "That is enough for many everyday forms that just need an ink-style mark. It is the wrong tool when a counterparty requires a cryptographic signature that their software can validate. Drawing a mark does not prove who held the mouse. Keep the unsigned original if you may need to sign a different way later.",
    ],
    stepsTitle: "How to sign",
    steps: [
      {
        name: "Open the PDF and go to the signature page",
        text: "The page renders so you can see where the mark will sit. Use the page arrows. A signature is stored against the page you placed it on.",
      },
      {
        name: "Create the mark",
        text: "Draw on the pad and accept the drawing, type the name you want in a script-style line, or choose an image file. You can make the mark before you place it.",
      },
      {
        name: "Position it",
        text: "Drag the signature onto the line that asks for it. Resize from the handle if it covers the printed name or the date. Zoom in to check the baseline, then zoom out to see the whole page.",
      },
      {
        name: "Save and confirm the appearance",
        text: "Open the download. You should see the mark as part of the page. You should not expect a green validation tick from a certificate. If the mark is on the wrong line, go back and move it before you send the file.",
      },
    ],
    tipsTitle: "A mark people can read",
    tips: [
      "Draw the signature larger than you think, then scale it down on the page. A tiny drawing becomes a blur when it is stretched.",
      "A typed name is easier to read than a hurried scribble on a trackpad. Use type when the form only needs a name on the line.",
      "Do not cover the legal text. If the only open space is over a clause, the form is the wrong place for a large image.",
    ],
    limitsTitle: "What this signature is not",
    limits: [
      "It is not a digital certificate, a timestamp, or an identity check. Anyone who later edits the PDF can cover or copy the appearance.",
      "Placing the mark does not lock the rest of the file. Use Protect PDF afterward if the copy you send should ask for a password. Protecting does not turn the mark into a certificate either.",
      "A PDF that will not open because it is encrypted cannot be signed here until you have an unlocked copy you are allowed to mark.",
    ],
    privacyTitle: "The signature is drawn locally",
    privacy: [
      "The pad, the typed name, and any signature image stay in the tab with the PDF. They are written into the download on your device. QuickPDFKit does not collect the signature or the document.",
    ],
    faqs: [
      {
        question: "Will Adobe show this as a valid digital signature?",
        answer:
          "No. The mark is drawn onto the page as an image. It will not verify as a certificate-based signature.",
      },
      {
        question: "Can I sign two places in the same file?",
        answer:
          "Yes. Place a mark, move to the next page or the next line, and place another. Both are included when you save.",
      },
      {
        question: "Can I reuse a signature image?",
        answer:
          "Yes. Upload a PNG or JPEG of your signature and place it. The image is read locally for that session.",
      },
      {
        question: "Does signing encrypt the PDF?",
        answer:
          "No. The download opens like any other PDF unless you password-protect it afterward.",
      },
    ],
    related: [
      {
        href: "/tools/protect-pdf",
        label: "Protect PDF",
        note: "Add an open password after the signature looks right.",
      },
      {
        href: "/tools/edit-pdf",
        label: "Edit PDF",
        note: "Add a date or a short note next to the signature line.",
      },
      {
        href: "/tools/add-text-to-pdf",
        label: "Add text to PDF",
        note: "Place a printed name or a date when you do not need a drawn signature.",
      },
    ],
  },
  "protect-pdf": {
    id: "protect-pdf",
    title: "Add a password before you send a PDF",
    lede: [
      "Protect PDF encrypts one PDF in the browser. You type a password twice. It must be at least 6 characters, and the two entries must match. The download is encrypted with that password as both the user password and the owner password. Opening the file should prompt for it. The permissions written into the file allow high-resolution printing and disallow modifying, copying, annotating, form filling, and page assembly.",
      "The switches on the page are not what gets written. The saved file uses the permissions above, not a custom mix. Open the download and confirm that a password prompt appears before you delete the unprotected original. This is ordinary PDF password encryption, not a certificate and not a promise against someone who already has the password or a determined attempt to break a short one.",
    ],
    stepsTitle: "How to protect a file",
    steps: [
      {
        name: "Open the PDF you are willing to wrap",
        text: "Use a file that already contains the final pages. Protecting and then discovering a typo means you need the unprotected copy in order to edit.",
      },
      {
        name: "Choose a password you can send separately",
        text: "Six characters is the minimum the page accepts. Longer is better. The tool does not store it, and it cannot email it for you. If you forget it, there is no recovery on this site.",
      },
      {
        name: "Encrypt and download",
        text: "The file is saved as protected_ plus the original name. Encryption runs in the tab. A failure toast means the file did not get a new encrypted copy. Do not assume it worked if the download never appeared.",
      },
      {
        name: "Test the prompt, then send the password by another channel",
        text: "Open the download in a different viewer. Type the password. Then send the file and the password by different means, for example the file by email and the password by a message the same people do not both read on one stolen phone.",
      },
    ],
    tipsTitle: "Passwords that match the risk",
    tips: [
      "Keep an unprotected copy somewhere you control until you have opened the encrypted file successfully.",
      "Do not put the password in the same email as the PDF. The encryption only helps if the password travels separately.",
      "A watermark with the recipient's name is a different control. It does not stop opening. Use it when you want a leak to be obvious, and use a password when you want a prompt before the pages are visible.",
    ],
    limitsTitle: "What the password does not do",
    limits: [
      "It does not prove who created the file, and it does not add a digital signature.",
      "Reader support for PDF permissions varies. Printing is allowed in the file we write. Copying and editing are marked as not allowed, but a hostile reader can ignore permission bits. The open password is the control that matters.",
      "Files that are already encrypted and will not load cannot be re-protected here. Decrypt in a viewer that accepts the current password, then protect the result if it still needs one.",
    ],
    privacyTitle: "The password stays with you",
    privacy: [
      "The PDF and the password are used in the browser to write the encrypted download. QuickPDFKit does not receive the file or the password, and there is no account that could reset it.",
    ],
    faqs: [
      {
        question: "What if I lose the password?",
        answer:
          "We cannot recover it. The password never reaches QuickPDFKit. Keep the unprotected original until you have stored the password somewhere you can find.",
      },
      {
        question: "Can I allow copying and block printing?",
        answer:
          "Not with the file this page writes. The download asks for the password to open, allows high-resolution printing, and marks copying, editing, and annotating as disallowed.",
      },
      {
        question: "Is this AES-256?",
        answer:
          "Do not rely on a specific bit length from this page. Treat it as PDF password encryption and use a long password. It is not a substitute for a full-disk or enterprise document system.",
      },
      {
        question: "Should I protect a file and then merge it?",
        answer:
          "Merge first. An encrypted file that will not open cannot be merged here. Protect the finished packet.",
      },
    ],
    related: [
      {
        href: "/tools/add-watermark-to-pdf",
        label: "Add a watermark",
        note: "Mark a copy as a draft or with a recipient's name when a password is the wrong control.",
      },
      {
        href: "/tools/sign-pdf",
        label: "Sign PDF",
        note: "Place a visual signature before you encrypt the copy you send.",
      },
      {
        href: "/tools/compress-pdf",
        label: "Compress PDF",
        note: "Shrink the finished file before you protect it, and check the size first.",
      },
    ],
  },
  "rotate-pdf": {
    id: "rotate-pdf",
    title: "Turn sideways scans upright",
    lede: [
      "Rotate PDF turns pages by 90 degrees at a time, clockwise or counter-clockwise. You can turn the page you are looking at or apply the same turn to every page. The preview uses PDF.js so you can see the result. Save writes that angle with pdf-lib and downloads a new PDF. Your original file is unchanged.",
      "The usual case is a phone scan that came out on its side, or a packet where only the appendix is landscape. Turning a page here changes how viewers display it. It does not crop, and it does not re-run OCR.",
    ],
    stepsTitle: "How to rotate",
    steps: [
      {
        name: "Open the PDF",
        text: "Load one PDF. Page through it, or switch to the grid if you need to see several pages. A file that asks for a password and will not open has to be unlocked first.",
      },
      {
        name: "Turn the pages that are wrong",
        text: "90° right and 90° left add that angle to the rotation you have already chosen in this session. Apply-to-all repeats the click for every page. If only one page is sideways, leave apply-to-all off.",
      },
      {
        name: "Reset if you overshoot",
        text: "Reset clears the rotation for the current page, or for every page if apply-to-all is on. The preview reloads. Do this before you save if a page went a full turn past upright.",
      },
      {
        name: "Save and open the download in another viewer",
        text: "The saved rotation is the angle you set in this session, written onto the page. Check a page that was already upright and a page you meant to fix. If a page looks wrong only in one reader, try a second reader before you rotate again.",
      },
    ],
    tipsTitle: "Scans that stay upright",
    tips: [
      "Fix rotation before you crop. A crop rectangle drawn on a sideways preview is easy to get backwards.",
      "If every page is off by the same turn, use apply-to-all once. Clicking it twice turns the packet 180 degrees.",
      "Page numbers and watermarks are drawn in the page's current coordinate system. Rotate first, then add numbers, if the number has to sit at the bottom of the upright page.",
    ],
    limitsTitle: "Rotation limits",
    limits: [
      "Turns are 90 degrees. There is no 1-degree straighten for a photo that is slightly tilted. Fix that in the scan, or crop after you accept a small tilt.",
      "The angle saved is the one chosen here, starting from no extra turn in this session. Look at the download if the file already carried a rotation flag. You want the pages upright in the viewer you will send it to.",
      "Rotation does not make text selectable. A sideways scan is still a picture after you turn it.",
    ],
    privacyTitle: "Turning pages does not upload them",
    privacy: [
      "The preview and the rotated download are produced in the browser. QuickPDFKit does not receive the PDF.",
    ],
    faqs: [
      {
        question: "Can I rotate a single page in the middle?",
        answer:
          "Yes. Leave apply-to-all off, move to that page, and turn it. Other pages keep the rotation already stored for them in this session, which is none unless you turned them too.",
      },
      {
        question: "Why does a page look sideways after I thought I fixed it?",
        answer:
          "Each click adds 90 degrees. Four clicks returns to the start. Reset the page and apply one click in the direction that matches the preview.",
      },
      {
        question: "Does this change the file I opened?",
        answer:
          "No. You download a new PDF. The original stays put.",
      },
      {
        question: "Can I rotate and crop in one step?",
        answer:
          "No. Download the rotated file, then open it in Crop PDF.",
      },
    ],
    related: [
      {
        href: "/tools/crop-pdf",
        label: "Crop PDF",
        note: "Trim edges after the pages are upright.",
      },
      {
        href: "/tools/add-page-number-to-pdf",
        label: "Add page numbers",
        note: "Number the pages after rotation so the numbers sit on the upright edge.",
      },
      {
        href: "/tools/jpg-to-pdf",
        label: "JPG to PDF",
        note: "Rotate the photo before it becomes a page, if you still have the picture.",
      },
    ],
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    title: "Make a PDF snapshot of a Word document",
    lede: [
      "Word to PDF reads a .docx file in the browser with Mammoth, turns it into HTML, and shows a preview. When you convert, that preview is drawn to a canvas and placed into the PDF as a JPEG, sliced across pages of the size you chose: A4, Letter, or Legal, portrait or landscape. The Word file is not uploaded.",
      "Because the PDF is a picture of the preview, do not expect selectable text, a tagged structure, or Word's own page breaks. A line can be cut between pages where the image is sliced. Headers, footers, text boxes, comments, and tracked changes often do not survive the HTML step. Save old .doc files as .docx first. Mammoth reads Office Open XML, and a legacy .doc file often comes out empty or fails.",
    ],
    stepsTitle: "How to convert",
    steps: [
      {
        name: "Start from .docx",
        text: "In Word, use Save As and choose .docx if the file is .doc, .odt, or Pages. Upload that .docx. The preview is the document you will get, not a promise about the original layout.",
      },
      {
        name: "Read the preview",
        text: "Headings that Word named Heading 1, 2, or 3 are mapped to HTML headings. Bold and italic are kept when Mammoth sees them. If a table, a floating image, or a footer is missing in the preview, it will be missing in the PDF. Fix the Word file or accept the simpler layout.",
      },
      {
        name: "Choose the paper size to match how you will print",
        text: "A mismatch here is how a one-page letter becomes two. Landscape is for wide tables, with the same caveat that the table may already have been simplified.",
      },
      {
        name: "Convert, then search for a word you know is there",
        text: "If search fails, you are looking at the JPEG snapshot, which is expected. Zoom in. If type looks soft or a heading is sliced, adjust the Word file so the preview is shorter, or export to PDF from Word itself when you need real text.",
      },
    ],
    tipsTitle: "When this snapshot is enough",
    tips: [
      "Use it for a simple letter or a set of notes you need to send as PDF from a machine that does not have Word.",
      "If the reader must copy a paragraph or a screen reader must follow the text, export from Word or LibreOffice instead. This page's PDF is an image.",
      "The simple Word-to-PDF URL is the same kind of converter. Use this page.",
    ],
    limitsTitle: "Layout limits",
    limits: [
      "Page breaks follow the height of the snapshot, not Word's page breaks. A heading can land at the bottom of a page.",
      "Images in the document appear only if they survived the HTML preview. Positioning from Word is not preserved precisely.",
      "The canvas is rendered at scale 2 and saved as JPEG at about 0.95 quality. It is reasonably sharp on screen and still a compressed image.",
    ],
    privacyTitle: "The document stays in the browser",
    privacy: [
      "Mammoth, the preview, and the PDF are all in the tab. The .docx is not uploaded to QuickPDFKit. The download is the snapshot to keep or discard.",
    ],
    faqs: [
      {
        question: "Why can't I select the text in the PDF?",
        answer:
          "The page is a JPEG of the HTML preview placed on the PDF. It looks like the document and does not contain a real text layer.",
      },
      {
        question: "My .doc file produced a blank preview. What now?",
        answer:
          "Save it as .docx from a word processor and convert that file. Legacy .doc is not a reliable input here.",
      },
      {
        question: "Will comments and track-changes marks appear?",
        answer:
          "Do not count on them. Accept or reject changes in Word and delete comments before you convert, so the preview shows the text you mean to send.",
      },
      {
        question: "Can I convert several Word files at once?",
        answer:
          "No. Convert one file, check it, then start the next.",
      },
    ],
    related: [
      {
        href: "/tools/convert-pdf-to-word",
        label: "PDF to Word",
        note: "Extract text from a PDF into a .docx when you are going the other direction.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Combine the snapshot with other PDFs after you have checked the pages.",
      },
      {
        href: "/tools/compress-pdf",
        label: "Compress PDF",
        note: "Optional afterward. The snapshot is already a JPEG, so the size may barely change.",
      },
    ],
  },
  "convert-pdf-to-word": {
    id: "convert-pdf-to-word",
    title: "Pull the text out of a PDF into Word",
    lede: [
      "PDF to Word reads the text layer with PDF.js and writes a .docx. Text items on each page are joined into a string, then split into paragraphs. A few patterns, such as a short all-caps line or the word Introduction, are marked as headings. The file is built in the browser and downloaded. Nothing is uploaded.",
      "This recovers words. It does not rebuild columns, text boxes, or a magazine layout, and it does not place the images from the PDF into the Word file. A scan with no text layer produces an empty or useless document, because there is nothing to extract. The simple PDF-to-Word URL does the same kind of extraction. Use this page, and expect to clean up spacing in Word.",
    ],
    stepsTitle: "How to convert",
    steps: [
      {
        name: "Open a PDF that already has real text",
        text: "If you can select a sentence in a normal viewer, this tool has something to read. If you cannot select the sentence, it is probably a scan. Converting it here will not invent a transcript.",
      },
      {
        name: "Wait until every page has been read",
        text: "The page walks the PDF from first page to last and shows progress. A long file just takes longer in the tab. It is not waiting on a server.",
      },
      {
        name: "Read the preview before you download",
        text: "Look for missing sections, words stuck together, and headings that were ordinary sentences. Columns often come out in a jumble because the extractor follows text items, not visual columns.",
      },
      {
        name: "Download the .docx and fix it in a word processor",
        text: "The download is the starting point. Restore lists, tables, and pictures there. Do not send the .docx as a finished layout without reading it.",
      },
    ],
    tipsTitle: "Files that convert cleanly",
    tips: [
      "Text-based exports from Word, Google Docs, or a report generator work better than designed brochures.",
      "If you need the look of the page rather than editable text, do not use this tool. Send the PDF, or export page images.",
      "Copy a stubborn page's text from a viewer when the automatic paragraphs are worse than a manual copy. This tool is a convenience, not a layout engine.",
    ],
    limitsTitle: "What you will not get back",
    limits: [
      "Images, vector drawings, and precise positions are not reconstructed in the .docx.",
      "Tables become lines of text, not Word tables you can sort.",
      "Passwords that block opening block extraction. Scanned pages without OCR stay empty of text.",
    ],
    privacyTitle: "Extraction runs locally",
    privacy: [
      "PDF.js reads the file in the tab and the .docx is packed on your device. QuickPDFKit does not receive the PDF or the document it produces.",
    ],
    faqs: [
      {
        question: "Why is the Word file out of order?",
        answer:
          "The extractor follows the order of text items in the PDF, which is not always the reading order of a multi-column page. Reorder those paragraphs in Word.",
      },
      {
        question: "Can it OCR a scan?",
        answer:
          "No. If the PDF has no text layer, there is nothing to put in the .docx. Run OCR in a tool that does that, then bring the text-based PDF here if you still need Word.",
      },
      {
        question: "Are fonts and colors preserved?",
        answer:
          "No. You get paragraphs of text, with a simple heading guess. Styling has to be reapplied.",
      },
      {
        question: "Why did a heading become a normal paragraph?",
        answer:
          "Headings are guessed from short patterns such as a chapter line or a run of capital letters. A normal bold sentence will not always match. Mark it as a heading in Word.",
      },
    ],
    related: [
      {
        href: "/tools/word-to-pdf",
        label: "Word to PDF",
        note: "After you fix the text, make a snapshot PDF if you need to send one.",
      },
      {
        href: "/tools/pdf-to-jpg",
        label: "PDF to JPG",
        note: "Keep the visual page when editable text is the wrong goal.",
      },
      {
        href: "/tools/extract-pdf-pages",
        label: "Extract PDF pages",
        note: "Convert only the pages you need by extracting them first.",
      },
    ],
  },
  "extract-pdf-pages": {
    id: "extract-pdf-pages",
    title: "Pull the pages you need into one PDF",
    lede: [
      "Extract PDF pages copies the pages you select into a single new PDF, in page order. It is the tool to use when you want chapter 2, or the signature page plus the appendix, as one file. Split PDF is the one that writes a separate download per page or per range. Remove PDF pages is the one that starts from the full document and drops pages. All three run in the browser.",
      "The new file is a copy of those pages. It is not a pointer back to the original. Bookmarks and a digital signature on the source should not be treated as carried over. Name the download so you can tell the extract from the full file.",
    ],
    stepsTitle: "How to extract",
    steps: [
      {
        name: "Open the full PDF",
        text: "One file loads, with a page count and a way to move through pages or look at them in a grid. Select the pages that belong in the extract.",
      },
      {
        name: "Select only what the reader needs",
        text: "You can select all and then clear pages, or start from none and tick the ones you want. The count of selected pages is the page count you should expect in the download.",
      },
      {
        name: "Download the single PDF",
        text: "The file name includes the original name and how many pages were extracted. Pages are copied in ascending page number, not in the order you clicked them.",
      },
      {
        name: "Compare the first and last page with the source",
        text: "Open the extract beside the original if the choice was fiddly. It is easy to include the blank page before a chapter or to drop the last page of a section.",
      },
    ],
    tipsTitle: "Cleaner extracts",
    tips: [
      "If the pages you want are one continuous range and you also want other ranges as separate files, use Split PDF with a vertical bar instead.",
      "Extract first, then watermark or number the shorter file, so you are not stamping pages you planned to discard.",
      "Keep the full PDF. The extract is a convenience copy, not a replacement, especially when the full file is the signed one.",
    ],
    limitsTitle: "Limits",
    limits: [
      "Order is numerical. You cannot extract page 5 and then page 2 as 5 followed by 2. Merge after two extracts if you truly need a custom order, or reorder by extracting and then merging.",
      "You cannot extract from several PDFs at once.",
      "Encrypted files that will not open cannot be read.",
    ],
    privacyTitle: "The extract is local",
    privacy: [
      "Pages are copied in the tab and the new PDF downloads to your device. The source file is not uploaded to QuickPDFKit.",
    ],
    faqs: [
      {
        question: "How is this different from split?",
        answer:
          "Extract writes one PDF containing every page you selected. Split writes multiple PDFs.",
      },
      {
        question: "Can I extract pages out of order?",
        answer:
          "The download sorts the selected page numbers from low to high. To get a custom order, extract and then merge pieces in the order you want.",
      },
      {
        question: "Does the original lose those pages?",
        answer:
          "No. Extraction writes a new file and leaves the original alone.",
      },
      {
        question: "What if I selected every page?",
        answer:
          "You get a copy of the whole document. Clear the pages you do not want if that was not the goal.",
      },
    ],
    related: [
      {
        href: "/tools/remove-pdf-pages",
        label: "Remove PDF pages",
        note: "Delete unwanted pages instead of picking the ones to keep, when that is the shorter list.",
      },
      {
        href: "/tools/split-pdf-online",
        label: "Split PDF",
        note: "Write separate files when the pages should not stay together.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Combine an extract with other PDFs after you have checked it.",
      },
    ],
  },
  "remove-pdf-pages": {
    id: "remove-pdf-pages",
    title: "Drop blank or unwanted pages and keep one PDF",
    lede: [
      "Remove PDF pages builds one new PDF that leaves out pages you do not want. You can mark pages to remove, or switch to a keep mode and mark the pages that should remain. The other pages are copied, in their original order, into the download. The file you opened is not edited in place.",
      "Use it for the blank page a scanner adds at the end, a duplicate cover, or a draft page that should not go to the client. If you are picking a small set of pages out of a long file, Extract pages is the clearer mental model. If you want many separate files, use Split.",
    ],
    stepsTitle: "How to remove pages",
    steps: [
      {
        name: "Open the PDF and choose remove or keep",
        text: "Remove mode deletes the pages you select. Keep mode retains the pages you select and drops the rest. The mode is the thing to check twice. Selecting page 1 in the wrong mode either drops the cover or drops everything except the cover.",
      },
      {
        name: "Mark the pages",
        text: "Use the grid or the single-page view. The selected count is shown with the file size and the page count. There is a way to invert the selection when you marked the wrong set.",
      },
      {
        name: "Refuse the impossible cases",
        text: "The tool stops you from removing every page, and it stops keep mode when every page is selected, because that would not change the file. Select a real subset.",
      },
      {
        name: "Download and count the pages",
        text: "The new page count should equal the original count minus the pages you removed, or equal the number you chose to keep. Open the first page and the page after each gap.",
      },
    ],
    tipsTitle: "Avoid deleting the wrong page",
    tips: [
      "Zoom in on pages that look similar, such as two signature pages, before you mark one.",
      "Blank pages are not always blank in the thumbnail. A page number or a faint scan line still counts as a page you might want to drop on purpose.",
      "Remove pages before you add page numbers. Numbers written first will show the old total and will leave a gap where a page disappeared.",
    ],
    limitsTitle: "Limits",
    limits: [
      "You cannot remove pages from several files at once.",
      "The remaining pages stay in their original order. This is not a reorder tool.",
      "A removed page is simply not copied. If the original is the signed record, keep it. The shorter file is a new PDF.",
    ],
    privacyTitle: "Deletion happens in the copy",
    privacy: [
      "The browser copies the pages you are keeping and downloads that PDF. The source file stays on your device unless you delete it yourself. QuickPDFKit does not receive either file.",
    ],
    faqs: [
      {
        question: "What is the difference between remove mode and keep mode?",
        answer:
          "Remove mode drops the pages you tick. Keep mode drops the pages you do not tick. Check the mode before you download.",
      },
      {
        question: "Can I delete every page?",
        answer:
          "No. A PDF with no pages is not a useful result, and the tool refuses that selection.",
      },
      {
        question: "Will page 5 become page 4 in the new file?",
        answer:
          "The pages slide together in order, but existing numbers printed on the page do not renumber themselves. Add page numbers afterward if the printed numbers matter.",
      },
      {
        question: "Can I undo a download?",
        answer:
          "The original file is still on disk. Discard the download and run the tool again if the selection was wrong.",
      },
    ],
    related: [
      {
        href: "/tools/extract-pdf-pages",
        label: "Extract PDF pages",
        note: "Pick a few pages to copy out when that list is shorter than the list you would delete.",
      },
      {
        href: "/tools/add-page-number-to-pdf",
        label: "Add page numbers",
        note: "Number the shorter file after the unwanted pages are gone.",
      },
      {
        href: "/tools/split-pdf-online",
        label: "Split PDF",
        note: "Create separate PDFs instead of one file with pages removed.",
      },
    ],
  },
  "add-page-number-to-pdf": {
    id: "add-page-number-to-pdf",
    title: "Stamp a simple page number on every page",
    lede: [
      "Add page numbers draws a label on every page of one PDF. The label is the current page, a slash, and the total, such as 3 / 12. It is Helvetica, 12 point, in a gray color. You choose a corner or the center of the top or bottom edge. The default is bottom center. The file is rebuilt in the browser and downloaded with _numbered added to the name.",
      "Numbers start at 1 and include every page. You cannot skip a cover, start at 0, or switch to roman numerals. The text is drawn on top of whatever is already there, so it can land on a footer. Rotate pages first if a scan is sideways, or the number will sit on the side that is 'bottom' for the unrotated page.",
    ],
    stepsTitle: "How to number pages",
    steps: [
      {
        name: "Open the finished PDF",
        text: "Remove, rotate, and merge first. Numbering earlier means you will number the wrong total or write numbers onto pages you later delete.",
      },
      {
        name: "Pick the position",
        text: "Bottom center, bottom left, bottom right, top center, top left, or top right. Bottom positions sit about 25 points up from the edge. Top positions sit about 40 points down. There is no drag-to-place handle on this page.",
      },
      {
        name: "Look at the previews",
        text: "The thumbnails show the pages you loaded. They are a check that you opened the right file. The number itself appears in the download, so open that file and look at a busy footer.",
      },
      {
        name: "Download and check the first, middle, and last page",
        text: "Confirm the total matches the page count and that the number is readable against the background. If it collides with a logo, run the tool again with a different corner. You will be drawing a second label if you number an already numbered download, so go back to the file without numbers.",
      },
    ],
    tipsTitle: "Numbers that do not collide",
    tips: [
      "If the document already has a footer, try the top edge, or crop a little extra margin first and then number.",
      "A cover that should not show a number has to be merged after numbering, or left unnumbered by numbering only the body. This tool itself cannot skip page 1.",
      "The label uses ASCII digits and a slash. It does not translate the word Page.",
    ],
    limitsTitle: "Limits",
    limits: [
      "One style only: n / total, 12 point Helvetica, gray. No custom prefix, no bates stamp, no odd-and-even swap.",
      "The number is drawn in the page coordinate system. A page that is visually sideways may show the number on the long edge until you rotate it.",
      "Existing text under the number is not cleared. This is not a way to replace a wrong number that is already printed as part of the scan.",
    ],
    privacyTitle: "Numbering is local",
    privacy: [
      "The PDF is opened in the browser, the labels are drawn, and the new file downloads to your device. QuickPDFKit does not see the document.",
    ],
    faqs: [
      {
        question: "Can I start numbering at page 2?",
        answer:
          "Not in this tool. Every page gets a number, and the first page is 1. Number the body, then merge a cover in front if the cover must stay clean. The body's numbers will still say their own total, not the merged total.",
      },
      {
        question: "Can I change the font or write Page 3 of 12?",
        answer:
          "No. The text is fixed as the page index, a slash, and the page count, in Helvetica.",
      },
      {
        question: "Why is the number sitting on top of my footer?",
        answer:
          "It is drawn at a fixed inset from the edge. Choose another position, or add the number before you design a footer that occupies that spot.",
      },
      {
        question: "Does this update numbers that are already printed on the scan?",
        answer:
          "No. It adds a new label. The old printed number is still part of the picture.",
      },
    ],
    related: [
      {
        href: "/tools/remove-pdf-pages",
        label: "Remove PDF pages",
        note: "Drop blank pages first so the total is the total you want printed.",
      },
      {
        href: "/tools/rotate-pdf",
        label: "Rotate PDF",
        note: "Turn sideways pages upright before the number is drawn along an edge.",
      },
      {
        href: "/tools/add-watermark-to-pdf",
        label: "Add a watermark",
        note: "Use a watermark when you need a word such as DRAFT, not a page count.",
      },
    ],
  },
  "add-watermark-to-pdf": {
    id: "add-watermark-to-pdf",
    title: "Stamp a word or a logo across the pages",
    lede: [
      "Add a watermark puts the same mark on every page of one PDF. The mark can be text or a PNG or JPEG. Text can sit in the center, run diagonally, or tile across the page. You set the words, the size, the color, the opacity, and, for diagonal and tiled text, the rotation. The default words are CONFIDENTIAL. Image watermarks are embedded and drawn on the pages as well. The download is a new PDF made in the browser.",
      "A watermark is a label, not a lock. Anyone who can edit PDFs can cover it. Use it so a draft is obvious, or so a forwarded copy shows a recipient's name. Use a password when the pages should not open freely. Do not use a text box as redaction. The text under a translucent word is still there.",
    ],
    stepsTitle: "How to watermark",
    steps: [
      {
        name: "Open the PDF you are about to share",
        text: "Watermark the copy that already has the right pages. A watermark on a draft you then edit is another file to keep track of.",
      },
      {
        name: "Choose text or an image",
        text: "Text needs a non-empty string. An image needs a PNG or JPEG file. Other image types are not what the embed step accepts. The image is read locally and scaled onto the pages.",
      },
      {
        name: "Set position, opacity, and angle",
        text: "Center places one line in the middle. Diagonal uses your rotation angle. Tiled repeats the line across the page on a grid, also rotated. Opacity is a percentage. A very light mark is easy to miss in a print. A very dark mark makes the page hard to read.",
      },
      {
        name: "Download and print one page",
        text: "Look at a page of body text and a page that is mostly a photo. The mark should be visible and the content should still be readable. If the words collide with a heading, change the position rather than sending it.",
      },
    ],
    tipsTitle: "Marks that match the purpose",
    tips: [
      "For a draft, DIAGONAL and a mid opacity is easier to see than a tiny corner logo.",
      "For a personal copy, tile the recipient's email or name. It will not stop a screenshot, and it makes the source of a leak clearer.",
      "Put the watermark on after page numbers if both have to be visible. Each tool downloads a new file, so use the latest download as the input to the next tool.",
    ],
    limitsTitle: "Limits",
    limits: [
      "Every page gets the same mark. You cannot watermark only page 1 from this tool.",
      "Text uses a standard font drawing path. A long phrase can run off the page because placement is based on the length of the string and the font size, not a measured text box you drag.",
      "The mark does not remove underlying text, and it is not encryption.",
    ],
    privacyTitle: "The stamp is applied locally",
    privacy: [
      "The PDF and the watermark image, if you use one, are read in the tab. The stamped download stays on your device. QuickPDFKit does not receive the document or the logo.",
    ],
    faqs: [
      {
        question: "Can I watermark a single page?",
        answer:
          "This tool marks every page. To mark one page, extract that page, watermark it, and merge it back if you truly need a one-page exception.",
      },
      {
        question: "Which image files work?",
        answer:
          "PNG and JPEG. Convert a SVG or WEBP logo to PNG first if the image watermark does not accept it.",
      },
      {
        question: "Will the watermark stop someone copying the text?",
        answer:
          "No. The text underneath is still in the file. A watermark is visible labeling.",
      },
      {
        question: "Can I edit the words after I download?",
        answer:
          "They are drawn onto the pages. Run the tool again from the unmarked file if the wording is wrong. Stacking a second watermark on the download leaves both.",
      },
    ],
    related: [
      {
        href: "/tools/protect-pdf",
        label: "Protect PDF",
        note: "Require a password when labeling the page is not enough.",
      },
      {
        href: "/tools/add-page-number-to-pdf",
        label: "Add page numbers",
        note: "Add the count before or after the watermark, and check that they do not cover each other.",
      },
      {
        href: "/tools/edit-pdf",
        label: "Edit PDF",
        note: "Mark one spot on one page when a full-page stamp is too much.",
      },
    ],
  },
  "crop-pdf": {
    id: "crop-pdf",
    title: "Trim the margins of a PDF page",
    lede: [
      "Crop PDF lets you draw a rectangle on a rendered page and apply that rectangle as the page's crop box. You can apply it to the current page or to every page. pdf-lib writes the crop box, and the browser downloads a new PDF. The page at /tools/crop-pdf-online is the same kind of tool. Use this page.",
      "A crop box changes what viewers show. It does not always delete the trimmed region from the file. Another editor that resets the crop box can reveal the hidden edge. Do not use crop to hide a confidential sentence and then assume the sentence is gone. If the pixels must be destroyed, export a rendered image of the cropped page and make a new PDF from that image, and still check the result.",
    ],
    stepsTitle: "How to crop",
    steps: [
      {
        name: "Rotate first if the page is sideways",
        text: "A rectangle drawn on a sideways preview is hard to reason about. Download a rotated copy, then crop that file.",
      },
      {
        name: "Draw the area you want to keep",
        text: "Drag on the page preview. You can move and resize the rectangle. The coordinates are converted from the preview canvas into PDF space, including the vertical flip PDF uses. Apply to this page, or apply the same rectangle to all pages when every page shares the same margin.",
      },
      {
        name: "Apply before you save",
        text: "Saving with no applied crop does nothing useful. The tool asks you to apply a crop to at least one page. Pages without a crop keep their existing box.",
      },
      {
        name: "Open the download and try to scroll the edge",
        text: "You should see the tighter page. Then remember the limit: crop box is a view, not a shredder. If you cropped to remove a margin only, you are done. If you cropped to hide content, do not send that file as a redaction.",
      },
    ],
    tipsTitle: "Cleaner trims",
    tips: [
      "Apply-to-all is right for a scanner that adds the same black edge on every page. It is wrong when only the cover has a different margin.",
      "Leave a small margin. A crop that kisses the text will clip glyphs in some viewers.",
      "Number the pages after cropping if the old number sat in the margin you removed.",
    ],
    limitsTitle: "Limits",
    limits: [
      "The crop is rectangular and axis-aligned. You cannot cut a diagonal or punch a hole in the middle.",
      "Content outside the crop box may remain in the file. Treat crop as a change to the visible page, not as removal.",
      "One PDF at a time, and only pages you applied a rectangle to are changed.",
    ],
    privacyTitle: "Cropping stays on the device",
    privacy: [
      "The preview render and the crop-box edit happen in the browser. The PDF is not uploaded to QuickPDFKit.",
    ],
    faqs: [
      {
        question: "Is the cropped-away text deleted?",
        answer:
          "Not reliably. The tool sets the crop box, which controls the visible area. Assume the hidden region can still exist in the file.",
      },
      {
        question: "Can I crop different pages to different sizes?",
        answer:
          "Yes. Draw a rectangle, apply it to the current page, move to the next page, and apply a different one. Leave apply-to-all off.",
      },
      {
        question: "Why does the crop look slightly off?",
        answer:
          "The rectangle is mapped from the preview's pixel size to the PDF page. Zoom and redraw if the edge clips a letter. Check the downloaded file, not only the preview.",
      },
      {
        question: "Which crop page should I use?",
        answer:
          "Use /tools/crop-pdf. The other crop URL is a duplicate and is not the one we maintain a guide for.",
      },
    ],
    related: [
      {
        href: "/tools/rotate-pdf",
        label: "Rotate PDF",
        note: "Turn the page upright before you draw a crop rectangle.",
      },
      {
        href: "/tools/pdf-to-jpg",
        label: "PDF to JPG",
        note: "Render the cropped page to an image when you need a flat picture of what you see.",
      },
      {
        href: "/tools/add-page-number-to-pdf",
        label: "Add page numbers",
        note: "Put numbers back if they lived in the margin you trimmed.",
      },
    ],
  },
  "image-to-pdf-converter": {
    id: "image-to-pdf-converter",
    title: "Put screenshots and other images on PDF pages",
    lede: [
      "Image to PDF builds one PDF with a page per image. The browser must recognize the file as an image. Each picture is drawn to a canvas, embedded as PNG, and fitted on a page of the size you choose: A4, Letter, Legal, A3, or a custom size in points. Portrait and landscape swap the page dimensions. You can reorder and rotate pictures before the download. Processing stays in the tab.",
      "Use this page for a mix of screenshots, exported diagrams, and photos. Dedicated URLs for PNG, WebP, SVG, ICO, and TGA are the same kind of converter and are not separate products. A file the browser cannot decode, which includes many raw TGA and ICO files, will not become a page. Export those to PNG first. Phone-photo batches are described on JPG to PDF. The mechanics match. The job is the same: one picture, one page, fitted with a margin rather than cropped.",
    ],
    stepsTitle: "How to convert",
    steps: [
      {
        name: "Add images the browser can open",
        text: "If a file is rejected, it did not have an image type the browser accepts. Convert odd formats to PNG with a local image tool and add the PNG.",
      },
      {
        name: "Order and rotate",
        text: "The PDF follows the list. Rotate a screenshot that was captured sideways. Rotation is applied to that image before it is fitted.",
      },
      {
        name: "Set the page once for the whole document",
        text: "Every page uses the same size and orientation. A wide screenshot on a portrait A4 page is scaled down and centered, with empty space above and below, or at the sides if it is tall. Custom size is in points.",
      },
      {
        name: "Download and check sharp UI text",
        text: "Screenshots of small interface type are the first place a mistake shows. Open the PDF at 100 percent. The canvas embed keeps the pixels you gave it, and a huge screenshot makes a large page image.",
      },
    ],
    tipsTitle: "Diagrams and screenshots",
    tips: [
      "Prefer PNG sources for screenshots and line art. The converter re-embeds through PNG anyway, so starting from a blurry JPEG will not get sharper.",
      "SVG files only work if the browser decodes them as an image you can draw to a canvas. If the preview fails, export a PNG from the drawing tool.",
      "Do not add a different converter per extension. One list of images here becomes one PDF.",
    ],
    limitsTitle: "Limits",
    limits: [
      "There is no OCR and no text layer. The page is a picture.",
      "The image is fitted, not cropped, and not arranged several-to-a-page.",
      "Transparent regions depend on the canvas. Check a logo that needs a clear background before you send it.",
    ],
    privacyTitle: "Images are converted locally",
    privacy: [
      "Files are read in the browser, drawn to a canvas, and saved as a PDF on your device. QuickPDFKit does not upload them.",
    ],
    faqs: [
      {
        question: "Why did my ICO or TGA file fail?",
        answer:
          "The converter only handles images the browser can decode and draw. Many icon and TGA files need to be exported to PNG first. The separate ICO and TGA pages are not a different engine.",
      },
      {
        question: "Can I put several screenshots on one page?",
        answer:
          "No. Each image becomes its own page, scaled to fit. Combine them in an image editor if they must share a sheet.",
      },
      {
        question: "Will the PDF be smaller than the images?",
        answer:
          "Not necessarily. Embedding via PNG can make the PDF larger than a folder of JPEGs. This page is a converter, not a compressor.",
      },
      {
        question: "Can I insert these pages into an existing PDF?",
        answer:
          "Make the image PDF here, then use Merge PDF to place it among other PDFs.",
      },
    ],
    related: [
      {
        href: "/tools/jpg-to-pdf",
        label: "JPG to PDF",
        note: "A photo-focused walkthrough of the same page-fitting conversion.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        note: "Combine the new image PDF with a text PDF.",
      },
      {
        href: "/tools/pdf-to-jpg",
        label: "PDF to JPG",
        note: "Go back to images if a form will not accept the PDF.",
      },
    ],
  },
  "add-text-to-pdf": {
    id: "add-text-to-pdf",
    title: "Place a line of text at a chosen spot",
    lede: [
      "Add text to PDF stamps new words onto a page you choose. You set the text, the page number, the font size, the color, and the X and Y position in PDF points. The origin is the bottom-left of the page. A set of quick positions can drop the text near a common edge, and the sliders move it. The download draws those strings with pdf-lib and leaves the original file unchanged.",
      "This does not open an existing paragraph for editing. The words you add sit on top. Covering an old sentence does not remove it. For a handwriting-style mark, use Sign PDF. For the same word on every page, use the watermark. For a pen and a highlighter, use Edit PDF.",
    ],
    stepsTitle: "How to add text",
    steps: [
      {
        name: "Open the PDF and note the page size",
        text: "Coordinates are in points on that page. A letter-size page is about 612 by 792 points. A value of X 50, Y 500 starts left of center and above the middle on a typical portrait letter page. If the text does not appear where you expected, the Y value is probably measured from the bottom.",
      },
      {
        name: "Add a text element",
        text: "Type the words, pick the page, the size, and the color, and add it to the list. You can add more than one element, including elements on different pages. An empty list cannot be saved.",
      },
      {
        name: "Nudge the position",
        text: "Use the sliders or the quick positions. There is no click-on-the-page editor here. If you need to circle a clause as well as label it, switch to Edit PDF, which draws on the rendered page.",
      },
      {
        name: "Download and look at that page",
        text: "The file name starts with text-added_. Check that the words are on the page, in the color you chose, and not off the edge. Long lines do not wrap automatically. Shorten the string or lower the size if it runs off the page.",
      },
    ],
    tipsTitle: "Text that lands in the right place",
    tips: [
      "Keep each element to one short line. A paragraph will not reflow inside a box, because there is no box, only a point.",
      "Use a dark color on a light page. The default drawing does not add a background behind the words.",
      "Add text after you rotate and crop, so the coordinates match the page you will send.",
    ],
    limitsTitle: "Limits",
    limits: [
      "Basic Latin text is what this stamp is for. Scripts the standard PDF text draw cannot paint may fail to appear or may fail the save. If the download errors, shorten the string or use Edit PDF's text tool on the rendered page.",
      "Nothing underneath is deleted or reflowed.",
      "You cannot style one word bold and the next italic in the same element. Each element is one string, one size, one color.",
    ],
    privacyTitle: "The note stays local",
    privacy: [
      "The PDF and the strings you type are handled in the browser. The labeled file downloads to your device. QuickPDFKit does not receive the document or the text you added.",
    ],
    faqs: [
      {
        question: "Why is my text too low on the page?",
        answer:
          "Y is measured from the bottom. Increase Y to move the line up. X moves it to the right as it increases.",
      },
      {
        question: "Can I wrap a paragraph?",
        answer:
          "No. Each element is a single line drawn at a point. Split the paragraph into several elements and step Y down by roughly the font size plus a gap.",
      },
      {
        question: "Will this replace the old date printed on the form?",
        answer:
          "No. It adds a new date on top. The old one is still in the file unless you edit the source.",
      },
      {
        question: "Can I put different notes on different pages?",
        answer:
          "Yes. Set the page number on each element before you add it to the list.",
      },
    ],
    related: [
      {
        href: "/tools/edit-pdf",
        label: "Edit PDF",
        note: "Draw and place text directly on the rendered page when coordinates are frustrating.",
      },
      {
        href: "/tools/add-page-number-to-pdf",
        label: "Add page numbers",
        note: "Use the numbering tool for a count on every page instead of typing each number.",
      },
      {
        href: "/tools/sign-pdf",
        label: "Sign PDF",
        note: "Place a drawn or typed signature rather than a plain text stamp.",
      },
    ],
  },
};

for (const id of coreToolIds) {
  if (!toolPages[id]) {
    throw new Error(`Missing tool page content for ${id}`);
  }
}
