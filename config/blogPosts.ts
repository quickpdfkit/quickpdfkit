export type InlinePart = string | { href: string; label: string };

export type BlogBlock =
  | { type: "p"; parts: InlinePart[] }
  | { type: "h2"; text: string }
  | { type: "ul"; items: InlinePart[][] }
  | { type: "ol"; items: InlinePart[][] };

export type BlogToolLink = {
  href: string;
  label: string;
  description: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  published: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  tools: BlogToolLink[];
  blocks: BlogBlock[];
};

export function inlineText(parts: InlinePart[]): string {
  return parts.map((part) => (typeof part === "string" ? part : part.label)).join("");
}

export function blogPostPlainText(post: BlogPost): string {
  const chunks: string[] = [];
  for (const block of post.blocks) {
    if (block.type === "h2") chunks.push(block.text);
    else if (block.type === "p") chunks.push(inlineText(block.parts));
    else chunks.push(...block.items.map(inlineText));
  }
  return chunks.join(" ");
}

export function blogPostWordCount(post: BlogPost): number {
  return blogPostPlainText(post).trim().split(/\s+/).filter(Boolean).length;
}

export function blogReadingMinutes(post: BlogPost): number {
  return Math.max(1, Math.round(blogPostWordCount(post) / 230));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-merge-pdfs-in-your-browser",
    title: "How to Merge PDFs in Your Browser",
    description:
      "Combine PDFs locally in your browser: set page order, keep only the pages you need, and check the file before you send it.",
    published: "2026-10-08",
    image: "/img/blog/merge-pdfs.svg",
    imageAlt: "Illustration of two documents combining into one PDF",
    keywords: [
      "merge PDF in browser",
      "combine PDF without uploading",
      "private PDF merger",
      "QuickPDFKit merge PDF",
    ],
    tools: [
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        description: "Combine PDFs in the order you choose, with an optional page range on each file.",
      },
      {
        href: "/tools/merge-pdf-and-images",
        label: "Merge PDF and images",
        description: "Build one PDF from PDF files and photos without a separate conversion step.",
      },
    ],
    blocks: [
      {
        type: "p",
        parts: [
          "People merge PDFs for ordinary reasons: a cover letter in front of a contract, three months of invoices in one packet, or a scan plus the form that explains it. The usual shortcut is a website that asks you to upload every file. That is a poor trade when the pages name a client, a patient, or a price. The ",
          { href: "/tools/merge-pdf", label: "Merge PDF" },
          " tool runs in the browser. You choose the files on your computer, the pages are copied into a new PDF in that tab, and the result downloads to your device. The file is not uploaded to QuickPDFKit for processing.",
        ],
      },
      {
        type: "h2",
        text: "When a browser merge is the right move",
      },
      {
        type: "p",
        parts: [
          "Use it when you already trust the computer you are sitting at and you want one file that reads in a set order. Skip it when the original has to stay a signed legal record. Copying pages into a new PDF does not bring bookmarks, fillable form fields, or a digital signature with the page. If a signature has to remain valid, leave that file untouched and send it beside the merged packet, or sign again after the pages are final. If you still have the Word or spreadsheet source, fix the document there and export one PDF. Merging a pile of bad exports is slower than exporting once.",
        ],
      },
      {
        type: "h2",
        text: "Put the pages in reading order",
      },
      {
        type: "p",
        parts: [
          "Open ",
          { href: "/tools/merge-pdf", label: "Merge PDF" },
          " and add the files. Drag them into the order a reader should see. The list is the document. A cover letter dropped under the appendix is the most common mistake, and it is easier to fix before you click than after someone else has the file.",
        ],
      },
      {
        type: "p",
        parts: [
          "Each file can take a page range. Leave the range blank to include every page. A range such as 1-3,5 keeps only those pages, counting from 1. Use that when a scan has a blank trailing page, or when you need the signature page and not the draft behind it. Ranges are also the clean way to pull one section out as a single PDF. The split tool, described in the guide to ",
          { href: "/blog/how-to-split-a-large-pdf-safely", label: "splitting a large PDF" },
          ", writes a separate file per page unless you group ranges on purpose.",
        ],
      },
      {
        type: "p",
        parts: [
          "Name the download before you merge. merged-document.pdf is hard to find on Thursday. A name like 2026-11-acme-packet.pdf tells you what it is. Name the source files before you drop them in, too. Scan_final and Scan_final2 are how the wrong draft gets included.",
        ],
      },
      {
        type: "h2",
        text: "Check the download before you send it",
      },
      {
        type: "p",
        parts: [
          "Open the result. Read the first page, each place two files meet, and the last page. Add up the pages you meant to include and compare that count with the new file. Look at headers and footers. A merged packet often repeats a client name from a file you meant to leave out.",
        ],
      },
      {
        type: "p",
        parts: [
          "If a source was password protected and would not open, the merge did not quietly skip it in a safe way. Unlock it in a viewer you already trust, merge the unlocked copy, and protect the result again if the packet still needs a password. Do not email the unlocked copy. The ",
          { href: "/blog/checklist-share-a-pdf-securely", label: "sharing checklist" },
          " covers where to send the password.",
        ],
      },
      {
        type: "h2",
        text: "Size, photos, and shared computers",
      },
      {
        type: "p",
        parts: [
          "Merging does not shrink anything. Five 8 MB scans become a file near 40 MB, plus a little overhead from the new file. If a mailbox rejects it, compress the finished packet and keep the uncompressed merge until you have looked at the smaller file. Browser compression rewrites the PDF structure. It does not re-encode photos, so a stack of scans may barely change size. The ",
          { href: "/blog/compress-a-pdf-without-uploading-it", label: "compression guide" },
          " explains how to tell a useful result from a file you should discard. If the size will not move, split the packet or send a link from storage you control.",
        ],
      },
      {
        type: "p",
        parts: [
          "Photos mixed with PDFs do not need a separate conversion first. ",
          { href: "/tools/merge-pdf-and-images", label: "Merge PDF and images" },
          " accepts both and still processes them locally. Drop the photos in the position where the reader should see them, not at the end by default.",
        ],
      },
      {
        type: "p",
        parts: [
          "On a shared or borrowed computer, the finished file sits in the browser download folder next to anything else that was saved there. Move it to a private folder and remove the copy you do not need. Closing the tab drops the in-memory file. It does not empty Downloads.",
        ],
      },
    ],
  },
  {
    slug: "compress-a-pdf-without-uploading-it",
    title: "Compress a PDF Without Uploading It",
    description:
      "Shrink a PDF in your browser, see what actually gets smaller, and keep the original when the rewrite does not help.",
    published: "2026-10-16",
    image: "/img/blog/compress-pdf.svg",
    imageAlt: "Illustration of a large PDF reduced to a smaller file",
    keywords: [
      "compress PDF without uploading",
      "reduce PDF size in browser",
      "private PDF compressor",
      "QuickPDFKit compress PDF",
    ],
    tools: [
      {
        href: "/tools/compress-pdf",
        label: "Compress PDF",
        description: "Rebuild a PDF locally with object streams and compare the new size with the original.",
      },
      {
        href: "/tools/hyper-compress-pdf",
        label: "Hyper Compress PDF",
        description: "Clear document info and rewrite the file structure. Judge the result by the size you see.",
      },
    ],
    blocks: [
      {
        type: "p",
        parts: [
          "A lot of compress-PDF sites upload the file, recompress the pictures on a server, and hand you a link. That can shrink a photo-heavy scan by a wide margin. It also means the document left your computer. QuickPDFKit compresses in the browser. You pick the file, the tab rewrites it, and the result downloads locally. The PDF is not uploaded to QuickPDFKit for processing. Treat the size change as something you measure, not as a promise.",
        ],
      },
      {
        type: "h2",
        text: "What gets smaller, and what does not",
      },
      {
        type: "p",
        parts: [
          { href: "/tools/compress-pdf", label: "Compress PDF" },
          " rebuilds the document and saves it with object streams, which packs the file's internal objects more tightly. That helps a PDF that was exported with loose structure. It does not resample the photos or scans embedded in the pages. A 20 MB contract scan is large because of the images, not because of the wrapper around them. Rewrapping it will not turn those images into smaller pictures.",
        ],
      },
      {
        type: "p",
        parts: [
          { href: "/tools/hyper-compress-pdf", label: "Hyper Compress PDF" },
          " adds a choice. Light clears the title, author, subject, keywords, producer, and creator fields and leaves the structure alone. Recommended also rewrites the file with object streams. Use Light when you only want the document info gone, and Recommended when you also want a tighter file. The page shows the original size and the new size. If the tool says the PDF is already optimized, or the new file is the same size or larger, keep the original. A larger download is a signal to stop, not a file to send.",
        ],
      },
      {
        type: "h2",
        text: "A practical pass",
      },
      {
        type: "ol",
        items: [
          [
            "Open the original and note the page count, a heading, and one page that contains a picture or a fine line. You need something to compare.",
          ],
          [
            "Choose ",
            { href: "/tools/compress-pdf", label: "Compress PDF" },
            " for a straightforward rebuild, or ",
            { href: "/tools/hyper-compress-pdf", label: "Hyper Compress PDF" },
            " if you also want the document info cleared.",
          ],
          [
            "Select the file from your device. The word upload on the page means choosing a local file. It does not send the PDF to a QuickPDFKit server.",
          ],
          [
            "Download the result and read the sizes on the page before you close it. Write down the reduction if there is one.",
          ],
          [
            "Open the new file. Check the page count, the page you flagged, and the last page. Select a sentence if the source had real text, and confirm it is still text.",
          ],
        ],
      },
      {
        type: "h2",
        text: "Keep the original until the new file earns it",
      },
      {
        type: "p",
        parts: [
          "Do not delete the source in the same minute you download the compressed copy. Three checks decide it. The page count matches. The pages you sampled still look right. The new file is actually smaller. If any of those fail, discard the new file and send or archive the original.",
        ],
      },
      {
        type: "p",
        parts: [
          "Clearing metadata is permanent in the copy you just made. That is useful when the author field names a staff member you do not want in a client packet. It is a mistake if you still need that title or author on your own archive. Run the hyper tool on a copy. The ",
          { href: "/blog/checklist-share-a-pdf-securely", label: "sharing checklist" },
          " puts metadata in the wider list of things to review before a file goes out.",
        ],
      },
      {
        type: "h2",
        text: "When shrinking is the wrong goal",
      },
      {
        type: "p",
        parts: [
          "Mailboxes often stop at 10 MB or 25 MB. If a scan will not shrink, the limit is the pictures, and another pass through the same tool will not change that. Split the file into parts and send the parts, or reduce the resolution in the app that created the scan. ",
          { href: "/blog/how-to-split-a-large-pdf-safely", label: "Splitting a large PDF" },
          " covers how the page cuts work. Compressing after you ",
          { href: "/blog/how-to-merge-pdfs-in-your-browser", label: "merge" },
          " is usually better than compressing each piece and then merging the compressed files, because you can judge one result.",
        ],
      },
      {
        type: "p",
        parts: [
          "Browser processing does not protect a file you then attach to an open email thread, and it does not remove the download from a shared computer. Close the tab and delete the copies in Downloads when you are finished. If the document is sensitive enough that a password matters, add that after you are happy with the size, and keep an unprotected original somewhere only you can open.",
        ],
      },
    ],
  },
  {
    slug: "pdf-vs-word-when-to-convert",
    title: "PDF vs Word: When to Convert",
    description:
      "Choose PDF or Word for the job you actually have, and convert only when the other format solves a real problem.",
    published: "2026-10-24",
    image: "/img/blog/pdf-vs-word.svg",
    imageAlt: "Illustration of a PDF document beside a Word document",
    keywords: [
      "PDF vs Word",
      "when to convert PDF to Word",
      "Word to PDF",
      "QuickPDFKit PDF converter",
    ],
    tools: [
      {
        href: "/tools/convert-pdf-to-word",
        label: "PDF to Word",
        description: "Extract the text of a PDF into a Word file. Images and complex layouts are not preserved.",
      },
      {
        href: "/tools/word-to-pdf",
        label: "Word to PDF",
        description: "Turn a Word document into a PDF in the browser. Check the preview before you send it.",
      },
    ],
    blocks: [
      {
        type: "p",
        parts: [
          "People convert out of habit. A PDF arrives, they turn it into Word, edit one line, and export a PDF that no longer matches the original. The two formats solve different problems. Pick the one that matches the job, then convert only for that reason. Both QuickPDFKit converters run in the browser, so the file is not uploaded for processing. Local conversion does not make a lossy conversion accurate. You still have to read the result.",
        ],
      },
      {
        type: "h2",
        text: "Leave it as a PDF when the layout is the point",
      },
      {
        type: "p",
        parts: [
          "Invoices, signed agreements, forms, slide handouts, and anything you will print or archive belong in PDF. The reader sees the line breaks you approved. They may be able to copy text, but they are not invited to reflow the document. If you already have a finished PDF and you only need to send it, do not convert it. Conversion is a new file with new chances to drop a total, a page, or a signature image.",
        ],
      },
      {
        type: "h2",
        text: "Use Word while the sentences are still changing",
      },
      {
        type: "p",
        parts: [
          "Drafts, policies under review, and letters you will revise next week are easier in a word processor. Comments, tracked changes, and styles belong there. A PDF is a poor place to rewrite a paragraph. If you wrote the document, the Word file is the source. Fix the typo there and export again. Round-tripping through PDF to repair one word usually costs more time than it saves, and it throws away layout you already had.",
        ],
      },
      {
        type: "h2",
        text: "Convert PDF to Word only for the text",
      },
      {
        type: "p",
        parts: [
          { href: "/tools/convert-pdf-to-word", label: "PDF to Word" },
          " reads the text from each page and writes a Word file. It is the right move for a report you must edit when you do not have the source. It is the wrong move for a designed brochure. Images, complex tables, and special layouts are not preserved. Columns can come out as one stream of text. A scanned page with no text layer comes out empty or nearly empty, because there is no text to extract. If the preview looks sparse, the PDF is probably a picture of a page. Converting it will not create an article you can edit. You would need a transcription of that scan, which this tool does not do.",
        ],
      },
      {
        type: "p",
        parts: [
          "After a PDF-to-Word conversion, check names, dates, totals, and clause numbers before you trust the paragraphs around them. Check whether a heading is still a heading and whether a table is still a table or has become a line of words. If a signature image disappeared, the PDF was the record. Do not replace a signed PDF with the converted Word file.",
        ],
      },
      {
        type: "h2",
        text: "Convert Word to PDF when you are done editing",
      },
      {
        type: "p",
        parts: [
          { href: "/tools/word-to-pdf", label: "Word to PDF" },
          " turns the document into a PDF you can download locally, so someone can open it without Word. It is aimed at documents with ordinary formatting. Complex formatting, some images, headers, footers, and page numbers may not transfer cleanly. Read the preview before you download. Then open the PDF and compare it with the Word file: headings, page breaks, tables, and the last page. If the layout is contractual, compare page by page. A shifted clause is worse than sending the Word file to someone who can open it.",
        ],
      },
      {
        type: "h2",
        text: "A simple rule",
      },
      {
        type: "ul",
        items: [
          [
            "Still editing the sentences: stay in Word, or convert from PDF once, edit, then export.",
          ],
          [
            "Sending a finished copy: PDF. Keep the Word file as the source if another round of edits is likely.",
          ],
          [
            "One typo in a file you wrote: fix the source. Do not convert the PDF back to Word for that.",
          ],
          [
            "Need a smaller finished PDF: export first, then ",
            { href: "/blog/compress-a-pdf-without-uploading-it", label: "compress the PDF" },
            " and keep the export if the smaller file is not actually smaller or no longer matches.",
          ],
          [
            "Need a few pages, not a conversion: ",
            { href: "/blog/how-to-split-a-large-pdf-safely", label: "split or extract those pages" },
            " instead of turning the whole document into Word.",
          ],
        ],
      },
      {
        type: "p",
        parts: [
          "A contract you would not upload to a random converter is a reasonable file to convert here. The download still remains on the computer. On a shared machine, move it out of the public Downloads folder when you are done, the same way you would after a merge or a split.",
        ],
      },
    ],
  },
  {
    slug: "how-to-split-a-large-pdf-safely",
    title: "How to Split a Large PDF Safely",
    description:
      "Cut a large PDF into the pages you mean to share, without uploading it, and check the edges of every piece.",
    published: "2026-10-30",
    image: "/img/blog/split-pdf.svg",
    imageAlt: "Illustration of one PDF divided into smaller documents",
    keywords: [
      "split PDF safely",
      "split large PDF in browser",
      "extract PDF pages",
      "QuickPDFKit split PDF",
    ],
    tools: [
      {
        href: "/tools/split-pdf-online",
        label: "Split PDF",
        description: "Save selected pages as separate files, or group ranges into multi-page PDFs.",
      },
      {
        href: "/tools/split-pdf-into-parts",
        label: "Split PDF into parts",
        description: "Divide the whole document into a number of pieces by page count.",
      },
      {
        href: "/tools/merge-pdf",
        label: "Merge PDF",
        description: "Pull one page range, such as 4-6, into a single smaller PDF.",
      },
    ],
    blocks: [
      {
        type: "p",
        parts: [
          "A 200-page export is awkward to email, awkward to review, and a poor file to hand to a site that wants the whole thing before it will cut out ten pages. Splitting in the browser keeps the document on the machine that already has it. You choose the pages, the tool builds new PDFs locally, and you download the pieces. Decide the cut before you open the tool. The wrong mode produces a folder of single pages when you wanted one excerpt, or one excerpt when you wanted a stack of receipts.",
        ],
      },
      {
        type: "h2",
        text: "One smaller PDF from a few pages",
      },
      {
        type: "p",
        parts: [
          "A client asked for the signature page and the fee schedule. You do not need to send the other 80 pages, and you want those two sections in one file. Use ",
          { href: "/tools/merge-pdf", label: "Merge PDF" },
          " with a single source and a page range such as 4-6 or 2,14-16. Leave every other file out. The range keeps those pages, in order, in one download. That is the reliable way to extract a section without splitting it into one file per page.",
        ],
      },
      {
        type: "h2",
        text: "One file per page",
      },
      {
        type: "p",
        parts: [
          { href: "/tools/split-pdf-online", label: "Split PDF" },
          " is built for separate files. Select the pages you want, or switch to individual mode for every page. Each chosen page downloads on its own, named with its page number. A custom range without a vertical bar does the same: 1-3 becomes three single-page PDFs, not one three-page file. That is what you want for a packet of scanned receipts. It is a mess if you wanted a chapter. Allow the browser to download multiple files when it asks. Name and file the downloads immediately. Fifty files called page-1.pdf will not stay organized.",
        ],
      },
      {
        type: "h2",
        text: "Several multi-page files, or equal parts",
      },
      {
        type: "p",
        parts: [
          "When you know the sections, use the custom range and separate groups with a vertical bar. The placeholder on the tool shows the pattern: 1-3 | 4-6 creates two files, one for each group. Check the thumbnails against those numbers before you start. A range that is off by one page is enough to send the wrong exhibit.",
        ],
      },
      {
        type: "p",
        parts: [
          "A mailbox that rejects anything over 10 MB, and a PDF that will not ",
          { href: "/blog/compress-a-pdf-without-uploading-it", label: "compress" },
          " because it is mostly images, is a job for ",
          { href: "/tools/split-pdf-into-parts", label: "Split PDF into parts" },
          ". You choose how many parts. The tool divides the page count as evenly as it can. It does not aim at a file size. A part full of photos can still be over the limit while a part full of text is tiny. Check the size of each download. If one part is still too large, split that part again or cut by a range you choose.",
        ],
      },
      {
        type: "h2",
        text: "Checks that matter more than the click",
      },
      {
        type: "ul",
        items: [
          [
            "Note the original page count. After the split, the pieces should account for the pages you meant to include, not necessarily every page.",
          ],
          [
            "Read the first and last page of each piece. Splits fail at the boundary: the last page of part 1 repeated, or the first page of part 2 missing.",
          ],
          [
            "Do not split a password-protected file until you can open it. If the tool cannot read the PDF, forcing another tool is not a workaround.",
          ],
          [
            "Large files use memory in the tab. Close other heavy tabs first. If the browser stalls, split a smaller range instead of the whole book in one pass.",
          ],
          [
            "Splitting is not redaction. A page you left out is absent, which is what you want. Text on a page you included is still there, including a header that names the client. Read headers and footers before you call something a small excerpt.",
          ],
        ],
      },
      {
        type: "p",
        parts: [
          "The new files land in Downloads. On a shared computer, move them to a private folder and remove the copies you do not need. If the piece is still sensitive, protect it or watermark it after the split, using the steps in the ",
          { href: "/blog/checklist-share-a-pdf-securely", label: "sharing checklist" },
          ". Keep the full original. A forgotten password on a split piece is not recoverable from the browser tool.",
        ],
      },
      {
        type: "p",
        parts: [
          "Leave a signed agreement whole. Sending only the signature page without the terms is how disputes start. Split for convenience, and keep the full file as the copy of record. If you later need the pieces back together, ",
          { href: "/blog/how-to-merge-pdfs-in-your-browser", label: "merge them in order" },
          " and check the joins.",
        ],
      },
    ],
  },
  {
    slug: "checklist-share-a-pdf-securely",
    title: "Checklist: Share a PDF Securely",
    description:
      "Ten checks before you send a PDF: the right file, extra pages, metadata, watermarks, passwords, and the channel you use.",
    published: "2026-11-05",
    image: "/img/blog/share-pdf-securely.svg",
    imageAlt: "Illustration of a locked PDF marked as a draft",
    keywords: [
      "share a PDF securely",
      "password protect PDF",
      "PDF metadata",
      "QuickPDFKit protect PDF",
    ],
    tools: [
      {
        href: "/tools/protect-pdf",
        label: "Protect PDF",
        description: "Add a password in the browser for ordinary sharing. Keep an unprotected copy you can still open.",
      },
      {
        href: "/tools/add-watermark-to-pdf",
        label: "Add a watermark",
        description: "Mark a copy as a draft or with the recipient's name so a forward is obvious.",
      },
      {
        href: "/tools/add-pdf-meta-data",
        label: "Edit PDF metadata",
        description: "Review or change the title, author, subject, and keywords before the file goes out.",
      },
      {
        href: "/tools/sign-pdf",
        label: "Sign PDF",
        description: "Place a signature image on the page. This is not a certificate-backed digital signature.",
      },
    ],
    blocks: [
      {
        type: "p",
        parts: [
          "The attachment is the wrong version, the file still lists an internal project in its document info, or the password travels in the same email as the file. This is the short list of what to do before you hit send. Work on a copy and keep the original until that copy is the one you meant to send. These steps run in the browser, so the PDF is not uploaded to QuickPDFKit.",
        ],
      },
      {
        type: "h2",
        text: "The file itself",
      },
      {
        type: "ol",
        items: [
          [
            "Confirm it is the right file. Open it. Check the title page, the date, and the last page. The filename is not proof. A name like Draft_final_v7.pdf has been the wrong file often enough to deserve the extra look.",
          ],
          [
            "Remove pages the recipient should not see. ",
            { href: "/blog/how-to-split-a-large-pdf-safely", label: "Split out the pages that belong in this share" },
            ". If a paragraph is confidential, delete it in the source and export again. Covering text with a white box is not removal. A later reader can still select or uncover it.",
          ],
          [
            "Read headers, footers, and the file name. An excerpt can still name a client you did not intend to disclose. Rename the download to something that is accurate and not more revealing than the document.",
          ],
          [
            "Decide whether document info matters. PDFs often store an author, a title, and the app that created them. That can reveal a staff name or an internal project. ",
            { href: "/tools/add-pdf-meta-data", label: "Edit PDF metadata" },
            " changes the title, author, subject, and keywords locally. ",
            { href: "/tools/hyper-compress-pdf", label: "Hyper Compress PDF" },
            " can clear title, author, subject, keywords, producer, and creator when a plainer copy is acceptable. Clear those fields on the copy you send. Keep your own original. What actually gets smaller is covered in the ",
            { href: "/blog/compress-a-pdf-without-uploading-it", label: "compression guide" },
            ".",
          ],
        ],
      },
      {
        type: "h2",
        text: "Marks, passwords, and signatures",
      },
      {
        type: "ol",
        items: [
          [
            "Mark drafts visibly. A watermark such as DRAFT, or the recipient's name, makes a forwarded file easier to recognize. ",
            { href: "/tools/add-watermark-to-pdf", label: "Add a watermark" },
            " can place text or an image across the pages. It does not stop copying or a screenshot. It makes an accidental forward obvious. Watermark the copy, not the archive original, unless the archive should carry the mark too.",
          ],
          [
            "Add a password only when it helps. A password stops a casual forward from opening. ",
            { href: "/tools/protect-pdf", label: "Protect PDF" },
            " applies that password in the browser. Use at least 6 characters, and use a password you have not used elsewhere. This is basic protection for ordinary sharing, not a substitute for a managed encryption system. A PDF permission flag is a weak barrier."
          ],
          [
            "Send the password by a different channel than the file. The file by email, the password by a call or a separate message. A password in the same email is not a control. Store the password yourself. If you lose it, the browser tool cannot recover the file. Keep an unprotected copy in a place only you can open.",
          ],
          [
            "Sign when the visible signature is what the packet needs, and only after the text has stopped changing. ",
            { href: "/tools/sign-pdf", label: "Sign PDF" },
            " places a signature image on the page. It is not a certificate-backed digital signature, and it will not prove later that the file was unchanged. For an agreement that needs that kind of signature, use a signing service that issues a certificate. Do not merge, split, or convert a file after you have signed the version people will keep.",
          ],
        ],
      },
      {
        type: "h2",
        text: "The way it leaves",
      },
      {
        type: "ol",
        items: [
          [
            "Choose the channel for the contents. Email is fine for ordinary business files. For anything you would not want in a forwarded thread, use a share the recipient must sign in to open, and set it to expire. A public link with no password is a publication.",
          ],
          [
            "Send the smallest correct copy. Compress only if the rewrite actually shrinks the file and the pages still match. If it does not shrink, send the original or a split excerpt. Do not attach both a compressed and an uncompressed version unless you mean to give the recipient a choice.",
          ],
          [
            "After it leaves, tidy up. Remove the export from Downloads on a shared machine. If you sent the wrong file, say so in the same thread and send the correction. Asking someone to ignore the last attachment, without a replacement, leaves the wrong file as the one they will open.",
          ],
        ],
      },
      {
        type: "p",
        parts: [
          "If you only do three things, open the file, remove the pages that do not belong, and send any password by a second channel. The rest of the list is how you avoid the quieter mistakes: metadata, a draft that looks final, and a signature image that people will treat as more than it is. How QuickPDFKit handles pages and files is also described in the ",
          { href: "/privacy-policy", label: "privacy policy" },
          ".",
        ],
      },
    ],
  },
];
