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
      className="ui-card hover:border-brand-200 min-w-0 p-5 transition-colors sm:p-6"
    >
      <header className="mb-4 flex min-w-0 items-center gap-3">
        <Link
          to={`/user-profile/${post.author.id}`}
          aria-label={`View ${post.author.name}'s profile`}
          className="focus-visible:outline-brand-500 shrink-0 rounded-full transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className="bg-brand-100 text-brand-700 ring-brand-600/10 relative flex size-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold ring-1 ring-inset"
          >
            {authorInitial}
            {post.author.image && (
              <img
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
            className="hover:text-brand-600 focus-visible:outline-brand-600 rounded-md text-sm font-semibold wrap-anywhere text-stone-900 transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {post.author.name}
          </Link>
          <time
            dateTime={post.createdAt}
            className="mt-1 block text-xs leading-4 text-stone-500"
          >
            {formatDateTime(post.createdAt)}
          </time>
        </div>
      </header>

      <h2
        id={`post-title-${post.id}`}
        className="font-display text-ink text-[1.65rem] leading-snug tracking-tight wrap-anywhere sm:text-[1.8rem]"
      >
        <Link
          to={postUrl}
          className="hover:text-brand-600 focus-visible:outline-brand-500 rounded-sm transition focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {post.title}
        </Link>
      </h2>

      <Link
        to={postUrl}
        aria-label={`Read post: ${post.title}`}
        className="focus-visible:outline-brand-600 block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {post.images.length <= 0 && (
          <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-7 wrap-anywhere whitespace-pre-wrap text-stone-600">
            {post.content}
          </p>
        )}
        <div className="text-brand-600 hover:text-brand-700 mt-2 inline-flex min-h-10 items-center gap-2 text-xs font-semibold transition">
          Read more <span aria-hidden="true">→</span>
        </div>
      </Link>

      {post.images.length > 0 && (
        <div className="mt-2 [&_img.relative]:h-64 sm:[&_img.relative]:h-96 [&>div]:mb-0 [&>div]:rounded-xl">
          <PostImageGallery key={post.id} images={post.images} />
        </div>
      )}

      <footer className="mt-5 flex min-w-0 flex-wrap items-start gap-2 border-t border-stone-100 pt-3">
        <LikeButton postId={post.id} />
        {/* todo: locate comment section */}
        <Link
          to={postUrl}
          aria-label={`View comments on ${post.title}`}
          className="ui-button-secondary border-transparent bg-stone-50 px-3 text-xs"
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
          Comments <span>{post._count.comments}</span>
        </Link>
      </footer>
    </article>
  );
}
