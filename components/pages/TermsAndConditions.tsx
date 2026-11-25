import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

const updated = "November 25, 2026";

export default function TermsAndConditions() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Terms and <span className="text-orange-500">conditions</span>
          </h1>
          <p className="text-gray-700 text-base leading-7">
            These terms cover use of quickpdfkit.com. They were last updated on {updated}. The site is a free collection of PDF tools that run in the browser. Using a page means you accept these terms.
          </p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">The service</h2>
          <p className="text-gray-700 text-base leading-7">
            QuickPDFKit lets you process files on your own device. There is no account to create and no file stored for you on a server. You choose a file, the page works on it locally, and you download the result. Output quality depends on the file and on the tool. Read the guide on a tool page before you rely on the result. A signature placed on a page is a visual mark, not a certificate. A password is only as strong as the password you choose, and we cannot recover it.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Your files and your conduct</h2>
          <p className="text-gray-700 text-base leading-7">
            You keep the rights in the files you open. You are responsible for having the right to use them and for what you do with the download. Do not use the site to break the law, to infringe someone else&apos;s copyright, or to hide information in a way the tool does not actually support. Cropping a page changes the visible area. It is not a promise that hidden content was destroyed.
          </p>
          <p className="text-gray-700 text-base leading-7">
            Do not attack the site, probe it for other people&apos;s data, or overload it. There is no customer file store to attack for documents, and trying to disrupt the site is not allowed.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">No warranty</h2>
          <p className="text-gray-700 text-base leading-7">
            The site is provided as is. Tools can fail on a damaged file, an encrypted file, a huge file, or a browser that runs out of memory. Conversions can drop layout, images, or text. Compression might not shrink a file. You should open the download and check it before you delete your original or send the new file to someone else. To the extent the law allows, QuickPDFKit is not liable for lost data, a missed deadline, or a file that did not convert the way you hoped.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Ads and the website itself</h2>
          <p className="text-gray-700 text-base leading-7">
            Pages may show Google AdSense ads and load Google Analytics. Those services are described in the{" "}
            <Link href="/privacy-policy" className="text-orange-600 underline underline-offset-2">
              privacy policy
            </Link>{" "}
            and the{" "}
            <Link href="/cookies" className="text-orange-600 underline underline-offset-2">
              cookie policy
            </Link>
            . The text, layout, and code of the website belong to QuickPDFKit or to the people who license pieces of it. You may use the tools. You may not copy the site and present it as your own product.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Changes and contact</h2>
          <p className="text-gray-700 text-base leading-7">
            These terms can be updated by editing this page. The date at the top will change when that happens. Continued use of the site after an update means you accept the new terms. There is no separate notice by email, because there are no accounts to notify.
          </p>
          <p className="text-gray-700 text-base leading-7">
            Questions:{" "}
            <a className="text-orange-600 underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </section>
  );
}
