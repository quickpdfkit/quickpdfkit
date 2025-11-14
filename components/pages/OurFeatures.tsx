"use client";

import Image from "next/image";

export default function OurFeatures() {
  const features = [
    {
      title: (
        <>
          Our <span className="text-orange-500">features</span>
        </>
      ),
      description:
        "Not so computer-savvy? No problem. Even if it’s your first time using iLovePDF, we made it extremely simple. Our interface is user friendly. Our tools know how to do their job. So you shouldn’t encounter any setbacks.",
      image: "/img/feature1.svg",
      imageAlt: "Fast processing",
    },
    {
      title: (
        <>
          Enjoy a wiser <span className="text-orange-500">use of time</span>  
        </>
      ),
      description:
        "We’ve built a complete suite of powerful tools designed to streamline your document workflow. Save valuable time by batch-editing your files instead of handling them one by one. Our high-speed processing ensures your documents are ready in no time—just make sure your internet connection keeps up! Take control of your files with ease. Organize them alphabetically or in reverse order. Forgot a file? Add more, remove some, or rotate them as needed.",
      image: "/img/feature2.svg",
      imageAlt: "Secure and private",
    },
    {
      title: (
        <>
          Get <span className="text-orange-500">even more</span> 
        </>
      ),
      description:
        "Sometimes, a little extra makes all the difference. Upgrade your iLovePDF experience to boost your document productivity—manage your own team and share default actions, add watermarks with your corporate logo, or customize page number formats. Take our tools to the next level by processing larger files, handling more documents at once, and enjoying an ad-free workspace with unlimited access to all our services.",
      image: "/img/feature3.png",
      imageAlt: "All tools in one",
    },
  ];

  return (
    <section className="py-32 px-4  bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-24">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Text */}
            <div className="md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-lg sm:text-xl">{feature.description}</p>
            </div>

            {/* Image */}
            <div className="md:w-1/2 relative w-full h-64 sm:h-80 md:h-96">
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
