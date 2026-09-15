import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import SwayHeader from "../layout/SwayHeader.tsx";
import formatDateTime from "../utils/formatDateTime.ts";

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
    isFetching,
    error,
    refetch,
  } = useQuery<PostListItem[]>({
    queryKey: ["post-index"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/index`,
      );

      if (!res.ok) {
        throw new Error("Failed to get post index");
      }

      const { posts } = (await res.json()) as {
        posts: PostListItem[];
      };

      return posts;
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>

        <header className="mb-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold tracking-wider text-violet-300 uppercase">
              Explore
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The Sway archive
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Browse every idea and story shared by the community.
            </p>
          </div>

          {!isLoading && !isError && posts && (
            <p className="mt-4 text-sm text-slate-500 sm:mt-0 sm:pb-1">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          )}
        </header>

        {isLoading ? (
          <section className="space-y-4" aria-label="Loading posts">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="h-6 w-2/3 rounded bg-white/10" />
                <div className="mt-5 h-4 w-48 rounded bg-white/5" />
              </div>
            ))}
          </section>
        ) : isError ? (
          <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300 ring-1 ring-red-400/20">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.88c.674 1.167-.168 2.625-1.515 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.88ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold text-white">
              Unable to load posts
            </h2>
            <p className="mt-2 text-sm text-red-200/70">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </section>
        ) : posts?.length ? (
          <ul className="space-y-4">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link
                  to={`/dashboard/posts/${post.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none sm:gap-6 sm:p-6"
                >
                  <span className="hidden min-w-10 pt-1 text-sm font-semibold text-slate-600 tabular-nums sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <article className="min-w-0 flex-1">
                    <h2 className="text-lg leading-7 font-semibold text-white transition group-hover:text-indigo-300 sm:text-xl">
                      {post.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
                      <span>
                        By{" "}
                        <span className="font-medium text-slate-300">
                          {post.author.name}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        •
                      </span>
                      <time dateTime={post.createdAt}>
                        {formatDateTime(post.createdAt)}
                      </time>
                    </div>
                  </article>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-1 size-5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-300"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <section className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 15.5 3h-11ZM6 6.75A.75.75 0 0 1 6.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 6.75Zm0 3.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold text-white">
              Nothing published yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Be the first person to add something to the archive.
            </p>
            <Link
              to="/dashboard/writing"
              className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
            >
              Write the first post
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
