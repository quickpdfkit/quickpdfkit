"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-32">

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
            About <span className="text-orange-500">Us</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto">
            QuickFixPdf is committed to revolutionizing the way people manage
            documents. From powerful batch processing to advanced team
            features, we aim to save time, boost productivity, and simplify
            workflows for millions of users worldwide.
          </p>
        </div>

        {/* Our Story */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-semibold text-gray-900">Our Story</h2>
            <p className="text-gray-700 text-base sm:text-lg">
              QuickFixPdf began as a small startup with a big idea: make PDF and
              document management effortless for everyone. What started in a
              small office with a passionate team of developers has grown into
              a comprehensive suite of document tools trusted worldwide.
            </p>
            <p className="text-gray-700 text-base sm:text-lg">
              From the beginning, our mission has been simple: empower people
              to save time, stay organized, and achieve more. Every tool we
              create is designed to simplify tasks while ensuring security and
              privacy.
            </p>
          </div>
          <div className="md:w-1/2 relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src="/img/not-given.jpg"
              alt="Our Story"
              fill
              className="object-contain rounded-xl"
            />
          </div>
        </div>

        {/* History & Milestones */}
        <div className="space-y-12 py-20">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-8">
            History & <span className="text-orange-500">Milestones</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">2015</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                QuickFixPdf was founded with the goal to streamline document
                workflows for individuals and small businesses. Our first
                PDF merge tool went live and received immediate positive feedback.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">2017</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Introduced batch processing and advanced editing features,
                enabling users to handle multiple files at once with ease.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">2019</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Expanded to team collaboration features, allowing businesses to
                share templates, watermarks, and default actions across teams.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">2022</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Launched mobile apps and desktop versions to provide seamless
                access on every platform, further increasing productivity.
              </p>
            </div>
          </div>
        </div>

       

        {/* Core Values */}
        <div className="py-20">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-8">
            Core <span className="text-orange-500">Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Constantly improving and creating new features to meet user
                needs and stay ahead in technology.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Operating with transparency, security, and privacy at the
                forefront of every decision.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Focus</h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Designing tools that save time, enhance productivity, and
                provide real value to our users.
              </p>
            </div>
          </div>
        </div>

        {/* Awards & Media */}
        <div className="py-20">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-8">
            Awards & <span className="text-orange-500">Recognition</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Productivity App 2021</h3>
              <p className="text-gray-700 text-sm sm:text-base">Awarded by Tech Innovators for outstanding performance and usability.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Top SaaS Startup 2020</h3>
              <p className="text-gray-700 text-sm sm:text-base">Recognized as one of the fastest growing SaaS platforms by Global Tech Awards.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Editor’s Choice</h3>
              <p className="text-gray-700 text-sm sm:text-base">Featured in major tech blogs for innovation and user experience.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Join Our Journey
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6">
            Whether you want to collaborate, provide feedback, or join our team,
            we’d love to hear from you. Let’s make document management effortless together!
          </p>
          <Link
            href="/contact"
            className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </section>
  );
}
