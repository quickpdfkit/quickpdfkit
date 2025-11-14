"use client";

import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact Form Data:", form);
    setForm({ name: "", email: "", message: "" });
    setSubmitted(true);
  };

  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50 min-h-screen flex items-center justify-center">
      <div className=" rounded-xl shadow-md border border-gray-200 p-12 max-w-6xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          Contact <span className="text-orange-500">Us</span>
        </h1>
        <p className="text-gray-700 text-center mb-8">
          Have questions, suggestions, or feedback? Fill out the form below and we'll get back to you shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base sm:text-lg resize-none h-32"
            required
          />

          <button
            type="submit"
            className="w-full px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-300"
          >
            Send Message
          </button>

          {submitted && (
            <p className="text-green-600 font-medium mt-2 text-center">
              Thank you! Your message has been sent.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
