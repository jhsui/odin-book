import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import type { User } from "./types.ts";
import formatDateTime from "../utils/formatDateTime.ts";

// this is for general user view
// todo: add entrance for users profile
export default function UserProfilePage() {
  const { userId } = useParams();

  const {
    isPending,
    isError,
    data: user,
    error,
  } = useQuery({
    queryKey: ["user-profile", userId] as const,

    queryFn: async (): Promise<User> => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile/${userId}`,
      );

      if (!res.ok) {
        throw new Error(`Could not retrieve user profile: ${res.status}`);
      }

      const { user } = (await res.json()) as { user: User };
      return user;
    },
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <h1>{user.name}'s Profile</h1>
      <img src={user.image} alt={`${user.name}'s avatar`} />
      <p className="whitespace-pre-wrap">{user.intro ?? ""}</p>

      <div>
        {user.posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
          >
            <h3 className="text-lg font-semibold wrap-anywhere text-white">
              <Link
                to={`/dashboard/posts/${post.id}`}
                className="rounded transition hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                {post.title}
              </Link>
            </h3>
            <time
              dateTime={post.createdAt}
              className="mt-2 block text-xs text-slate-400"
            >
              {formatDateTime(post.createdAt)}
            </time>
            <p className="mt-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
              {post.content}
            </p>
          </article>
        ))}
      </div>
      <div>
        {user.comments.map((comment) => (
          <article key={comment.id} className="py-5">
            <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
              {comment.content}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <time dateTime={comment.createdAt} className="text-slate-400">
                {formatDateTime(comment.createdAt)}
              </time>
              <Link
                to={`/dashboard/posts/${comment.postId}`}
                className="rounded font-medium text-indigo-300 transition hover:text-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                View conversation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
