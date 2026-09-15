import { authClient } from "../../lib/auth-client.ts";

export default function GoogleSignInButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const signInWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/dashboard`,
    });

    if (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={disabled}
      aria-label="Continue with Google"
      className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none enabled:cursor-pointer enabled:hover:border-slate-300 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4.5 shrink-0">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.73-.06-1.42-.19-2.09H12v3.96h5.92c-.26 1.28-1.04 2.36-2.21 3.09v2.57h3.57c2.08-1.92 3.28-4.75 3.28-7.53Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.87 0-5.31-1.94-6.18-4.54H2.13v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.82 14.08A6.6 6.6 0 0 1 5.48 12c0-.72.12-1.42.34-2.08V7.08H2.13A11 11 0 0 0 1 12c0 1.78.43 3.46 1.13 4.92l3.69-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.16-3.16A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.87 6.08l3.69 2.84C6.69 7.32 9.13 5.38 12 5.38Z"
        />
      </svg>
      Google
    </button>
  );
}
