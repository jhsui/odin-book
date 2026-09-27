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
        <Link to="/dashboard" className="ui-button-secondary">
          <span aria-hidden="true">←</span>
          Back to Feed
        </Link>

        <article className="ui-card mt-6 min-w-0 overflow-hidden">
          <header className="border-b border-slate-200 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-5 flex items-center gap-2">
              <span className="ui-badge">Community post</span>
            </div>

            <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance wrap-anywhere text-slate-900 sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-7 flex min-w-0 items-center gap-3">
              <Link
                to={`/user-profile/${post.author.id}`}
                aria-label={`View ${post.author.name}'s profile`}
                className="shrink-0 rounded-full transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-base font-bold text-indigo-700 ring-1 ring-indigo-600/10 ring-inset"
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

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <PostImageGallery key={post.id} images={post.images} />

            <p className="text-base leading-8 wrap-anywhere whitespace-pre-wrap text-slate-700 sm:text-lg sm:leading-9">
              {post.content}
            </p>
          </div>

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
    </PageShell>
  );
}
