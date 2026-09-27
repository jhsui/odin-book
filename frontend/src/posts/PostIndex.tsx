import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import PageShell, { PageHeading } from "../layout/PageShell.tsx";
import formatDateTime from "../utils/formatDateTime.ts";
import type { Post } from "./types.ts";

type PostListItem = Pick<Post, "id" | "title" | "createdAt"> & {
  author: Pick<Post["author"], "name">;
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
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/index`,
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
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <PageHeading
          eyebrow="Explore"
          title="The Sway archive"
          description="Browse every idea and story shared by the community."
        >
          {!isLoading && !isError && posts && (
            <p className="mt-4 text-sm text-slate-500 sm:mt-0 sm:pb-1">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          )}
        </PageHeading>

        {isLoading ? (
          <section className="space-y-4" aria-label="Loading posts">
            {[1, 2, 3].map((item) => (
              <div key={item} className="ui-card p-6 motion-safe:animate-pulse">
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="mt-5 h-4 w-48 rounded bg-slate-100" />
              </div>
            ))}
          </section>
        ) : isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
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
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load posts
            </h2>
            <p className="mt-2 text-sm text-rose-700">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="ui-button-secondary mt-5"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </section>
        ) : posts?.length ? (
          <ul className="space-y-4">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Link
                  to={`/posts/${post.id}`}
                  className="ui-card group flex items-start gap-4 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 sm:gap-6 sm:p-6"
                >
                  <span className="hidden min-w-10 pt-1 text-sm font-semibold text-slate-600 tabular-nums sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <article className="min-w-0 flex-1">
                    <h2 className="text-lg leading-7 font-semibold wrap-anywhere text-slate-900 transition group-hover:text-indigo-600 sm:text-xl">
                      {post.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                      <span>
                        By{" "}
                        <span className="font-medium text-slate-700">
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
                    className="mt-1 size-5 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-600"
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
          <section className="ui-empty">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 15.5 3h-11ZM6 6.75A.75.75 0 0 1 6.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 6.75Zm0 3.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Nothing published yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Be the first person to add something to the archive.
            </p>
            <Link to="/dashboard/writing" className="ui-button-primary mt-6">
              Write the first post
            </Link>
          </section>
        )}
      </div>
    </PageShell>
  );
}
