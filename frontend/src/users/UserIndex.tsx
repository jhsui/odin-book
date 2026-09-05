import { useQuery } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.ts";
import FollowButton from "./FollowButton";
import SwayHeader from "../layout/SwayHeader.tsx";
import type { UserListItem } from "./types.ts";

export default function UserIndex() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const {
    data: users,
    isError,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<UserListItem[]>({
    queryKey: ["user-index"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/index`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to get user index");
      }

      const { users } = (await res.json()) as {
        users: UserListItem[];
      };

      return users;
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>

        <header className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold tracking-wider text-sky-300 uppercase">
            Community
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find your people
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Follow writers and thinkers you want to hear more from.
          </p>
        </header>

        {isLoading ? (
          <section
            className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/20"
            aria-label="Loading community members"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-0 sm:px-7"
              >
                <div className="size-12 rounded-2xl bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-10 w-24 rounded-full bg-slate-200" />
              </div>
            ))}
          </section>
        ) : isError ? (
          <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300 ring-1 ring-red-400/20">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.88c.674 1.167-.168 2.625-1.515 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.88ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold text-white">
              Could not load the community
            </h2>
            <p className="mt-2 text-sm text-red-200/70">
              {error?.message ?? "Please try again in a moment."}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl shadow-black/20">
            {users && users.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isCurrentUser = session?.user.id === user.id;
                  const initial =
                    user.name.trim().charAt(0).toUpperCase() || "?";

                  return (
                    <li
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50 sm:gap-4 sm:px-7 sm:py-5"
                    >
                      <div
                        aria-hidden="true"
                        className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 font-bold text-indigo-700 sm:size-12"
                      >
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-950">
                          {user.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                          Community member
                        </p>
                      </div>

                      {isSessionPending ? (
                        <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
                      ) : isCurrentUser ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                          You
                        </span>
                      ) : session ? (
                        <FollowButton
                          userId={user.id}
                          isFollowing={user.isFollowing}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert("Please sign in first.")}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          Follow
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a7 7 0 0 1 13.07 0A2.002 2.002 0 0 1 14.663 17H5.337a2.002 2.002 0 0 1-1.872-2.507Z" />
                  </svg>
                </span>
                <h2 className="mt-4 font-semibold text-slate-900">
                  No people here yet
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  New community members will appear here.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
