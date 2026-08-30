import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

export default function FollowButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: async (): Promise<{ isFollowing: boolean }> => {
      const res = await fetch(
        `http://localhost:3000/users/me/following/${encodeURIComponent(userId)}/status`,
        { credentials: "include" },
      );

      if (!res.ok) {
        throw new Error("Failed to get follow status");
      }

      return res.json();
    },
  });

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
        const body = await res.json().catch(() => null);

        throw new Error(body?.message ?? "Failed to update follow status");
      }
    },

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["follow-status", userId],
      }),
  });

  if (isLoading) return <button disabled>Loading...</button>;

  const isFollowing = data?.isFollowing ?? false;

  return (
    <>
      <button
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
