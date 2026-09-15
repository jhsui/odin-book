import { useState, type SubmitEventHandler } from "react";
import type { User } from "./types.ts";
import { useRevalidator } from "react-router";

const MAX_INTRO_LENGTH = 1000;

export default function MyUserIntro({ user }: { user: User }) {
  const [showIntroInput, setShowIntroInput] = useState(false);
  const [intro, setIntro] = useState(user.intro ?? "");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const revalidator = useRevalidator();

  const handleIntroSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (isSaving) return;
    setError("");

    if (intro.length > MAX_INTRO_LENGTH) {
      setError("Intro cannot exceed 1,000 characters.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me/intro`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intro }),
        },
      );

      if (!res.ok) {
        const data = (await res
          .json()
          // If reading the response as JSON fails, use null instead.
          .catch(() => null)) as {
          message?: string;
          errors?: { msg?: string }[];
        } | null;

        throw new Error(
          res.status === 413
            ? "Intro is too large. Use 1,000 characters or fewer."
            : (data?.errors?.[0]?.msg ??
                data?.message ??
                "Failed to update intro. Please try again."),
        );
      }

      await revalidator.revalidate();

      setShowIntroInput(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update intro. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-400">
        {user.intro || "You haven't added an intro yet."}
      </p>

      <button
        type="button"
        hidden={showIntroInput}
        className="mt-3 rounded-lg text-sm font-medium text-indigo-300 transition hover:text-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
        onClick={() => {
          setIntro(user.intro ?? "");
          setError("");
          setShowIntroInput(true);
        }}
      >
        {user.intro ? "Edit Intro" : "Add an introduction"}
      </button>

      {showIntroInput && (
        <form onSubmit={handleIntroSubmit} className="mt-4 space-y-3">
          <label
            htmlFor="intro"
            className="block text-sm font-medium text-slate-300"
          >
            Introduction
          </label>

          <textarea
            id="intro"
            name="intro"
            rows={4}
            maxLength={MAX_INTRO_LENGTH}
            disabled={isSaving}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "intro-help intro-error" : "intro-help"}
            className="block w-full resize-y rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm leading-6 text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
            value={intro}
            onChange={(e) => {
              setIntro(e.currentTarget.value);
              setError("");
            }}
          ></textarea>

          <p id="intro-help" className="text-xs text-slate-400">
            {intro.length.toLocaleString()} /{" "}
            {MAX_INTRO_LENGTH.toLocaleString()} characters
          </p>

          {error && (
            <p id="intro-error" role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setIntro(user.intro ?? "");
                setError("");
                setShowIntroInput(false);
              }}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
