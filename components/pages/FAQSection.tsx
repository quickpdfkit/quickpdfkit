"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How do I upload a PDF?",
      answer:
        "You can drag and drop your PDF into the uploader or click the upload button to browse files from your computer. Supported formats include PDF, DOCX, and more. Each file is processed securely in the cloud and does not affect your local storage.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use AES-256 encryption for all file transfers. Your files are deleted from our servers after processing, and we never share your data with third parties. You can work with confidence knowing your documents are fully protected.",
    },
    {
      question: "Can I merge multiple PDFs?",
      answer:
        "Yes! You can merge, split, compress, and convert PDFs easily. Simply select the files you want to combine or split, choose your options, and download the final document. The interface is simple and optimized for quick workflows.",
    },
    {
      question: "Do I need an account to use CouldFixPdf?",
      answer:
        "Most of our features are free and do not require creating an account. However, signing up allows you to access advanced features, save your documents to the cloud, and enjoy faster processing speeds.",
    },
    {
      question: "Which platforms are supported?",
      answer:
        "CouldFixPdf works on all modern browsers and devices. You can use it on Windows, Mac, Linux, iOS, and Android without installing any software. We also offer dedicated apps for iLovePDF Desktop and iLovePDF Mobile for even more convenience.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4  bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mt-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-16">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
          <p className="text-black text-center ">
            {" "}
            We know you might have questions before getting started, so we've
            compiled a list of the most common inquiries about using CouldFixPdf.
            From uploading and processing files to security and platform
            compatibility, our FAQs provide clear answers to help you use our
            services efficiently and safely.
          </p>
        </div>

        <div className="space-y-4 mt-20">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              layout
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 focus:outline-none"
              >
                <span className="text-lg sm:text-xl font-medium text-gray-900 text-left">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-orange-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="px-6 pb-6 text-gray-700 text-sm sm:text-base"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
