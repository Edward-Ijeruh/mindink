import Link from "next/link";

const posts = [
  {
    slug: "my-first-post",
    title: "My First Blog Post",
    date: "May 19, 2025",
    excerpt: "Welcome to MindInk. This is where thoughts take shape...",
  },
  {
    slug: "nextjs-love-story",
    title: "Falling in Love with Next.js",
    date: "May 20, 2025",
    excerpt: "Next.js is the magic behind MindInk. Here’s why I chose it...",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8 pt-6">
      <h1 className="text-3xl font-bold mb-4">Recent Posts</h1>
      {posts.map((post) => (
        <div
          key={post.slug}
          className="bg-[var(--background)] border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg p-5 transition-colors"
        >
          <Link href={`/post/${post.slug}`}>
            <h2 className="text-2xl font-semibold text-blue-700 hover:underline">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {post.date}
          </p>
          <p className="text-[var(--foreground)] mt-3">{post.excerpt}</p>
          <Link
            href={`/post/${post.slug}`}
            className="text-blue-600 text-sm mt-2 inline-block hover:underline"
          >
            Read more →
          </Link>
        </div>
      ))}
    </div>
  );
}
