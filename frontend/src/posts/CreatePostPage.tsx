import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "../lib/auth-client.ts";
import SwayHeader from "../layout/SwayHeader.tsx";

const MAX_POST_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MiB

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

type PostFormData = {
  title: string;
  content: string;
  images: File[];
};

export default function CreatePostPage() {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    images: [],
  });

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: session,
    error: sessionError,
    isPending: isSessionPending,
  } = authClient.useSession();

  const navigate = useNavigate();

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
      const body = new FormData();

      body.append("title", formData.title);
      body.append("content", formData.content);
      for (const image of formData.images) {
        body.append("images", image);
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, {
        method: "POST",
        credentials: "include",
        body,
      });

      const data = (await res.json()) as {
        postId: string;
        message: string;
      };

      if (!res.ok) {
        throw new Error(data.message ?? `Request failed: ${res.status}`);
      }

      setFormData({
        title: "",
        content: "",
        images: [],
      });

      setFeedback({
        type: "success",
        message: data.message ?? "Your post has been published.",
      });

      navigate(`/posts/${data.postId}`);
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
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-400/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span>
            Back to Feed
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
          <section className="min-w-0 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
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

              <div className="min-w-0 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="post-images"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Post images
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      Optional
                    </span>
                  </label>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
                    {formData.images.length} / 4 selected
                  </span>
                </div>
                <p
                  id="post-images-help"
                  className="mt-2 text-xs leading-5 text-slate-500"
                >
                  You can add up to 4 images. JPEG, PNG or WebP, up to 5 MiB
                  each.
                </p>
                <input
                  id="post-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={inputsDisabled}
                  aria-describedby="post-images-help"
                  className="mt-4 block w-full min-w-0 cursor-pointer rounded-xl border border-indigo-100 bg-white p-2 text-sm text-slate-500 shadow-sm transition file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white file:transition hover:border-indigo-300 hover:file:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:file:cursor-not-allowed"
                  onChange={(event) => {
                    const input = event.currentTarget;
                    const images = Array.from(input.files ?? []);

                    const hasOverSizedImage = images.some(
                      (image) => image.size > MAX_POST_IMAGE_SIZE,
                    );

                    if (hasOverSizedImage) {
                      input.value = "";

                      setFeedback({
                        type: "error",
                        message: "Each image can not be larger than 5 MiB.",
                      });
                      return;
                    }

                    if (formData.images.length + images.length > 4) {
                      input.value = "";

                      setFeedback({
                        type: "error",
                        message: "You can only upload 4 images at maximum.",
                      });
                      return;
                    }

                    setFeedback(null);
                    setFormData((prev) => ({
                      ...prev,
                      images: [...prev.images, ...images],
                    }));
                    // todo: ?
                    input.value = "";
                  }}
                />
                {formData.images.length > 0 && (
                  <ul aria-label="Selected images" className="mt-4 space-y-2">
                    {formData.images.map((img, index) => (
                      <li
                        key={img.name}
                        className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100 ring-inset"
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 basis-24">
                          <p className="text-sm leading-5 font-medium wrap-anywhere text-slate-800">
                            {img.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {(img.size / (1024 * 1024)).toFixed(2)} MiB
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={inputsDisabled}
                          aria-label={`Remove ${img.name}`}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((i) => i !== img),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col-reverse gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-6 min-w-0 flex-1" aria-live="polite">
                  {feedback && (
                    <p
                      role={feedback.type === "error" ? "alert" : "status"}
                      className={`rounded-xl border px-3.5 py-3 text-sm leading-6 font-medium wrap-anywhere ${
                        feedback.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
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
