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
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/intro`,
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
      <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-stone-600">
        {user.intro || "You haven't added an intro yet."}
      </p>

      <button
        type="button"
        hidden={showIntroInput}
        className="ui-link mt-3 min-h-11 py-2 text-sm font-semibold"
        onClick={() => {
          setIntro(user.intro ?? "");
          setError("");
          setShowIntroInput(true);
        }}
      >
        {user.intro ? "Edit introduction" : "Add an introduction"}
      </button>

      {showIntroInput && (
        <form
          onSubmit={handleIntroSubmit}
          className="bg-canvas mt-4 space-y-3 rounded-2xl border border-stone-200 p-4"
        >
          <label htmlFor="intro" className="ui-label">
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
            className="ui-input resize-y leading-6"
            value={intro}
            onChange={(e) => {
              setIntro(e.currentTarget.value);
              setError("");
            }}
          ></textarea>

          <p id="intro-help" className="text-xs text-stone-500">
            {intro.length.toLocaleString()} /{" "}
            {MAX_INTRO_LENGTH.toLocaleString()} characters
          </p>

          {error && (
            <p id="intro-error" role="alert" className="text-sm text-rose-700">
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
              className="ui-button-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="ui-button-primary"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
