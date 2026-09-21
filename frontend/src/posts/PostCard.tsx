import { Link } from "react-router";
import formatDateTime from "../utils/formatDateTime.ts";
import LikeButton from "./LikeButton.tsx";
import { PostImageGallery } from "./PostImageGallery.tsx";
import type { PostDash } from "./types.ts";

export default function PostCard({ post }: { post: PostDash }) {
  const postUrl = `/posts/${post.id}`;
  const authorInitial = post.author.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <article
      aria-labelledby={`post-title-${post.id}`}
      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 transition-colors hover:border-slate-300 sm:p-5"
    >
      <header className="mb-3 flex min-w-0 items-center gap-2.5">
        <Link
          to={`/user-profile/${post.author.id}`}
          aria-label={`View ${post.author.name}'s profile`}
          className="shrink-0 rounded-full transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
        >
          <span
            aria-hidden="true"
            className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-600/10 ring-inset"
          >
            {authorInitial}
            {post.author.image && (
              <img
                key={post.author.image}
                src={post.author.image}
                alt=""
                loading="lazy"
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
            className="rounded-sm text-xs font-semibold wrap-anywhere text-slate-800 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:text-sm"
          >
            {post.author.name}
          </Link>
          <time
            dateTime={post.createdAt}
            className="mt-0.5 block text-xs leading-4 text-slate-500"
          >
            {formatDateTime(post.createdAt)}
          </time>
        </div>
      </header>

      <h2
        id={`post-title-${post.id}`}
        className="text-lg leading-snug font-bold tracking-tight wrap-anywhere text-slate-950 sm:text-xl"
      >
        <Link
          to={postUrl}
          className="rounded-sm transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500"
        >
          {post.title}
        </Link>
      </h2>

      <Link to={postUrl} aria-label={`Read post: ${post.title}`}>
        {/* todo: cut the content */}
        {post.images.length <= 0 && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 wrap-anywhere whitespace-pre-wrap text-slate-600">
            {post.content}
          </p>
        )}
        <div className="mt-1 inline-flex min-h-9 items-center gap-1 rounded-md text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          Read more <span aria-hidden="true">→</span>
        </div>
      </Link>

      {post.images.length > 0 && (
        <div className="mt-2 [&_img.relative]:h-64 sm:[&_img.relative]:h-96 [&>div]:mb-0 [&>div]:rounded-xl">
          <PostImageGallery key={post.id} images={post.images} />
        </div>
      )}

      <footer className="mt-4 flex min-w-0 flex-wrap items-start gap-2">
        <LikeButton postId={post.id} />
        <Link
          to={postUrl}
          aria-label={`View comments on ${post.title}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0"
          >
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>
          Comments <span>{post.comments?.length}</span>
        </Link>
      </footer>
    </article>
  );
}
