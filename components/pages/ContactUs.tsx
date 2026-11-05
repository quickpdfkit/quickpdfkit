"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { CONTACT_EMAIL, contactMailto } from "@/lib/contact";

export default function ContactUs() {
  const { dictionary } = useI18n();
  const copy = dictionary.contactPage;
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    const fields = [
      ["name", name],
      ["email", email],
      ["message", message],
    ] as const;
    for (const [field, value] of fields) {
      const input = formEl.elements.namedItem(field);
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = value;
      }
    }
    setForm({ name, email, message });

    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    window.location.href = contactMailto({
      name,
      email,
      message,
      subject: copy.subject.replaceAll("{name}", name),
      bodyName: copy.bodyName,
      bodyEmail: copy.bodyEmail,
    });
  };

  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50 min-h-screen flex items-center justify-center">
      <div className=" rounded-xl shadow-md border border-gray-200 p-12 max-w-6xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          {copy.titleLead} <span className="text-orange-500">{copy.titleAccent}</span>
        </h1>
        <p className="text-gray-700 text-center mb-4">
          {copy.intro}
        </p>
        <p className="text-gray-700 text-center mb-8">
          {copy.emailLead}{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            dir="ltr"
            className="font-semibold text-orange-500 hover:text-orange-600"
          >
            {CONTACT_EMAIL}
          </a>
        </p>

        <form onSubmit={handleSubmit} aria-describedby="contact-mailto-note" className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={copy.namePlaceholder}
            aria-label={copy.namePlaceholder}
            autoComplete="name"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={copy.emailPlaceholder}
            aria-label={copy.emailPlaceholder}
            autoComplete="email"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={copy.messagePlaceholder}
            aria-label={copy.messagePlaceholder}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg resize-none h-32"
            required
          />

          <p id="contact-mailto-note" className="text-sm text-gray-600 text-center">
            {copy.mailtoNote}
          </p>

          <button
            type="submit"
            className="w-full px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-300"
          >
            {copy.send}
          </button>
        </form>
      </div>
    </section>
  );
}
