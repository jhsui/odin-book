import { useQueryClient, useMutation } from "@tanstack/react-query";

type CachedUser = {
  id: string;
  isFollowing: boolean;
};

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
      queryClient.setQueryData<CachedUser[]>(["all-users"], (users) =>
        users?.map((user) =>
          user.id === userId ? { ...user, isFollowing: newIsFollowing } : user,
        ),
      );
    },
  });

  return (
    <>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(!isFollowing)}
      >
        {mutation.isPending
          ? "Updating..."
          : isFollowing
            ? "Unfollow"
            : "Follow"}
      </button>

      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </>
  );
}
