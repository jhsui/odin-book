import {
  useId,
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
  const id = useId();

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
        className="ui-button-primary"
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
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClick={handleBackdropClick}
        className="text-ink backdrop:bg-brand-950/45 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-[1.75rem] border border-stone-200 bg-[#fffefa] p-0 shadow-2xl backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close sign up dialog"
            className="focus-visible:ring-brand-600 absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:top-5 sm:right-5"
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

          <div className="bg-canvas border-b border-stone-200 p-6 sm:p-8">
            <span aria-hidden="true" className="sway-mark">
              s
            </span>
            <h2
              id={`${id}-title`}
              className="font-display text-ink mt-4 text-3xl tracking-tight"
            >
              Join the conversation
            </h2>
            <p
              id={`${id}-description`}
              className="mt-2 text-sm leading-6 text-stone-500"
            >
              Create your account and start sharing ideas.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form
              className="grid gap-4"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <div>
                <label className="ui-label" htmlFor={`${id}-email`}>
                  Email address
                </label>
                <input
                  className="ui-input aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10"
                  type="email"
                  id={`${id}-email`}
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formError) || undefined}
                  aria-describedby={formError ? `${id}-error` : undefined}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="ui-label" htmlFor={`${id}-username`}>
                  Display name
                </label>
                <input
                  className="ui-input aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10"
                  type="text"
                  id={`${id}-username`}
                  name="username"
                  autoComplete="name"
                  placeholder="How people will know you"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(formError) || undefined}
                  aria-describedby={formError ? `${id}-error` : undefined}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className="ui-label" htmlFor={`${id}-password`}>
                    Password
                  </label>
                  <input
                    className="ui-input aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10"
                    type="password"
                    id={`${id}-password`}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create password"
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(formError) || undefined}
                    aria-describedby={formError ? `${id}-error` : undefined}
                    onChange={handleChange}
                  />
                </div>

                <div className="min-w-0">
                  <label
                    className="ui-label"
                    htmlFor={`${id}-confirm-password`}
                  >
                    Confirm
                  </label>
                  <input
                    className="ui-input aria-invalid:border-rose-300 aria-invalid:bg-rose-50/40 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10"
                    type="password"
                    id={`${id}-confirm-password`}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    required
                    disabled={isSubmitting}
                    aria-invalid={Boolean(formError) || undefined}
                    aria-describedby={formError ? `${id}-error` : undefined}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  id={`${id}-error`}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 font-medium wrap-anywhere text-rose-700"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ui-button-primary mt-1 w-full"
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
                <span aria-hidden="true" className="h-px flex-1 bg-stone-200" />
                <p className="text-xs font-medium text-stone-500">
                  Or continue with
                </p>
                <span aria-hidden="true" className="h-px flex-1 bg-stone-200" />
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
