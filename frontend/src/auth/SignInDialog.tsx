import {
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEventHandler,
} from "react";
import { authClient } from "../lib/auth-client.ts";
import { useNavigate } from "react-router";
import GoogleSignInButton from "./signInButtons/GoogleSignInButton.tsx";
import GithubSignInButton from "./signInButtons/GithubSignInButton.tsx";
import GuestSignIn from "./signInButtons/GuestSignIn.tsx";

export default function SignInDialog() {
  const navigate = useNavigate();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          rememberMe: false,
        },
        {
          onSuccess: () => {
            navigate("/dashboard");
          },
          onError: (ctx) => {
            setFormError(ctx.error.message);
          },
        },
      );

      if (error) {
        setFormError(
          error.message ?? "You could not be signed in. Please try again.",
        );
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "You could not be signed in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        onClick={() => dialogRef.current?.showModal()}
      >
        Sign in
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="signin-title"
        onClick={handleBackdropClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close sign in dialog"
            className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L10 8.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L11.06 10l4.47 4.47a.75.75 0 1 1-1.06 1.06L10 11.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L8.94 10 4.47 5.53a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>

          <div className="mb-7">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 font-black text-indigo-600 ring-1 ring-indigo-100">
              S
            </span>
            <h2
              id="signin-title"
              className="mt-5 text-2xl font-bold tracking-tight text-slate-950"
            >
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue the conversation.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="signin-email"
              >
                Email address
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                type="email"
                id="signin-email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(formError) || undefined}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="signin-password"
              >
                Password
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                type="password"
                id="signin-password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(formError) || undefined}
                onChange={handleChange}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <GuestSignIn />
        <GoogleSignInButton />
        <GithubSignInButton />
      </dialog>
    </>
  );
}
