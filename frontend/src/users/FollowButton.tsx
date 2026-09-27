import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserListItem } from "./types.ts";
import { useEffect, useRef } from "react";

const buttonClasses = "min-w-24 gap-2";

export default function FollowButton({
  userId,
  isFollowing,
  onFollowChange,
}: {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const errorNoticeRef = useRef<HTMLParagraphElement>(null);

  const mutation = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/following/${encodeURIComponent(userId)}`,
        {
          method: shouldFollow ? "PUT" : "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(body?.message ?? "Failed to update follow status.");
      }

      return shouldFollow;
    },
    onSuccess: async (newIsFollowing) => {
      await queryClient.cancelQueries({
        queryKey: ["user-index"],
      });

      queryClient.setQueryData<UserListItem[]>(["user-index"], (users) =>
        users?.map((user) =>
          user.id === userId
            ? {
                ...user,
                isFollowing: newIsFollowing,
              }
            : user,
        ),
      );
      await onFollowChange?.(newIsFollowing);
    },
  });

  // Remove the error message after 3s.
  const { isError, reset } = mutation;
  useEffect(() => {
    if (!isError) return;

    const notice = errorNoticeRef.current;
    if (notice && !notice.matches(":popover-open")) {
      notice.showPopover();
    }

    const timerId = setTimeout(() => {
      reset();
    }, 3000);

    return () => {
      clearTimeout(timerId);
    };
  }, [isError, reset]);

  return (
    <div className="inline-flex shrink-0">
      <button
        type="button"
        aria-pressed={isFollowing}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(!isFollowing)}
        className={`${buttonClasses} ${
          isFollowing
            ? "ui-button-secondary hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            : "ui-button-primary"
        }`}
      >
        {mutation.isPending && <SpinnerIcon />}

        {mutation.isPending ? "Updating" : isFollowing ? "Unfollow" : "Follow"}
      </button>

      {mutation.isError && (
        <p
          ref={errorNoticeRef}
          popover="manual"
          role="alert"
          className="fixed inset-x-4 top-auto bottom-4 mx-auto my-0 max-h-[calc(100dvh-2rem)] w-auto max-w-sm overflow-y-auto rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 font-medium wrap-anywhere text-rose-700 shadow-lg shadow-black/15"
        >
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 animate-spin">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />

      <path
        fill="currentColor"
        className="opacity-75"
        d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
      />
    </svg>
  );
}
