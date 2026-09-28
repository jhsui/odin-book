import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "../lib/auth-client.ts";
import PageShell, { PageHeading } from "../layout/PageShell.tsx";

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
    <PageShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7">
          <Link to="/dashboard" className="ui-link text-sm">
            <span aria-hidden="true">←</span> Back to Feed
          </Link>
        </div>
        <PageHeading
          eyebrow="Your next story"
          title="A thought worth sharing."
          description="An everyday discovery, a fresh perspective, a story only you can tell. Make a little space for it here."
        />

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <section className="ui-card min-w-0 p-5 sm:p-8">
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <label htmlFor="title" className="ui-label mb-0">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  placeholder="Start with a title…"
                  required
                  disabled={inputsDisabled}
                  aria-invalid={feedback?.type === "error" || undefined}
                  className="ui-input font-display bg-white py-4 text-2xl placeholder:text-xl sm:text-3xl"
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="content" className="ui-label mb-0">
                    Your post
                  </label>
                  <span className="text-xs text-stone-500">
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
                  className="ui-input min-h-72 resize-y bg-white p-4 text-base leading-8 sm:text-base"
                  onChange={handleChange}
                />
              </div>

              <div className="bg-canvas/60 min-w-0 rounded-2xl border border-dashed border-stone-300 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="post-images" className="ui-label mb-0">
                    Post images
                    <span className="ml-2 text-xs font-normal text-stone-500">
                      Optional
                    </span>
                  </label>
                  <span className="ui-badge">
                    {formData.images.length} / 4 selected
                  </span>
                </div>
                <p
                  id="post-images-help"
                  className="mt-2 text-xs leading-5 text-stone-500"
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
                  className="file:bg-brand-50 file:text-brand-700 hover:border-brand-300 hover:file:bg-brand-100 focus-visible:ring-brand-500 mt-4 block w-full min-w-0 cursor-pointer rounded-xl border border-stone-200 bg-white p-2 text-sm text-stone-500 transition file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:file:cursor-not-allowed"
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
                        className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-stone-200/80 bg-white p-3"
                      >
                        <span
                          aria-hidden="true"
                          className="bg-brand-50 text-brand-600 ring-brand-100 flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ring-1 ring-inset"
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 basis-24">
                          <p className="text-sm leading-5 font-medium wrap-anywhere text-stone-800">
                            {img.name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {(img.size / (1024 * 1024)).toFixed(2)} MiB
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={inputsDisabled}
                          aria-label={`Remove ${img.name}`}
                          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-3 text-xs font-medium text-stone-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="flex flex-col-reverse gap-4 border-t border-stone-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                  className="ui-button-primary"
                >
                  {isSubmitting && <SpinnerIcon />}
                  {isSubmitting ? "Publishing..." : "Publish post"}
                </button>
              </div>
            </form>
          </section>

          <aside className="px-1 py-3 lg:pt-6">
            <p className="text-brand-700 text-xs font-semibold tracking-[0.16em] uppercase">
              A few gentle prompts
            </p>
            <h2 className="font-display text-ink mt-3 text-2xl">
              Make it yours.
            </h2>
            <ul className="mt-5 space-y-5 text-sm leading-6 text-stone-600">
              <li className="flex gap-3 border-t border-stone-200 pt-4">
                <span
                  className="text-brand-600 text-xs leading-6"
                  aria-hidden="true"
                >
                  01
                </span>
                Start with one idea you keep coming back to.
              </li>
              <li className="flex gap-3 border-t border-stone-200 pt-4">
                <span
                  className="text-brand-600 text-xs leading-6"
                  aria-hidden="true"
                >
                  02
                </span>
                Let your title offer a glimpse of what's inside.
              </li>
              <li className="flex gap-3 border-t border-stone-200 pt-4">
                <span
                  className="text-brand-600 text-xs leading-6"
                  aria-hidden="true"
                >
                  03
                </span>
                Leave room for someone else's perspective.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </PageShell>
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
