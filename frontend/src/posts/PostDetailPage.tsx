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
        <div className="mb-12">
          <SwayHeader />
        </div>

        <div className="mx-auto max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-400 transition hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span>
            Back to feed
          </Link>

          <article className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-black/25">
            <header className="border-b border-slate-100 px-5 py-8 sm:px-10 sm:py-10">
              <div className="mb-5 flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase ring-1 ring-indigo-100">
                  Community post
                </span>
              </div>

              <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance text-slate-950 sm:text-5xl sm:leading-[1.1]">
                {post.title}
              </h1>

              <div className="mt-7 flex items-center gap-3">
                <Link to={`/user-profile/${post.author.id}`}>
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
                    {authorInitial}
                  </span>
                  {/* todo: cover the initial if applicable */}
                  {post.author.image && (
                    <img
                      src={post.author.image}
                      alt={`${post.author.name}'s avatar`}
                    />
                  )}
                  <p className="text-sm font-semibold text-slate-900">
                    {post.author.name}
                  </p>
                </Link>

                <div>
                  <time
                    dateTime={post.createdAt}
                    className="mt-0.5 block text-xs text-slate-500"
                  >
                    Published {createdAt}
                  </time>
                </div>
              </div>
            </header>

            <div className="px-5 py-9 sm:px-10 sm:py-12">
              <p className="text-lg leading-8 wrap-break-word whitespace-pre-wrap text-slate-700 sm:text-xl sm:leading-9">
                {post.content}
              </p>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-10">
              <p className="text-sm text-slate-500">Was this worth sharing?</p>
              <LikeButton postId={post.id} />
              <DeletePostButton
                postId={post.id}
                authorId={post.author.id}
                ifRedirect={true}
              />
            </footer>
          </article>

          <CommentSection postId={post.id} />
        </div>
      </div>
    </main>
  );
}
