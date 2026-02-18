"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Privacy <span className="text-orange-500">Policy</span>
          </h1>
          <p className="text-black text-base sm:text-lg">
            Your privacy is important to us. This Privacy Policy explains how
            QuickFixPdf collects, uses, and protects your personal information
            when you use our services.
          </p>
        </div>

        {/* Introduction */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            QuickFixPdf is committed to protecting your privacy. By using our
            services, you agree to the collection and use of information in
            accordance with this policy. We aim to be transparent and provide
            you with control over your data.
          </p>
        </motion.div>

        {/* Information We Collect */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Information We Collect
          </h2>
          <p className="text-gray-700 text-sm sm:text-base mb-4">
            We may collect the following types of information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Personal information you provide when signing up (name, email)</li>
            <li>Files you upload for processing, including PDFs, DOCX, and images</li>
            <li>Usage data such as IP address, browser type, and activity logs</li>
          </ul>
        </motion.div>

        {/* How We Use Your Information */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>To process and manage the documents you upload</li>
            <li>To improve our services and ensure smooth operation</li>
            <li>To provide customer support and respond to inquiries</li>
            <li>To send important updates or notifications related to the service</li>
          </ul>
        </motion.div>

        {/* Data Protection */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Data Protection
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            We use AES-256 encryption for all file transfers and secure storage.
            Files uploaded for processing are automatically deleted after a short
            period. Your personal information is never shared with third parties
            without your consent.
          </p>
        </motion.div>

        {/* Cookies and Tracking */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Cookies and Tracking
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            We use cookies to enhance user experience and track usage
            statistics. You can disable cookies in your browser, but some
            functionality may be limited. Tracking is used only for analytics
            and performance optimization.
          </p>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Rights
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            You have the right to access, modify, or delete your personal
            information. You can also opt out of marketing communications and
            request a copy of all the data we hold about you by contacting us
            directly.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            If you have questions about this Privacy Policy or our practices,
            please contact us at{" "}
            <a
              href="mailto:support@QuickFixPdf.com"
              className="text-orange-500 underline"
            >
              support@QuickFixPdf.com
            </a>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
