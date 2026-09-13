import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import type { Comment } from "./Comments.tsx";
import { useState } from "react";

export default function DeleteCommentButton({ comment }: { comment: Comment }) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const { data: session } = authClient.useSession();

  const handleClick = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/comments/delete/${comment.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete comment.");
      }

      await queryClient.invalidateQueries({ queryKey: ["comments"] });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {session && session.user.id === comment.author.id ? (
        <>
          <button type="button" onClick={handleClick} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          {error && <p role="alert">{error}</p>}
        </>
      ) : null}
    </>
  );
}
