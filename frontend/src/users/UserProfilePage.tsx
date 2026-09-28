import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import type { User } from "./types.ts";
import formatDateTime from "../utils/formatDateTime.ts";
import PageShell from "../layout/PageShell.tsx";

// This page is for a users to review another user's profile.
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
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/${userId}`,
      );

      if (!res.ok) {
        throw new Error(`Could not retrieve user profile: ${res.status}`);
      }

      const { user } = (await res.json()) as { user: User };
      return user;
    },
  });

  return (
    <PageShell>
      <Link
        to="/dashboard/user-index"
        className="ui-link mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
      >
        <span aria-hidden="true">←</span> Back to people
      </Link>

      {isPending ? (
        <section
          role="status"
          className="grid gap-7 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-10"
        >
          <span className="sr-only">Loading profile...</span>
          <div aria-hidden="true" className="ui-card p-6">
            <div className="size-24 animate-pulse rounded-full bg-stone-200 motion-reduce:animate-none" />
            <div className="mt-6 h-7 w-3/4 animate-pulse rounded bg-stone-200 motion-reduce:animate-none" />
            <div className="mt-4 h-20 animate-pulse rounded-xl bg-stone-200 motion-reduce:animate-none" />
          </div>
          <div aria-hidden="true" className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="ui-card h-40 animate-pulse motion-reduce:animate-none"
              />
            ))}
          </div>
        </section>
      ) : isError ? (
        <section
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center"
        >
          <h1 className="text-xl font-semibold text-stone-900">
            Could not load this profile
          </h1>
          <p className="mt-3 text-sm text-rose-700">{error.message}</p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="ui-button-secondary mt-6"
          >
            {isFetching ? "Trying again..." : "Try again"}
          </button>
        </section>
      ) : (
        <div className="grid items-start gap-7 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-10">
          <section
            aria-labelledby="profile-name"
            className="ui-card min-w-0 overflow-hidden"
          >
            <div aria-hidden="true" className="bg-brand-700 h-32" />
            <div className="px-6 pb-7 sm:px-7">
              <div className="relative -mt-12 mb-5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${user.name}'s avatar`}
                    className="size-24 rounded-full bg-white object-cover ring-[5px] ring-white"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="bg-brand-50 text-brand-700 flex size-24 items-center justify-center rounded-full text-3xl font-semibold ring-[5px] ring-white"
                  >
                    {user.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <p className="text-brand-700 mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Community profile
              </p>
              <h1
                id="profile-name"
                className="font-display text-ink text-3xl tracking-tight wrap-anywhere"
              >
                {user.name}
              </h1>

              <p className="mt-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-stone-600">
                {user.intro || "No introduction yet."}
              </p>

              <dl className="bg-canvas mt-7 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-stone-200/80 p-5">
                <div>
                  <dt className="text-xs text-stone-500">Posts</dt>
                  <dd className="text-ink mt-1 text-2xl font-semibold tabular-nums">
                    {user.posts.length}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-stone-500">Comments</dt>
                  <dd className="text-ink mt-1 text-2xl font-semibold tabular-nums">
                    {user.comments.length}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-stone-500">Followers</dt>
                  <dd className="text-ink mt-1 text-2xl font-semibold tabular-nums">
                    {user.followers.length}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-stone-500">Following</dt>
                  <dd className="text-ink mt-1 text-2xl font-semibold tabular-nums">
                    {user.following.length}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <div className="min-w-0 space-y-10">
            <section aria-labelledby="profile-posts">
              <h2
                id="profile-posts"
                className="font-display text-ink mb-5 flex items-center border-b border-stone-200 pb-4 text-2xl tracking-tight"
              >
                Posts{" "}
                <span className="ui-badge ml-2 align-middle">
                  {user.posts.length}
                </span>
              </h2>
              <div className="space-y-4">
                {user.posts.length ? (
                  user.posts.map((post) => (
                    <article
                      key={post.id}
                      className="ui-card hover:border-brand-200 p-5 transition sm:p-6"
                    >
                      <h3 className="text-ink text-lg font-semibold tracking-tight wrap-anywhere">
                        <Link
                          to={`/posts/${post.id}`}
                          className="hover:text-brand-600 focus-visible:ring-brand-600 rounded transition focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <time
                        dateTime={post.createdAt}
                        className="mt-2 block text-xs text-stone-500"
                      >
                        {formatDateTime(post.createdAt)}
                      </time>
                    </article>
                  ))
                ) : (
                  <div className="ui-empty">
                    <p className="font-medium text-stone-900">No posts yet</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      Posts written by {user.name} will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
            <section aria-labelledby="profile-comments">
              <h2
                id="profile-comments"
                className="font-display text-ink mb-5 flex items-center border-b border-stone-200 pb-4 text-2xl tracking-tight"
              >
                Comments{" "}
                <span className="ui-badge ml-2 align-middle">
                  {user.comments.length}
                </span>
              </h2>
              {user.comments.length ? (
                <div className="ui-card divide-y divide-stone-100 px-5 sm:px-6">
                  {user.comments.map((comment) => (
                    <article key={comment.id} className="py-6">
                      <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-stone-600">
                        {comment.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <time
                          dateTime={comment.createdAt}
                          className="text-stone-500"
                        >
                          {formatDateTime(comment.createdAt)}
                        </time>
                        <Link
                          to={`/posts/${comment.postId}`}
                          className="ui-link min-h-11 items-center font-semibold"
                        >
                          View conversation <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ui-empty">
                  <p className="font-medium text-stone-900">No comments yet</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Replies from {user.name} will appear here.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </PageShell>
  );
}
