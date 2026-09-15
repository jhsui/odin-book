import { authClient } from "../../lib/auth-client.ts";

export default function GithubSignInButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const signInWithGithub = async () => {
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/dashboard`,
    });

    if (error) {
      console.error("Github sign-in failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={signInWithGithub}
      disabled={disabled}
      aria-label="Continue with GitHub"
      className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none enabled:cursor-pointer enabled:hover:border-slate-300 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4.5 shrink-0"
      >
        <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1 1.71 1.78 3.26.76.1-.73.39-1.23.71-1.51-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.45 3.09-1.15 3.09-1.15.62 1.55.24 2.69.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.32-2.63 5.27-5.15 5.55.41.35.77 1.03.77 2.08v3.28c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z" />
      </svg>
      GitHub
    </button>
  );
}
