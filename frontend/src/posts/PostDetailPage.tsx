import { Link, useLoaderData } from "react-router";
import CommentSection from "../comments/CommentSection.tsx";
import LikeButton from "./LikeButton.tsx";
import PageShell from "../layout/PageShell.tsx";
import formatDateTime from "../utils/formatDateTime.ts";
import { DeletePostButton } from "./DeletePostButton.tsx";
import { PostImageGallery } from "./PostImageGallery.tsx";
import type { Post } from "./types.ts";

export default function PostDetailPage() {
  const { post } = useLoaderData() as { post: Post };

  const createdAt = formatDateTime(post.createdAt);
  const authorInitial = post.author.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="ui-link text-sm">
          <span aria-hidden="true">←</span> Back to Feed
        </Link>

        <article className="ui-card mt-7 min-w-0 overflow-hidden">
          <header className="px-5 pt-7 pb-6 sm:px-10 sm:pt-10 sm:pb-7">
            <div className="mb-6 flex items-center gap-2">
              <span className="ui-badge">Community post</span>
            </div>

            <h1 className="font-display text-ink text-4xl leading-[1.15] tracking-tight text-balance wrap-anywhere sm:text-5xl">
              {post.title}
            </h1>

            <div className="mt-7 flex min-w-0 items-center gap-3 border-b border-stone-200/80 pb-7">
              <Link
                to={`/user-profile/${post.author.id}`}
                aria-label={`View ${post.author.name}'s profile`}
                className="focus-visible:ring-brand-500 shrink-0 rounded-full transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="bg-brand-50 text-brand-700 ring-brand-600/10 relative flex size-11 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-1 ring-inset"
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
                  className="hover:text-brand-600 focus-visible:ring-brand-500 rounded-md text-sm font-semibold wrap-anywhere text-stone-900 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {post.author.name}
                </Link>
                <time
                  dateTime={post.createdAt}
                  className="mt-1 block text-xs leading-5 text-stone-500"
                >
                  Published {createdAt}
                </time>
              </div>
            </div>
          </header>

          <div className="px-5 pt-1 pb-9 sm:px-10 sm:pb-11">
            <PostImageGallery key={post.id} images={post.images} />

            <p className="text-base leading-8 wrap-anywhere whitespace-pre-wrap text-stone-700 sm:text-[1.0625rem] sm:leading-9">
              {post.content}
            </p>
          </div>

          <footer className="bg-canvas/50 flex flex-col gap-4 border-t border-stone-200/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="text-sm text-stone-500">
              A little appreciation goes a long way.
            </p>
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
    </PageShell>
  );
}
