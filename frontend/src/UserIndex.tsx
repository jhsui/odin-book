import { useQuery } from "@tanstack/react-query";
import { authClient } from "./lib/auth-client.ts";
import FollowButton from "./partials/FollowButton";

export type UserListItem = {
  id: string;
  createdAt: string;
  name: string;
  isFollowing: boolean;
};

export default function UserIndex() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const {
    data: users,
    isError,
    isLoading,
    error,
  } = useQuery<UserListItem[]>({
    queryKey: ["user-index"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users/index", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to get user index");
      }

      const { users } = (await res.json()) as {
        users: UserListItem[];
      };

      return users;
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-10 w-64 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-0"
              >
                <div className="size-12 rounded-full bg-slate-200" />
                <div className="h-5 w-36 rounded bg-slate-200" />
                <div className="ml-auto h-10 w-24 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="font-semibold text-red-900">Could not load users</h1>

          <p className="mt-1 text-sm text-red-700">
            {error?.message ?? "Please try again later."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">
            Community
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Discover people
          </h1>

          <p className="mt-2 text-slate-600">
            Follow people to keep up with what they post.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {users && users.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {users.map((user) => {
                const isCurrentUser = session?.user.id === user.id;

                const initial = user.name.trim().charAt(0).toUpperCase() || "?";

                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700"
                    >
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="text-sm text-slate-500">Community member</p>
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
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100 text-xl">
                👋
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No users yet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                New community members will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
