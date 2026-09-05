import { useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { Link } from "react-router";
import { authClient } from "../lib/auth-client.ts";
import Comments from "./Comments.tsx";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export default function CommentSection({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = authClient.useSession();
  const queryClient = useQueryClient();

  const handleCommentSubmit: SubmitEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();
    setFeedback(null);

    if (sessionError || !session) {
      setFeedback({
        type: "error",
        message: "Please sign in before joining the conversation.",
      });
      return;
    }

    if (!comment.trim()) {
      setFeedback({
        type: "error",
        message: "Write a comment before posting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        },
      );

      if (!res.ok) {
        // todo: refine ux
        throw new Error("Your comment could not be posted.");
      }

      const { message } = (await res.json()) as { message?: string };

      setComment("");
      setFeedback({
        type: "success",
        message: message ?? "Your comment has been posted.",
      });
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your comment could not be posted. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFeedback(null);
    setComment(e.target.value);
  };

  return (
    <section className="w-full py-10 sm:py-12" aria-labelledby="comments-title">
      <div className="mb-6">
        <h2
          id="comments-title"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Join the conversation
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Add your perspective or respond to what others shared.
        </p>
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="mb-8 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl shadow-black/15 sm:p-6"
      >
        {!isSessionPending && !session && (
          <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p>Sign in to add your voice.</p>
            <Link
              to="/"
              className="shrink-0 font-semibold underline decoration-amber-400 underline-offset-4 hover:decoration-amber-700"
            >
              Sign in
            </Link>
          </div>
        )}

        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Your comment
        </label>

        <textarea
          id="comment"
          name="comment"
          value={comment}
          rows={4}
          required
          disabled={isSessionPending || isSubmitting}
          aria-invalid={feedback?.type === "error" || undefined}
          placeholder="What would you add to this conversation?"
          onChange={handleChange}
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 leading-7 text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5" aria-live="polite">
            {feedback && (
              <p
                role={feedback.type === "error" ? "alert" : "status"}
                className={`text-sm font-medium ${
                  feedback.type === "success"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {feedback.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSessionPending || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <SpinnerIcon />}
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </form>

      <Comments postId={postId} />
    </section>
  );
}

function SpinnerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 animate-spin">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        className="opacity-75"
        d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
      />
    </svg>
  );
}
