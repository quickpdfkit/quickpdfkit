import Link from "next/link";
import { faqs } from "@/config/faqs";

export default function FAQSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6">
          Frequently asked <span className="text-orange-500">questions</span>
        </h1>
        <p className="text-gray-700 text-base leading-7 text-center mb-12">
          QuickPDFKit is a free website of PDF tools that run in the browser. These answers match how the site works today: no account, no upload of your files, and no desktop or mobile app. The privacy policy covers ads and analytics.
        </p>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <article key={faq.question} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">{faq.question}</h2>
              <p className="text-gray-700 text-base leading-7 mt-2">{faq.answer}</p>
            </article>
          ))}
        </div>
        <p className="text-gray-700 text-base leading-7 mt-10">
          Still stuck? Email the address on the{" "}
          <Link href="/contact" className="font-medium text-orange-600 underline underline-offset-2">
            contact page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
