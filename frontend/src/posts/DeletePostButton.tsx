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
        `${import.meta.env.VITE_BACKEND_URL}/posts/${postId}`,
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
        const historyIndex = window.history.state?.idx ?? 0;

        if (historyIndex > 0) {
          navigate(-1);
        } else {
          navigate("/dashboard", { replace: true });
        }
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
        <div className="inline-flex max-w-full flex-col items-start gap-2 align-top">
          <button
            type="button"
            onClick={handleClick}
            disabled={isDeleting}
            aria-busy={isDeleting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold whitespace-nowrap text-rose-700 shadow-sm transition focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none enabled:cursor-pointer enabled:hover:border-rose-300 enabled:hover:bg-rose-100 enabled:active:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`size-4 shrink-0 ${isDeleting ? "motion-safe:animate-spin" : ""}`}
            >
              {isDeleting ? (
                <>
                  <circle cx="12" cy="12" r="9" className="opacity-25" />
                  <path d="M12 3a9 9 0 0 1 9 9" />
                </>
              ) : (
                <>
                  <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14" />
                  <path d="M10 10v7M14 10v7" />
                </>
              )}
            </svg>
            <span>{isDeleting ? "Deleting..." : "Delete post"}</span>
          </button>
          {error && (
            <p
              role="alert"
              className="max-w-xs rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 font-medium wrap-anywhere text-rose-700"
            >
              {error}
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
