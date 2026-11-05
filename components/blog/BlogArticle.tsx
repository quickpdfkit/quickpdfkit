import Image from "next/image";
import Link from "next/link";
import {
  blogPosts,
  blogReadingMinutes,
  type BlogBlock,
  type BlogPost,
  type InlinePart,
} from "@/config/blogPosts";

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function RichText({ parts }: { parts: InlinePart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <Link
            key={index}
            href={part.href}
            className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700"
          >
            {part.label}
          </Link>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
        {block.text}
      </h2>
    );
  }

  if (block.type === "p") {
    return (
      <p className="text-gray-700 text-base leading-7 mb-4">
        <RichText parts={block.parts} />
      </p>
    );
  }

  const ListTag = block.type === "ol" ? "ol" : "ul";
  const listClass =
    block.type === "ol"
      ? "list-decimal pl-6 space-y-3 text-gray-700 text-base leading-7 mb-4"
      : "list-disc pl-6 space-y-3 text-gray-700 text-base leading-7 mb-4";

  return (
    <ListTag className={listClass}>
      {block.items.map((item, index) => (
        <li key={index}>
          <RichText parts={item} />
        </li>
      ))}
    </ListTag>
  );
}

export default function BlogArticle({ post }: { post: BlogPost }) {
  const others = blogPosts.filter((item) => item.slug !== post.slug);

  return (
    <section className="py-32 px-4 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      <article className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/blog" className="hover:text-orange-600">
            Blog
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <p className="text-gray-700 text-lg leading-8 mb-4">{post.description}</p>
          <p className="text-sm text-gray-500">
            <time dateTime={post.published}>{formatDate(post.published)}</time>
            <span aria-hidden="true"> · </span>
            {blogReadingMinutes(post)} min read
            <span aria-hidden="true"> · </span>
            <Link href="/about" className="hover:text-orange-600">
              QuickPDFKit
            </Link>
          </p>
        </header>

        <Image
          src={post.image}
          alt={post.imageAlt}
          width={800}
          height={450}
          className="w-full h-auto rounded-xl border border-gray-200 bg-orange-50 mb-8"
          unoptimized
        />

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
          {post.blocks.map((block, index) => (
            <Block key={`${block.type}-${index}`} block={block} />
          ))}

          <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
            Tools for this guide
          </h2>
          <ul className="space-y-4">
            {post.tools.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
                >
                  {tool.label}
                </Link>
                <p className="text-gray-700 text-base leading-7 mt-1">
                  {tool.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            More from the blog
          </h2>
          <ul className="grid gap-4">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="block bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:border-orange-200"
                >
                  <span className="font-semibold text-gray-900">{item.title}</span>
                  <span className="block text-sm text-gray-600 mt-1">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>
    </section>
  );
}
