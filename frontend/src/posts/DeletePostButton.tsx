import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "../lib/auth-client.ts";
import { useNavigate } from "react-router";

type DeletePostButtonProps = {
  postId: string;
  authorId: string;
  onDeleted?: () => void | Promise<void>;
  // ?
  ifRedirect?: boolean;
};

export function DeletePostButton({
  postId,
  authorId,
  onDeleted,
  ifRedirect = false,
}: DeletePostButtonProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { data: session } = authClient.useSession();

  const handleClick = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/posts/delete/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete this post");
      }

      // revalidate tanstack query
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post-index"] }),
        queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
      ]);

      // revalidate loader
      await onDeleted?.();

      if (ifRedirect) {
        navigate(-1);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {session && session.user.id === authorId ? (
        <>
          <button type="button" onClick={handleClick} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete post"}
          </button>
          {error && <p role="alert">{error}</p>}
        </>
      ) : null}
    </>
  );
}
