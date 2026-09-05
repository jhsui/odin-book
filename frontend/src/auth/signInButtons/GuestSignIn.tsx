import { useNavigate } from "react-router";
import { authClient } from "../../lib/auth-client.ts";

export default function GuestSignIn() {
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
    <button type="button" onClick={handleClick}>
      Continue as guest
    </button>
  );
}
