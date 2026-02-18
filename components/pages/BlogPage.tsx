"use client";


export default function BlogPage() {
  const blogs = [
    {
      title: "Boost Your PDF Productivity",
      description:
        "Discover how QuickFixPdf can save you time and streamline your workflow. Learn about batch processing, document editing, and advanced features that enhance productivity across teams.",
      image: "/img/blog1.png",
    },
    {
      title: "Secure Document Management",
      description:
        "Security is our top priority. Understand how QuickFixPdf ensures your documents remain private with advanced encryption and secure cloud processing.",
      image: "/img/blog2.png",
    },
    {
      title: "Top 10 PDF Editing Tips",
      description:
        "Maximize your efficiency with these 10 essential tips for editing PDFs. From merging and splitting to annotation and signing, improve your workflow instantly.",
      image: "/img/blog3.jpg",
    },
    {
      title: "Collaborate Seamlessly with Teams",
      description:
        "QuickFixPdf makes teamwork effortless. Learn how to share templates, watermarks, and actions with your team to boost productivity and consistency.",
      image: "/img/blog4.png",
    },
    {
      title: "Mobile PDF Management",
      description:
        "Manage PDFs on the go with iLovePDF Mobile. Explore features and tips for editing, converting, and compressing documents on your smartphone.",
      image: "/img/blog5.png",
    },
    {
      title: "Why Batch Processing Matters",
      description:
        "Save hours with batch processing. Learn why handling multiple PDFs at once is a game-changer for both individuals and businesses.",
      image: "/img/blog6.png",
    },
  ];

  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-12 text-center">
          Our <span className="text-orange-500">Blog</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full  ">
                {/* <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                /> */}
                <img src={blog.image} className="w-full" alt="" />
              </div>

              {/* Text */}
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {blog.title}
                </h2>
                <p className="text-gray-700 text-sm sm:text-base line-clamp-5 flex-1">
                  {blog.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
