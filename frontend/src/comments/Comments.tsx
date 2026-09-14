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
        `${import.meta.env.VITE_BACKEND_URL}/posts/${encodeURIComponent(postId)}/comments`,
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
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-black/10 motion-safe:animate-pulse sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="size-11 shrink-0 rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-28 max-w-full rounded bg-slate-200" />
                <div className="h-3 w-40 max-w-full rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-4 space-y-2.5 sm:ml-14">
              <div className="h-3.5 w-full rounded bg-slate-100" />
              <div className="h-3.5 w-2/3 rounded bg-slate-100" />
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
        className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-center"
      >
        <p className="text-sm font-medium text-red-200">{error.message}</p>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none disabled:opacity-60"
        >
          {isFetching ? "Trying again..." : "Try again"}
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20">
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
        <p className="mt-4 text-sm font-medium text-slate-300">
          No comments yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Be the first person to add to the conversation.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" aria-label="Comments">
      {comments.map((comment) => {
        const authorDetails = (
          <>
            <span
              aria-hidden="true"
              className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 text-sm font-bold text-indigo-600 ring-1 ring-indigo-600/10 ring-inset"
            >
              {comment.author.name.trim().charAt(0).toUpperCase() || "?"}
              {comment.author.image && (
                <img
                  key={comment.author.image}
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
              <span className="block text-sm font-semibold wrap-anywhere text-slate-950 transition group-hover:text-indigo-600">
                {comment.author.name}
              </span>

              <time
                dateTime={comment.createdAt}
                className="mt-1 block text-xs leading-5 text-slate-500"
              >
                {formatDateTime(comment.createdAt)}
              </time>
            </span>
          </>
        );

        return (
          <li key={comment.id}>
            <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-900 shadow-lg shadow-black/10 sm:p-6">
              <header>
                {comment.author.isAnonymous ? (
                  <div className="flex items-center gap-3">{authorDetails}</div>
                ) : (
                  <Link
                    to={`/user-profile/${comment.author.id}`}
                    className="group flex w-fit max-w-full items-center gap-3 rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:outline-none"
                  >
                    {authorDetails}
                  </Link>
                )}
              </header>

              <p className="mt-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-700 sm:ml-14 sm:text-base">
                {comment.content}
              </p>
              <DeleteCommentButton
                commentId={comment.id}
                authorId={comment.author.id}
              />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
