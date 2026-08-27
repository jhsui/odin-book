import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { authClient } from "./lib/auth-client.ts";
import Comments from "./partials/Comments.tsx";

export default function CommentSection({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const { data: session, error } = authClient.useSession();

  const handleCommentSubmit: SubmitEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();

    if (error || !session) {
      alert("Something went wrong, please try to sign in or sign up.");
      return;
    }

    if (!comment.trim()) {
      alert("Comment can not be empty.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/posts/${encodeURIComponent(postId)}/comments`,
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
        throw new Error("Comment submission failed.");
      }

      const { message } = await res.json();

      setMessage(message);
      setComment("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setComment(e.target.value);

  return (
    <section className="mx-auto w-full max-w-3xl py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Comments
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Join the conversation and share your thoughts.
        </p>
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Add a comment
        </label>

        <textarea
          id="comment"
          name="comment"
          value={comment}
          rows={4}
          placeholder="What are your thoughts?"
          onChange={handleChange}
          className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {message ? (
            <p className="text-sm font-medium text-emerald-600">{message}</p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none active:scale-[0.98]"
          >
            Post comment
          </button>
        </div>
      </form>

      <Comments postId={postId} />
    </section>
  );
}
