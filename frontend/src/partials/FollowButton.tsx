import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type UserListItem } from "../UserIndex.tsx";

const buttonClasses =
  "inline-flex min-w-24 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

export default function FollowButton({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      const res = await fetch(
        `http://localhost:3000/users/me/following/${encodeURIComponent(userId)}`,
        {
          method: shouldFollow ? "PUT" : "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(body?.message ?? "Failed to update follow status");
      }

      return shouldFollow;
    },

    onSuccess: (newIsFollowing) => {
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
    },
  });

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        aria-pressed={isFollowing}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(!isFollowing)}
        className={`${buttonClasses} ${
          isFollowing
            ? "border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            : "border-indigo-600 bg-indigo-600 text-white hover:border-indigo-500 hover:bg-indigo-500"
        }`}
      >
        {mutation.isPending && <SpinnerIcon />}

        {mutation.isPending ? "Updating" : isFollowing ? "Unfollow" : "Follow"}
      </button>

      {mutation.isError && (
        <p
          role="alert"
          className="max-w-52 text-right text-xs font-medium text-red-600"
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
