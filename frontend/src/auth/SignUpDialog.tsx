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
        aria-describedby="signup-description"
        onClick={handleBackdropClick}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-black/35 backdrop:bg-slate-950/75 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close sign up dialog"
            className="absolute top-4 right-4 flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:top-5 sm:right-5"
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

          <div className="border-b border-slate-100 bg-linear-to-br from-indigo-50 via-white to-white p-5 sm:p-7">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/20"
            >
              S
            </span>
            <h2
              id="signup-title"
              className="mt-4 text-2xl font-bold tracking-tight text-slate-950"
            >
              Join the conversation
            </h2>
            <p
              id="signup-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Create your account and start sharing ideas.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <form
              className="grid gap-4"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="signup-email"
                >
                  Email address
                </label>
                <input
                  className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-base text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10 sm:text-sm"
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
                  className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-base text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10 sm:text-sm"
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
                <div className="min-w-0">
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="signup-password"
                  >
                    Password
                  </label>
                  <input
                    className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-base text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10 sm:text-sm"
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

                <div className="min-w-0">
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="signup-confirm-password"
                  >
                    Confirm
                  </label>
                  <input
                    className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-base text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10 sm:text-sm"
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
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 font-medium wrap-anywhere text-rose-700"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none enabled:cursor-pointer enabled:hover:bg-indigo-500 enabled:active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && (
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin"
                  />
                )}
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
                <p className="text-xs font-medium text-slate-500">
                  Or continue with
                </p>
                <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <GoogleSignInButton disabled={isSubmitting} />
                <GithubSignInButton disabled={isSubmitting} />
              </div>
              <div className="mt-3">
                <GuestSignIn disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
