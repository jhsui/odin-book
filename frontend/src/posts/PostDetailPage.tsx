import { Link, useLoaderData } from "react-router";
import CommentSection from "../comments/CommentSection.tsx";
import LikeButton from "./LikeButton.tsx";
import SwayHeader from "../layout/SwayHeader.tsx";
import formatDateTime from "../utils/formatDateTime.ts";
import { DeletePostButton } from "./DeletePostButton.tsx";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
};

export default function PostDetailPage() {
  const { post } = useLoaderData() as { post: Post };
  const createdAt = formatDateTime(post.createdAt);
  const authorInitial = post.author.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <SwayHeader />
        </div>

        <div className="mx-auto max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-400/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span>
            Back to feed
          </Link>

          <article className="mt-6 min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-black/25 sm:mt-8">
            <header className="border-b border-slate-200/70 bg-linear-to-br from-indigo-50/80 via-white to-white px-5 py-7 sm:px-10 sm:py-10">
              <div className="mb-5 flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase ring-1 ring-indigo-100">
                  Community post
                </span>
              </div>

              <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance wrap-anywhere text-slate-950 sm:text-5xl sm:leading-[1.1]">
                {post.title}
              </h1>

              <div className="mt-7 flex min-w-0 items-center gap-3">
                <Link
                  to={`/user-profile/${post.author.id}`}
                  aria-label={`View ${post.author.name}'s profile`}
                  className="shrink-0 rounded-2xl transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className="relative flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-base font-bold text-indigo-700 ring-1 ring-indigo-600/10 ring-inset"
                  >
                    {authorInitial}
                    {post.author.image && (
                      <img
                        key={post.author.image}
                        src={post.author.image}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </span>
                </Link>

                <div className="min-w-0">
                  <Link
                    to={`/user-profile/${post.author.id}`}
                    className="rounded-md text-sm font-semibold wrap-anywhere text-slate-900 transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {post.author.name}
                  </Link>
                  <time
                    dateTime={post.createdAt}
                    className="mt-1 block text-xs leading-5 text-slate-500"
                  >
                    Published {createdAt}
                  </time>
                </div>
              </div>
            </header>

            <div className="px-5 py-8 sm:px-10 sm:py-10">
              <p className="text-base leading-8 wrap-anywhere whitespace-pre-wrap text-slate-700 sm:text-lg sm:leading-9">
                {post.content}
              </p>
            </div>

            <footer className="flex flex-col gap-4 border-t border-slate-200/70 bg-slate-50/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <p className="text-sm text-slate-500">Do you like this post?</p>
              <div className="flex min-w-0 flex-wrap items-start gap-3">
                <LikeButton postId={post.id} />
                <DeletePostButton
                  postId={post.id}
                  authorId={post.author.id}
                  ifRedirect={true}
                />
              </div>
            </footer>
          </article>

          <CommentSection postId={post.id} />
        </div>
      </div>
    </main>
  );
}
