"use client";

import { motion } from "framer-motion";

export default function TermsAndConditions() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Terms & <span className="text-orange-500">Conditions</span>
          </h1>
          <p className="text-black text-base sm:text-lg">
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using QuickFixPdf. By accessing or using our services, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Acceptance of Terms */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Acceptance of Terms
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            By using QuickFixPdf, you agree to comply with and be bound by these Terms and all applicable laws and regulations. If you do not agree with any part of the Terms, you must not use our services.
          </p>
        </motion.div>

        {/* Use of Service */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Use of Service
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Users must provide accurate information when using the service.</li>
            <li>QuickFixPdf should not be used for illegal, harmful, or fraudulent purposes.</li>
            <li>Users are responsible for maintaining the confidentiality of their account information, if any.</li>
            <li>Excessive use or abuse of the service may result in temporary or permanent suspension.</li>
          </ul>
        </motion.div>

        {/* Intellectual Property */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Intellectual Property
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            All content, features, and functionality of QuickFixPdf, including but not limited to text, graphics, logos, images, and software, are the property of QuickFixPdf or its licensors and are protected by copyright, trademark, and other intellectual property laws.
          </p>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Limitation of Liability
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            QuickFixPdf is provided "as is" without warranties of any kind. To the fullest extent permitted by law, QuickFixPdf shall not be liable for any damages arising from the use or inability to use the service, including data loss, interrupted service, or errors in processing.
          </p>
        </motion.div>

        {/* User Responsibilities */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            User Responsibilities
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Keep all account credentials secure and confidential.</li>
            <li>Ensure that uploaded files do not infringe on third-party rights.</li>
            <li>Comply with all applicable laws while using the service.</li>
          </ul>
        </motion.div>

        {/* Termination */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Termination
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            QuickFixPdf may suspend or terminate access to the service at any time, without prior notice, for any reason including violation of these Terms.
          </p>
        </motion.div>

        {/* Changes to Terms */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Changes to Terms
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            We may update these Terms periodically. Users will be notified of any significant changes, and continued use of QuickFixPdf after changes indicates acceptance of the new Terms.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
