import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { Link } from "react-router";
import { authClient } from "./lib/auth-client.ts";
import SwayHeader from "./partials/SwayHeader.tsx";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export default function Writing() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = authClient.useSession();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFeedback(null);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (sessionError || !session) {
      setFeedback({
        type: "error",
        message: "Please sign in before publishing a post.",
      });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setFeedback({
        type: "error",
        message: "Add both a title and some content before publishing.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        throw new Error(data.message ?? `Request failed: ${res.status}`);
      }

      setFormData({ title: "", content: "" });
      setFeedback({
        type: "success",
        message: data.message ?? "Your post has been published.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your post could not be published. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputsDisabled = isSubmitting || isSessionPending;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>

        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-400 transition hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span>
            Back to feed
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Write something worth sharing
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Start with one clear idea. You can keep it short, tell a story, or
            share what you have learned.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <section className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
            {!isSessionPending && !session && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                <p>Sign in to publish your writing.</p>
                <Link
                  to="/"
                  className="shrink-0 font-semibold text-amber-900 underline decoration-amber-400 underline-offset-4 hover:decoration-amber-700"
                >
                  Go to sign in
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  placeholder="Give your idea a clear title"
                  required
                  disabled={inputsDisabled}
                  aria-invalid={feedback?.type === "error" || undefined}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="content"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Your post
                  </label>
                  <span className="text-xs text-slate-400">
                    {formData.content.length.toLocaleString()} characters
                  </span>
                </div>
                <textarea
                  name="content"
                  id="content"
                  value={formData.content}
                  rows={12}
                  placeholder="Share a thought, a story, or something you learned..."
                  required
                  disabled={inputsDisabled}
                  aria-invalid={feedback?.type === "error" || undefined}
                  className="resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 leading-7 text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col-reverse gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-6" aria-live="polite">
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
                  disabled={inputsDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <SpinnerIcon />}
                  {isSubmitting ? "Publishing..." : "Publish post"}
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">A strong post</p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-400">
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                Focuses on one useful idea.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                Uses a title that sets clear expectations.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                Invites others into the conversation.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
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
