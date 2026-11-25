import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

const updated = "November 25, 2026";

export default function PrivacyPolicy() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Privacy <span className="text-orange-500">policy</span>
          </h1>
          <p className="text-gray-700 text-base leading-7">
            This policy describes quickpdfkit.com, a small independent site of free PDF tools. It was last updated on {updated}. The short version: files you open in a tool stay in your browser. The site does not have accounts. Google AdSense and Google Analytics run on the pages.
          </p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Files you process</h2>
          <p className="text-gray-700 text-base leading-7">
            When you use a tool, you pick a file from your device. The page reads it with code that runs in the browser, including pdf-lib and PDF.js, and downloads the result to your device. QuickPDFKit does not receive the PDF, the images, the Word file, the signature you draw, or the password you type. Those values are not stored on our servers, because the tools do not send them to us.
          </p>
          <p className="text-gray-700 text-base leading-7">
            There is no signup and no file library. Closing the tab drops the copy held in memory. A file you downloaded remains on your device until you delete it. If you email us a document, that message is ordinary email, not part of the tools, and we do not want private files attached. Describe the problem instead.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Email</h2>
          <p className="text-gray-700 text-base leading-7">
            The contact form opens your email app addressed to {CONTACT_EMAIL}. It does not post the message to a QuickPDFKit server. If you send the email, we receive whatever you chose to include: your address, your name, and the text. We use it to reply. We do not use it to build an account or a marketing list. You can email that address directly.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Google Analytics</h2>
          <p className="text-gray-700 text-base leading-7">
            Pages load Google Analytics (Google Analytics 4). Google may receive your IP address, browser and device details, the pages you open, and approximate location derived from the IP address. We use that to see which pages are used and whether the site is broken. Analytics does not receive the contents of a PDF you process in a tool.
          </p>
          <p className="text-gray-700 text-base leading-7">
            You can block analytics with your browser, with a content blocker, or with Google&apos;s opt-out add-on at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://tools.google.com/dlpage/gaoptout">
              tools.google.com/dlpage/gaoptout
            </a>
            . Google describes its own handling of this data at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Google AdSense</h2>
          <p className="text-gray-700 text-base leading-7">
            The site uses Google AdSense to show ads. AdSense and its partners can set third-party cookies and use similar storage to measure ads and to show personalised ads based on your visits to this site and other sites. Those cookies are not required for the PDF tools to run, and they are not how a file is processed.
          </p>
          <p className="text-gray-700 text-base leading-7">
            You can control personalised ads at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://adssettings.google.com/">
              adssettings.google.com
            </a>
            . Google&apos;s advertising technologies are described at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://policies.google.com/technologies/ads">
              policies.google.com/technologies/ads
            </a>
            , and Google&apos;s privacy policy is at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </a>
            . You can also block third-party cookies in your browser. Blocking them may make ads less relevant or stop some ads from loading. The tools still run.
          </p>
          <p className="text-gray-700 text-base leading-7">
            More detail on cookies is in the{" "}
            <Link href="/cookies" className="text-orange-600 underline underline-offset-2">
              cookie policy
            </Link>
            .
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">What we do not do</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-base leading-7">
            <li>We do not sell accounts or file contents. We do not have those accounts or those files.</li>
            <li>We do not store PDFs with AES encryption on a server. Processing is local, so there is no server copy to encrypt or delete.</li>
            <li>We do not ask you to create a password for QuickPDFKit. A password you set on a PDF exists only inside that file.</li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
          <p className="text-gray-700 text-base leading-7">
            Questions about this policy go to{" "}
            <a className="text-orange-600 underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . If you are in a region that gives you rights to access or delete personal data a company holds, say so in the email. The data we can actually have is the email you sent us and whatever Analytics and AdSense hold at Google, which you can also control with the links above.
          </p>
        </section>
      </div>
    </section>
  );
}
