import Image from "next/image";
import Link from "next/link";
import {
  blogPosts,
  blogReadingMinutes,
  type BlogPost,
} from "@/config/blogPosts";

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col hover:border-orange-200 hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`} className="group flex flex-col flex-1">
        <div className="relative w-full h-48 bg-orange-50">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <p className="text-sm text-gray-500 mb-2">
            <time dateTime={post.published}>{formatDate(post.published)}</time>
            <span aria-hidden="true"> · </span>
            {blogReadingMinutes(post)} min read
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600">
            {post.title}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base flex-1">
            {post.description}
          </p>
          <span className="mt-4 text-sm font-semibold text-orange-600">
            Read the guide
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
          Our <span className="text-orange-500">Blog</span>
        </h1>
        <p className="text-gray-700 text-base sm:text-lg text-center max-w-3xl mx-auto mb-12">
          Practical guides for merging, compressing, converting, splitting, and
          sharing PDFs. The tools they describe run in your browser, and each
          guide includes the limits of that approach so you can decide what to
          send.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
