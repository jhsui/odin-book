import { authClient } from "../../lib/auth-client.ts";

export default function GithubSignInButton() {
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
    <button type="button" onClick={signInWithGithub}>
      Continue with Github
    </button>
  );
}
