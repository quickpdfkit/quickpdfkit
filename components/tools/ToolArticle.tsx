import Link from "next/link";
import type { ToolPageContent } from "@/config/toolPages";

export default function ToolArticle({ page }: { page: ToolPageContent }) {
  return (
    <article id="tool-guide" className="relative px-4 pb-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm px-6 py-10 sm:px-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">{page.title}</h2>
        {page.lede.map((paragraph, index) => (
          <p key={`lede-${index}`} className="text-gray-700 text-base leading-7 mb-4">
            {paragraph}
          </p>
        ))}

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{page.stepsTitle}</h3>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700 text-base leading-7 mb-4">
          {page.steps.map((step) => (
            <li key={step.name}>
              <strong className="text-gray-900">{step.name}. </strong>
              {step.text}
            </li>
          ))}
        </ol>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{page.tipsTitle}</h3>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 text-base leading-7 mb-4">
          {page.tips.map((tip, index) => (
            <li key={`tip-${index}`}>{tip}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{page.limitsTitle}</h3>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 text-base leading-7 mb-4">
          {page.limits.map((limit, index) => (
            <li key={`limit-${index}`}>{limit}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{page.privacyTitle}</h3>
        {page.privacy.map((paragraph, index) => (
          <p key={`privacy-${index}`} className="text-gray-700 text-base leading-7 mb-4">
            {paragraph}
          </p>
        ))}

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Questions</h3>
        <div className="space-y-5">
          {page.faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="text-base font-semibold text-gray-900">{faq.question}</h4>
              <p className="text-gray-700 text-base leading-7 mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Related tools</h3>
        <ul className="space-y-3">
          {page.related.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700"
              >
                {item.label}
              </Link>
              <span className="text-gray-700 text-base leading-7"> — {item.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
