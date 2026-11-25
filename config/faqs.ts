export const faqs = [
  {
    question: "Do I need an account?",
    answer:
      "No. QuickPDFKit does not have accounts, sign-in, or a dashboard. Open a tool, use it, and download the result. There is nothing to register.",
  },
  {
    question: "Are my PDFs uploaded?",
    answer:
      "No. The tools run in your browser. The file you pick is read in that tab, and the new file is downloaded to your device. QuickPDFKit does not receive the document, the images, or a password you type into a tool.",
  },
  {
    question: "Is QuickPDFKit free?",
    answer:
      "Yes. There is no paid plan, no subscription, and no business tier. The site shows Google AdSense ads and uses Google Analytics. Those are described in the privacy policy and the cookie policy.",
  },
  {
    question: "Is there a desktop or mobile app?",
    answer:
      "No. QuickPDFKit is the website. Use it in a current version of Chrome, Firefox, Safari, or Edge on a computer or a phone. There is nothing to install from an app store.",
  },
  {
    question: "Which browsers work?",
    answer:
      "Current Chrome, Firefox, Safari, and Edge. The tools need JavaScript and enough memory for the file you open. A very large PDF can fail because the tab runs out of memory, not because a server rejected it.",
  },
  {
    question: "Does compress make every PDF smaller?",
    answer:
      "No. Compress PDF copies the pages into a new file and saves them with tighter PDF structure. It does not recompress photographs. A scan made of images often barely changes size. The page shows the old size and the new size. Keep the original if the new file is not smaller or does not look right.",
  },
  {
    question: "Can I merge only some pages?",
    answer:
      "Yes. On Merge PDF, leave a file's page range blank to include all of it, or type a range such as 1-3,5. Drag the files into the order a reader should see. Pages inside one file come out in numerical order.",
  },
  {
    question: "Is the signature a digital certificate?",
    answer:
      "No. Sign PDF draws, types, or places an image on the page. Readers will not show it as a verified digital signature. It is a visual mark. Keep the unsigned file if you later need a different kind of signature.",
  },
  {
    question: "How does the PDF password work?",
    answer:
      "Protect PDF encrypts the file in the browser with the password you type twice. It must be at least 6 characters. The download should ask for that password to open. We cannot reset it, because we never receive it. Keep an unprotected copy until you have opened the encrypted file successfully.",
  },
  {
    question: "Will Word to PDF keep my formatting?",
    answer:
      "Treat the preview as the result. The tool turns a .docx into HTML and then into a JPEG snapshot spread across PDF pages. Selectable text, Word page breaks, headers, text boxes, and comments often do not survive. Old .doc files should be saved as .docx first.",
  },
  {
    question: "Why is PDF to Word missing columns and pictures?",
    answer:
      "The tool extracts the text layer and writes paragraphs. It does not rebuild columns, tables, or images. A scanned PDF with no text layer comes out empty. It does not run OCR.",
  },
  {
    question: "Does cropping delete the hidden part of the page?",
    answer:
      "Do not assume that. Crop PDF sets the crop box, which changes what viewers display. The trimmed region can still exist in the file. Do not use crop to hide something that must actually be removed.",
  },
  {
    question: "Do you use cookies, ads, or analytics?",
    answer:
      "Yes. The site loads Google AdSense, which can use third-party cookies and show personalised ads, and Google Analytics, which measures visits. You can control ad personalisation at Google's ad settings and block cookies in your browser. The cookie policy has the links. The PDF you process is not part of that measurement.",
  },
  {
    question: "What if a tool fails on a large file?",
    answer:
      "Try a smaller piece. Split or extract the pages you need and run the tool on that file. The limit is your device. Refreshing the page drops the in-memory work, so download anything you want to keep first.",
  },
  {
    question: "How do I contact you?",
    answer:
      "Email hello@quickpdfkit.com. A person reads it and usually replies within two business days. Include the tool page, your browser, and what happened. Do not attach a private PDF.",
  },
];
