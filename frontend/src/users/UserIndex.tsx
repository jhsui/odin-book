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
        description="A good conversation starts with good company. Find a new voice to follow."
      />

      {isLoading ? (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Loading community members"
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="ui-card flex animate-pulse flex-col items-start p-6 motion-reduce:animate-none"
            >
              <div className="size-14 shrink-0 rounded-full bg-stone-200" />
              <div className="mt-5">
                <div className="h-4 w-36 rounded bg-stone-200" />
                <div className="mt-2 h-3 w-24 rounded bg-stone-100" />
              </div>
              <div className="mt-6 h-11 w-24 rounded-full bg-stone-200" />
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
          <h2 className="mt-4 text-lg font-semibold text-stone-900">
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
        <section aria-label="Community members">
          {users && users.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {users
                .filter((user) => !user.isAnonymous)
                .map((user) => {
                  const isCurrentUser = session?.user.id === user.id;
                  const initial =
                    user.name.trim().charAt(0).toUpperCase() || "?";

                  const avatar =
                    user.image !== null ? (
                      <img
                        src={user.image}
                        alt={`${user.name}'s avatar`}
                        className="size-full object-cover"
                      />
                    ) : (
                      initial
                    );

                  return (
                    <li
                      key={user.id}
                      className="ui-card group hover:border-brand-200 flex min-w-0 flex-col p-6 transition duration-200 hover:shadow-md hover:shadow-stone-200/40"
                    >
                      <div
                        aria-hidden="true"
                        className="bg-brand-50 text-brand-700 ring-brand-100 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-semibold ring-1"
                      >
                        {isSessionPending ? (
                          <div className="flex size-full items-center justify-center">
                            {avatar}
                          </div>
                        ) : (
                          <Link
                            to={
                              isCurrentUser
                                ? "/my-profile"
                                : `/user-profile/${user.id}`
                            }
                            className="flex size-full items-center justify-center"
                          >
                            {avatar}
                          </Link>
                        )}
                      </div>

                      <div className="mt-5 min-w-0 flex-1">
                        <div className="text-ink truncate text-lg font-semibold tracking-tight">
                          {isSessionPending ? (
                            <p>{user.name}</p>
                          ) : isCurrentUser ? (
                            <Link
                              className="hover:text-brand-600 focus-visible:outline-brand-600 rounded transition focus-visible:outline-2 focus-visible:outline-offset-4"
                              to={`/my-profile`}
                            >
                              {user.name}
                            </Link>
                          ) : (
                            <Link
                              className="hover:text-brand-600 focus-visible:outline-brand-600 rounded transition focus-visible:outline-2 focus-visible:outline-offset-4"
                              to={`/user-profile/${user.id}`}
                            >
                              {user.name}
                            </Link>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-stone-500">
                          Community member
                        </p>
                      </div>

                      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-stone-100 pt-4">
                        <span className="text-xs font-medium tracking-wide text-stone-500">
                          {isCurrentUser
                            ? "Your corner of Sway"
                            : "Stay connected"}
                        </span>
                        {isSessionPending ? (
                          <div className="h-11 w-24 animate-pulse rounded-full bg-stone-200 motion-reduce:animate-none" />
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
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <div className="ui-empty px-6 py-16 text-center">
              <span className="bg-brand-50 text-brand-600 mx-auto flex size-12 items-center justify-center rounded-full">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a7 7 0 0 1 13.07 0A2.002 2.002 0 0 1 14.663 17H5.337a2.002 2.002 0 0 1-1.872-2.507Z" />
                </svg>
              </span>
              <h2 className="mt-4 font-semibold text-stone-900">
                No people here yet
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                New community members will appear here.
              </p>
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
