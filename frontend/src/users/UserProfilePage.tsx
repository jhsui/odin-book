import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import type { User } from "./types.ts";
import formatDateTime from "../utils/formatDateTime.ts";
import SwayHeader from "../layout/SwayHeader.tsx";

// this is for general user view
// todo: add entrance for users profile
export default function UserProfilePage() {
  const { userId } = useParams();

  const {
    isPending,
    isError,
    data: user,
    error,
    isFetching,
    refetch,
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

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-10 sm:mb-12">
          <SwayHeader />
        </div>
        <Link
          to="/dashboard/user-index"
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-400 transition hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        >
          <span aria-hidden="true">←</span> Back to people
        </Link>

        {isPending ? (
          <section
            role="status"
            className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
          >
            <span className="sr-only">Loading profile...</span>
            <div
              aria-hidden="true"
              className="rounded-3xl border border-white/10 bg-white/5 p-7"
            >
              <div className="size-24 animate-pulse rounded-2xl bg-slate-800 motion-reduce:animate-none" />
              <div className="mt-6 h-7 w-3/4 animate-pulse rounded bg-slate-800 motion-reduce:animate-none" />
              <div className="mt-4 h-20 animate-pulse rounded-xl bg-slate-800 motion-reduce:animate-none" />
            </div>
            <div aria-hidden="true" className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5 motion-reduce:animate-none"
                />
              ))}
            </div>
          </section>
        ) : isError ? (
          <section
            role="alert"
            className="rounded-3xl border border-red-400/20 bg-red-400/10 px-6 py-12 text-center"
          >
            <h1 className="text-xl font-semibold text-white">
              Could not load this profile
            </h1>
            <p className="mt-3 text-sm text-red-200">{error.message}</p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <section
              aria-labelledby="profile-name"
              className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div
                aria-hidden="true"
                className="h-24 bg-linear-to-br from-indigo-500/40 via-violet-500/20 to-sky-500/30"
              />
              <div className="px-6 pb-7 sm:px-7">
                <div className="relative -mt-12 mb-5">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.name}'s avatar`}
                      className="size-24 rounded-2xl bg-slate-900 object-cover ring-4 ring-slate-900"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-24 items-center justify-center rounded-2xl bg-indigo-950 text-3xl font-bold text-indigo-200 ring-4 ring-slate-900"
                    >
                      {user.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-300 uppercase">
                  Community profile
                </p>
                <h1
                  id="profile-name"
                  className="text-2xl font-bold tracking-tight wrap-anywhere text-white"
                >
                  {user.name}
                </h1>

                <p className="mt-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
                  {user.intro || "No introduction yet."}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <dt className="text-xs text-slate-400">Posts</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {user.posts.length}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-400">Comments</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {user.comments.length}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-400">Followers</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {user.followers.length}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-slate-400">Following</dt>
                    <dd className="mt-1 text-2xl font-semibold text-white">
                      {user.following.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="min-w-0 space-y-9">
              <section aria-labelledby="profile-posts">
                <h2
                  id="profile-posts"
                  className="mb-4 text-xl font-semibold text-white"
                >
                  Posts{" "}
                  <span className="ml-2 rounded-full bg-indigo-400/10 px-2.5 py-1 align-middle text-xs font-semibold text-indigo-300">
                    {user.posts.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {user.posts.length ? (
                    user.posts.map((post) => (
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
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
                      <p className="font-medium text-slate-200">No posts yet</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Posts written by {user.name} will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </section>
              <section aria-labelledby="profile-comments">
                <h2
                  id="profile-comments"
                  className="mb-4 text-xl font-semibold text-white"
                >
                  Comments{" "}
                  <span className="ml-2 rounded-full bg-sky-400/10 px-2.5 py-1 align-middle text-xs font-semibold text-sky-300">
                    {user.comments.length}
                  </span>
                </h2>
                {user.comments.length ? (
                  <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 px-5 sm:px-6">
                    {user.comments.map((comment) => (
                      <article key={comment.id} className="py-5">
                        <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
                          {comment.content}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <time
                            dateTime={comment.createdAt}
                            className="text-slate-400"
                          >
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
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center">
                    <p className="font-medium text-slate-200">
                      No comments yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Replies from {user.name} will appear here.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
