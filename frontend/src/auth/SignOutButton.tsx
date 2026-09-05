import { useNavigate } from "react-router";
import { authClient } from "../lib/auth-client";

export default function SignOutButton() {
  const navigate = useNavigate();

  const handleClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };

  return (
    <button type="button" onClick={handleClick}>
      Sign out
    </button>
  );
}
