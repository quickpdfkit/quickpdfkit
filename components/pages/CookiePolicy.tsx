"use client";

import { motion } from "framer-motion";

export default function CookiePolicy() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cookie <span className="text-orange-500">Policy</span>
          </h1>
          <p className="text-black text-base sm:text-lg">
            This Cookie Policy explains how QuickFixPdf uses cookies and similar
            technologies to enhance your experience while using our services.
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
            QuickFixPdf uses cookies to personalize your experience, improve site functionality, and analyze performance. By continuing to use our services, you consent to the use of cookies in accordance with this policy.
          </p>
        </motion.div>

        {/* What Are Cookies */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What Are Cookies?
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Cookies are small text files stored on your device that allow websites to remember your preferences, improve performance, and track usage. They help us provide a better and more personalized experience.
          </p>
        </motion.div>

        {/* Types of Cookies We Use */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Types of Cookies We Use
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> Necessary for core functions such as file uploads, processing, and security.
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand usage patterns and improve site speed and functionality.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Store user preferences, such as language or theme settings, to personalize your experience.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Track visitor activity anonymously to measure and optimize website performance.
            </li>
          </ul>
        </motion.div>

        {/* Managing Cookies */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Managing Cookies
          </h2>
          <p className="text-gray-700 text-sm sm:text-base mb-2">
            You can manage cookies through your browser settings. Most browsers allow you to block, delete, or limit cookies. Disabling certain cookies may affect site functionality.
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            For more details on managing cookies in your browser, please refer to your browser’s help documentation.
          </p>
        </motion.div>

        {/* Consent */}
        <motion.div
          layout
          className="bg-white rounded-xl shadow-md border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Consent
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            By using QuickFixPdf, you consent to our use of cookies as described in this Cookie Policy. You may withdraw your consent at any time by adjusting your browser settings.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
