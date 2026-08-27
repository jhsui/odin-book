import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.ts";

const baseButtonClasses =
  "inline-flex min-w-24 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

type LikeData = {
  liked: boolean;
  likeCount: number;
};

export default function LikeButton({ postId }: { postId: string }) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const queryKey = ["like-status", userId, postId] as const;

  const {
    data: likeData,
    isPending,
    isError,
  } = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<LikeData> => {
      const res = await fetch(
        `http://localhost:3000/posts/${postId}/likes/me`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error(`Could not retrieve like status: ${res.status}`);
      }

      return res.json();
    },
  });

  const liked = likeData?.liked ?? false;
  const likeCount = likeData?.likeCount ?? 0;

  const toggleLike = useMutation({
    mutationFn: async (): Promise<LikeData> => {
      const res = await fetch(
        `http://localhost:3000/posts/${postId}/likes/me`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Could not update like: ${res.status}`);
      }

      const data = (await res.json()) as {
        currentLike: boolean;
        likeCount: number;
      };

      return {
        liked: data.currentLike,
        likeCount: data.likeCount,
      };
    },

    onSuccess: (updatedLikeData) => {
      queryClient.setQueryData(queryKey, updatedLikeData);
    },

    onError: () => {
      alert("Could not update the like. Please try again.");
    },
  });

  if (isSessionPending || isPending) {
    return (
      <button
        type="button"
        disabled
        className={`${baseButtonClasses} border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400`}
      >
        <SpinnerIcon />
        Loading
      </button>
    );
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => alert("Please sign in first.")}
        className={`${baseButtonClasses} border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-300`}
      >
        <HeartIcon filled={false} />
        Like
      </button>
    );
  }

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => alert("Something went wrong. Please try again later.")}
        className={`${baseButtonClasses} border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300`}
      >
        Try again
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`${liked ? "Unlike" : "Like"} this post. ${likeCount} ${
        likeCount === 1 ? "like" : "likes"
      }`}
      disabled={toggleLike.isPending}
      onClick={() => toggleLike.mutate()}
      className={`${baseButtonClasses} active:scale-95 ${
        liked
          ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-600"
          : "border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
      }`}
    >
      {toggleLike.isPending ? <SpinnerIcon /> : <HeartIcon filled={liked} />}

      <span>{liked ? "Liked" : "Like"}</span>

      <span
        aria-hidden="true"
        className={liked ? "text-rose-100" : "text-slate-300"}
      >
        ·
      </span>

      <span className="tabular-nums">{likeCount.toLocaleString()}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      />
    </svg>
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
