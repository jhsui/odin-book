import { useQuery } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.ts";
import FollowButton from "./FollowButton";
import PageShell, { PageHeading } from "../layout/PageShell.tsx";
import type { UserListItem } from "./types.ts";
import { Link } from "react-router";

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
        `${import.meta.env.VITE_BACKEND_URL}/api/users/index`,
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
    <PageShell>
      <PageHeading
        eyebrow="Community"
        title="Find your people"
        description="Follow writers and thinkers you want to hear more from."
      />

      {isLoading ? (
        <section
          className="ui-card overflow-hidden"
          aria-label="Loading community members"
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-0 sm:px-7"
            >
              <div className="size-11 shrink-0 rounded-2xl bg-slate-200 sm:size-12" />
              <div className="flex-1">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
              </div>
              <div className="h-11 w-24 rounded-xl bg-slate-200" />
            </div>
          ))}
        </section>
      ) : isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
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
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Could not load the community
          </h2>
          <p className="mt-2 text-sm text-rose-700">
            {error?.message ?? "Please try again in a moment."}
          </p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="ui-button-secondary mt-5"
          >
            {isFetching ? "Trying again..." : "Try again"}
          </button>
        </section>
      ) : (
        <section className="ui-card overflow-hidden">
          {users && users.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {users
                .filter((user) => !user.isAnonymous)
                .map((user) => {
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
                        className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 font-bold text-indigo-700 sm:size-12"
                      >
                        {user.image !== null ? (
                          <img
                            src={user.image}
                            alt={`${user.name}'s avatar`}
                            className="size-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">
                          {isSessionPending ? (
                            <p>{user.name}</p>
                          ) : isCurrentUser ? (
                            <Link
                              className="rounded transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
                              to={`/my-profile`}
                            >
                              {user.name}
                            </Link>
                          ) : (
                            <Link
                              className="rounded transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
                              to={`/user-profile/${user.id}`}
                            >
                              {user.name}
                            </Link>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                          Community member
                        </p>
                      </div>

                      {isSessionPending ? (
                        <div className="h-11 w-24 animate-pulse rounded-xl bg-slate-200" />
                      ) : isCurrentUser ? (
                        <span className="ui-badge">You</span>
                      ) : session ? (
                        <FollowButton
                          userId={user.id}
                          isFollowing={user.isFollowing}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert("Please sign in first.")}
                          className="ui-button-primary min-w-24"
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
    </PageShell>
  );
}
