import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

export default function AboutUs() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            About <span className="text-orange-500">QuickPDFKit</span>
          </h1>
          <p className="text-gray-700 text-lg leading-8">
            QuickPDFKit is a small independent website of free PDF tools. The tools run in your browser. You open a page, choose a file from your device, and download the result. There is no account, no desktop app, and no mobile app.
          </p>
          <p className="text-gray-700 text-base leading-7">
            The project exists for ordinary jobs: combining a few PDFs, splitting out a chapter, turning photos into a PDF, placing a signature on a form, or adding a password before you email a file. It is not a company history, and it does not publish user counts or awards.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">What actually happens to a file</h2>
          <p className="text-gray-700 text-base leading-7">
            A tool reads the file you picked with code that ships in the page, including pdf-lib and PDF.js. The new file is created in that browser tab and saved to your device. QuickPDFKit does not receive the PDF, the images, or the password you type into a tool.
          </p>
          <p className="text-gray-700 text-base leading-7">
            The site itself is a normal website. Loading a page can contact Google, because the site shows Google AdSense ads and measures visits with Google Analytics. Those services do not receive the contents of the files you process. The privacy policy and the cookie policy describe them.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">What this site is not</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-base leading-7">
            <li>There is no QuickPDFKit desktop application and no phone app to install.</li>
            <li>There is no business plan, team workspace, or subscription.</li>
            <li>A signature placed here is a mark drawn on the page, not a certificate.</li>
            <li>Compressing a PDF rewrites its structure. It does not recompress the photos inside it.</li>
            <li>Word and PDF conversions are practical and imperfect. Read the tool page before you rely on the layout.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
          <p className="text-gray-700 text-base leading-7">
            Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-orange-600 hover:text-orange-700">
              {CONTACT_EMAIL}
            </a>
            . A person reads that mailbox and usually replies within two business days. Say which tool you used and what the page did. Do not attach a private document.
          </p>
          <p className="text-gray-700 text-base leading-7">
            <Link href="/tools" className="font-medium text-orange-600 underline underline-offset-2">
              Browse the tools
            </Link>
            , read the{" "}
            <Link href="/faq" className="font-medium text-orange-600 underline underline-offset-2">
              FAQ
            </Link>
            , or see the{" "}
            <Link href="/privacy-policy" className="font-medium text-orange-600 underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
