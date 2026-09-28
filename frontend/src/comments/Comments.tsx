import { useQuery } from "@tanstack/react-query";
import formatDateTime from "../utils/formatDateTime";
import { Link } from "react-router";
import DeleteCommentButton from "./DeleteCommentButton.tsx";

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    isAnonymous: boolean;
  };
};

export default function Comments({ postId }: { postId: string }) {
  const {
    data: comments = [],
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${encodeURIComponent(postId)}/comments`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch comments.");
      }

      const { comments }: { comments: Comment[] } = await res.json();
      return comments;
    },
  });

  if (isPending) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading comments">
        <span className="sr-only">Loading comments…</span>
        {[1, 2].map((item) => (
          <div
            key={item}
            aria-hidden="true"
            className="ui-card p-5 motion-safe:animate-pulse sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 shrink-0 rounded-full bg-stone-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-28 max-w-full rounded bg-stone-200" />
                <div className="h-3 w-40 max-w-full rounded bg-stone-100" />
              </div>
            </div>
            <div className="mt-4 space-y-2.5 sm:ml-14">
              <div className="h-3.5 w-full rounded bg-stone-100" />
              <div className="h-3.5 w-2/3 rounded bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"
      >
        <p className="text-sm font-medium text-rose-700">{error.message}</p>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="ui-button-secondary mt-4"
        >
          {isFetching ? "Trying again..." : "Try again"}
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="ui-empty">
        <span className="bg-brand-50 text-brand-600 ring-brand-100 mx-auto flex size-11 items-center justify-center rounded-2xl ring-1">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0-7.16-4.42L1.3 16.67a.75.75 0 0 0 1.01 1.01l3.09-1.54A7.96 7.96 0 0 0 10 18ZM6.5 9.25a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <p className="mt-4 text-sm font-semibold text-stone-900">
          No comments yet
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Be the first person to add to the conversation.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="ui-card divide-y divide-stone-200/70 overflow-hidden"
      aria-label="Comments"
    >
      {comments.map((comment) => {
        const authorDetails = (
          <>
            <span
              aria-hidden="true"
              className="bg-brand-50 text-brand-700 ring-brand-600/10 relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-1 ring-inset"
            >
              {comment.author.name.trim().charAt(0).toUpperCase() || "?"}
              {comment.author.image && (
                <img
                  src={comment.author.image}
                  alt={`${comment.author.name}'s avatar`}
                  // Wait until the image is near the visible part of the page before loading it.
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="group-hover:text-brand-600 block text-sm font-semibold wrap-anywhere text-stone-900 transition">
                {comment.author.name}
              </span>

              <time
                dateTime={comment.createdAt}
                className="mt-1 block text-xs leading-5 text-stone-500"
              >
                {formatDateTime(comment.createdAt)}
              </time>
            </span>
          </>
        );

        return (
          <li key={comment.id}>
            <article className="min-w-0 p-5 sm:p-6">
              <header>
                {comment.author.isAnonymous ? (
                  <div className="flex items-center gap-3">{authorDetails}</div>
                ) : (
                  <Link
                    to={`/user-profile/${comment.author.id}`}
                    className="group focus-visible:ring-brand-500 flex w-fit max-w-full items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
                  >
                    {authorDetails}
                  </Link>
                )}
              </header>

              <p className="mt-3 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-stone-600 sm:ml-14 sm:text-[0.9375rem]">
                {comment.content}
              </p>

              <div className="sm:ml-14">
                <DeleteCommentButton
                  commentId={comment.id}
                  authorId={comment.author.id}
                />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
