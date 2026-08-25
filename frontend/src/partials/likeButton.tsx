import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.ts";

export default function LikeButton({ postId }: { postId: string }) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const queryClient = useQueryClient();

  const userId = session?.user.id;
  const queryKey = ["like-status", userId, postId] as const;

  const {
    data: liked = false,
    isPending,
    isError,
  } = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/posts/like-status/${postId}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error(`Could not retrieve like status: ${res.status}`);
      }

      const data = (await res.json()) as { liked: boolean };
      return data.liked;
    },
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:3000/posts/like/${postId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Could not update like: ${res.status}`);
      }

      const data = (await res.json()) as { currentLike: boolean };
      return data.currentLike;
    },
    onSuccess: (currentLike) => {
      queryClient.setQueryData(queryKey, currentLike);
    },
  });

  if (isSessionPending) {
    return <button disabled>Loading…</button>;
  }

  if (!session) {
    return (
      <button type="button" onClick={() => alert("Please sign in first.")}>
        Like
      </button>
    );
  }

  if (isPending) {
    return (
      <button type="button" disabled>
        Loading…
      </button>
    );
  }

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => alert("Something went wrong, please try again later.")}
      >
        Like
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={toggleLike.isPending}
      onClick={() => toggleLike.mutate()}
    >
      {toggleLike.isPending ? "Updating…" : liked ? "Liked" : "Like"}
    </button>
  );
}
