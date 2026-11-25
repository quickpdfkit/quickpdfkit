import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: (
      <>
        Files stay in the <span className="text-orange-500">browser</span>
      </>
    ),
    paragraphs: [
      "Each tool reads the file you choose and writes the result in the same tab. Merge, split, compress, convert, crop, rotate, watermark, and password protection all follow that pattern. QuickPDFKit does not upload the PDF to a server to process it, and there is no account the file could be stored under.",
      "You still need a network connection to load the website the first time. After the page is open, the document work happens on your device. Closing the tab drops the in-memory copy. The download in your downloads folder is a normal file you move or delete yourself.",
    ],
    image: "/img/feature2.svg",
    imageAlt: "Illustration of a document staying on the device",
  },
  {
    title: (
      <>
        Free, and <span className="text-orange-500">no signup</span>
      </>
    ),
    paragraphs: [
      "The tools are free to use. There is no QuickPDFKit account, no desktop app, and no mobile app. There is also no business plan. The site is supported by Google AdSense, which can set third-party cookies and show personalised ads. Google Analytics measures page visits. Neither of those services is given your PDF.",
      "Limits are the limits of the browser tab: memory, the formats a tool actually accepts, and what the code does. Compressing a PDF tightens its structure and does not resample images. A signature placed on a page is a visual mark, not a digital certificate. The guide under each main tool spells out the steps and limits for that tool.",
    ],
    image: "/img/pdf.svg",
    imageAlt: "PDF document icon",
  },
  {
    title: (
      <>
        The jobs the tools <span className="text-orange-500">actually do</span>
      </>
    ),
    paragraphs: [
      "You can combine PDFs in an order you drag into place, with an optional page range on each file. You can split a PDF into separate files, extract a selection into one PDF, or remove pages. Photos and screenshots can be fitted onto PDF pages. PDF pages can be rendered to JPG, PNG, or WebP.",
      "You can rotate sideways scans, crop the visible edge of a page, stamp page numbers or a watermark, draw annotations, place a signature image, and encrypt a finished PDF with a password. A .docx file can be snapshotted to PDF, and text can be extracted from a PDF into Word. Read the preview or the download before you send it. The tools are practical. They are not a layout-perfect office suite.",
    ],
    image: "/img/feature1.svg",
    imageAlt: "Illustration of PDF tools",
  },
];

export default function OurFeatures() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            QuickPDFKit <span className="text-orange-500">features</span>
          </h1>
          <p className="text-gray-700 text-lg leading-8">
            QuickPDFKit is a set of free, in-browser PDF tools. This page describes what they do. It does not describe a desktop app, a phone app, or a paid team plan, because those do not exist.
          </p>
        </div>
        {features.map((feature, index) => (
          <div
            key={feature.image}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{feature.title}</h2>
              {feature.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-gray-700 text-base leading-7">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="md:w-1/2 relative w-full h-64 sm:h-80">
              <Image src={feature.image} alt={feature.imageAlt} fill className="object-contain" />
            </div>
          </div>
        ))}
        <p className="text-center text-gray-700">
          <Link href="/tools" className="font-medium text-orange-600 underline underline-offset-2">
            Open the tool list
          </Link>{" "}
          or read how files are handled in the{" "}
          <Link href="/privacy-policy" className="font-medium text-orange-600 underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
