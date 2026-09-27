import { useNavigate } from "react-router";
import { authClient } from "../../lib/auth-client.ts";

export default function GuestSignIn({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const navigate = useNavigate();

  const handleClick = async () => {
    const { error } = await authClient.signIn.anonymous();

    if (error) {
      console.error(error.message);
      return;
    }

    navigate("/dashboard");
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="ui-button-secondary w-full min-w-0 px-3 whitespace-nowrap"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4.5 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="9" r="3" />
        <path d="M5.7 18.4a6.5 6.5 0 0 1 12.6 0" />
      </svg>
      Continue as guest
    </button>
  );
}
