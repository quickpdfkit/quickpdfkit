import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

const updated = "November 25, 2026";

export default function CookiePolicy() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cookie <span className="text-orange-500">policy</span>
          </h1>
          <p className="text-gray-700 text-base leading-7">
            This policy explains the cookies and similar storage used on quickpdfkit.com. It was last updated on {updated}. The PDF tools do not need a cookie to read your file. The cookies that do get set come from Google advertising and measurement.
          </p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Cookies the tools do not use</h2>
          <p className="text-gray-700 text-base leading-7">
            Choosing a PDF, merging it, or typing a password into a tool does not upload that file and does not require an account cookie. QuickPDFKit does not set a login cookie, because there is no login. The contact form does not set a cookie either. It opens your email program.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Google AdSense</h2>
          <p className="text-gray-700 text-base leading-7">
            Pages load Google AdSense. AdSense can store third-party cookies, and partners that deliver ads can store cookies too. Those cookies may remember that you visited this site, measure whether an ad was shown, and personalise later ads on this site and on other sites that use Google advertising. Personalised ads are ads selected using information about your activity, not ads that contain your PDF.
          </p>
          <p className="text-gray-700 text-base leading-7">
            Control personalised ads at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://adssettings.google.com/">
              adssettings.google.com
            </a>
            . Read how Google uses advertising cookies and data at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://policies.google.com/technologies/ads">
              policies.google.com/technologies/ads
            </a>{" "}
            and in Google&apos;s privacy policy at{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Google Analytics</h2>
          <p className="text-gray-700 text-base leading-7">
            Google Analytics sets its own cookies or uses similar storage to distinguish browsers and to remember how you moved through the site. We use the reports to see which tools are opened and to notice broken pages. Analytics cookies are not a copy of your document.
          </p>
          <p className="text-gray-700 text-base leading-7">
            You can reject analytics cookies in the browser, use a blocker, or install Google&apos;s opt-out add-on from{" "}
            <a className="text-orange-600 underline underline-offset-2" href="https://tools.google.com/dlpage/gaoptout">
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">How to limit cookies</h2>
          <p className="text-gray-700 text-base leading-7">
            Browser settings can block third-party cookies, delete existing cookies, or prompt you before a cookie is stored. Blocking third-party cookies is the control that affects AdSense most directly. The PDF tools keep working. Ads may load differently or not load.
          </p>
          <p className="text-gray-700 text-base leading-7">
            The site does not show a separate consent banner today. If you do not want advertising or analytics cookies, set that preference in the browser or at the Google links above before you use the site, or use a browser profile that already blocks them.
          </p>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
          <p className="text-gray-700 text-base leading-7">
            Questions about this policy:{" "}
            <a className="text-orange-600 underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . How the rest of the site handles data is in the{" "}
            <Link href="/privacy-policy" className="text-orange-600 underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </section>
      </div>
    </section>
  );
}
