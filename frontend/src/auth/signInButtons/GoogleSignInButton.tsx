import { authClient } from "../../lib/auth-client.ts";

export default function GoogleSignInButton() {
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
    <button type="button" onClick={signInWithGoogle}>
      Continue with Google
    </button>
  );
}
