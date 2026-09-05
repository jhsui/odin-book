import { useQuery } from "@tanstack/react-query";
import formatDateTime from "../utils/formatDateTime";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
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
      <div className="space-y-4" aria-label="Loading comments">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="mt-3 h-4 w-2/3 rounded bg-white/5" />
            <div className="mt-5 h-3 w-40 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-center">
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
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-2xl border border-white/10 bg-white p-5 text-slate-900 shadow-lg shadow-black/10 sm:p-6"
        >
          <p className="leading-7 wrap-break-word whitespace-pre-wrap text-slate-700">
            {comment.content}
          </p>

          <div className="mt-5 flex flex-col gap-1 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                {comment.author.name.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <p className="font-semibold text-slate-900">
                {comment.author.name}
              </p>
            </div>

            <time
              dateTime={comment.createdAt}
              className="shrink-0 pl-9 text-xs text-slate-500 sm:pl-0"
            >
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
