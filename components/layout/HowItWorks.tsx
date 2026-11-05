"use client";

import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function HowItWorksBlock() {
  const { dictionary } = useI18n();
  const copy = dictionary.howItWorks;
  return (
    <>
    <section className="py-20 bg-white px-4 ">
      <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-orange-50 via-white to-gray-50 rounded-3xl p-12 shadow-md sm:p-16">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
          {copy.titleLead} <span className="text-orange-500">{copy.titleAccent}</span>
        </h2>
        <p className="text-gray-700 text-lg sm:text-xl mb-10 text-center">
          {copy.subtitle}
        </p>

        {/* Content Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {copy.steps.map((step) => (
            <div key={step.name} className="bg-orange-50 p-6 rounded-xl text-center">
              <div className="text-orange-500 font-bold text-2xl mb-3">{step.positionLabel}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.name}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

     <div className="flex flex-col bg-white justify-center items-center text-center py-24">
      <h3 className="text-black text-4xl sm:text-4xl font-bold mb-5">
        {copy.trustedTitle}
      </h3>
      <p className="text-gray-700 text-sm  sm:text-lg md:w-4xl">
        {copy.trustedText}
      </p>
      <div className="flex justify-between md:w-lg gap-6 mt-10">
        <Image
          src="/img/iso.svg"
          alt="ISO"
          width={64}
          height={40}
          className="object-contain"
        />
        <Image
          src="/img/ssl.svg"
          alt="SSL"
          width={64}
          height={40}
          className="object-contain"
        />
        <Image
          src="/img/pdf.svg"
          alt="PDF"
          width={64}
          height={40}
          className="object-contain"
        />
      </div>
    </div>
    </>
  );
}
