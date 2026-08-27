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
    isError,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(
        `http://localhost:3000/posts/${encodeURIComponent(postId)}/comments`,
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
      <p className="animate-pulse py-6 text-center text-sm text-slate-500">
        Loading comments...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error.message}
      </p>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <p className="leading-7 whitespace-pre-wrap text-slate-700">
            {comment.content}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
            <p className="font-semibold text-slate-900">
              {comment.author.name}
            </p>

            <time
              dateTime={comment.createdAt}
              className="shrink-0 text-slate-500"
            >
              {formatDateTime(comment.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
