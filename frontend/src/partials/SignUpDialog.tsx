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

export default function SignUpDialog() {
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
    username: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.username,
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
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Your account could not be created. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:translate-y-0"
        onClick={() => dialogRef.current?.showModal()}
      >
        Sign up
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="signup-title"
        onClick={handleBackdropClick}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-8">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close sign up dialog"
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
              id="signup-title"
              className="mt-5 text-2xl font-bold tracking-tight text-slate-950"
            >
              Join the conversation
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create your account and start sharing ideas.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-700"
                htmlFor="signup-email"
              >
                Email address
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                type="email"
                id="signup-email"
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
                htmlFor="signup-username"
              >
                Display name
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                type="text"
                id="signup-username"
                name="username"
                autoComplete="name"
                placeholder="How people will know you"
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(formError) || undefined}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="signup-password"
                >
                  Password
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  type="password"
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create password"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formError) || undefined}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="signup-confirm-password"
                >
                  Confirm
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  type="password"
                  id="signup-confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formError) || undefined}
                  onChange={handleChange}
                />
              </div>
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
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <GoogleSignInButton />
          <GithubSignInButton />
        </div>
      </dialog>
    </>
  );
}
