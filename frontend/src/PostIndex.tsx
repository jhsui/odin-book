import { useQuery } from "@tanstack/react-query";
import formatDateTime from "./utils/formatDateTime.ts";

type PostListItem = {
  id: string;
  title: string;
  createdAt: string;
  author: {
    name: string;
  };
};

export default function PostIndex() {
  const {
    data: posts,
    isError,
    isLoading,
    error,
  } = useQuery<PostListItem[]>({
    queryKey: ["post-index"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/posts/index");

      if (!res.ok) {
        throw new Error("Failed to get post index");
      }

      const { posts } = (await res.json()) as {
        posts: PostListItem[];
      };

      return posts;
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
          <span>Loading posts...</span>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-300">
            Unable to load posts
          </h1>

          <p className="mt-2 text-sm text-red-200/70">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold tracking-widest text-indigo-400 uppercase">
            Odin Book
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Post Index
          </h1>

          <p className="mt-3 text-slate-400">
            Browse all the posts from the community.
          </p>
        </header>

        {posts?.length ? (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-slate-900"
              >
                <article>
                  <h2 className="text-xl font-semibold text-slate-100 transition group-hover:text-indigo-300">
                    {post.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
                    <span>
                      By{" "}
                      <span className="font-medium text-slate-300">
                        {post.author.name}
                      </span>
                    </span>

                    <span aria-hidden="true">•</span>

                    <time dateTime={post.createdAt}>
                      {formatDateTime(post.createdAt)}
                    </time>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
            <h2 className="text-lg font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              New posts will appear here when they are published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
