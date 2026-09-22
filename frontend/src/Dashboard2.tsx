import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import PostCard from "./posts/PostCard.tsx";
import { type PostDash } from "./posts/types.ts";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import { authClient } from "./lib/auth-client.ts";
import SwayHeader from "./layout/SwayHeader.tsx";

export default function Dashboard2() {
  const { data: session } = authClient.useSession();
  const canWrite = session && !session.user.isAnonymous;

  const fetchSomePosts = async ({ pageParam }: { pageParam: number }) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/dashboard/?pageParam=${pageParam}`,
    );

    if (!res.ok) {
      throw new Error("Failed to load posts");
    }

    return res.json();
  };

  const {
    data,
    status,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    // hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts-for-dashboard"],
    queryFn: fetchSomePosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage, // todo: lastPage needs to have nextPage.
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return status === "pending" ? (
    <p>Loading...</p>
  ) : status === "error" ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <a
          href="#feed"
          className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-white px-4 py-2 font-medium text-indigo-700 focus:not-sr-only"
        >
          Skip to posts
        </a>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950 text-slate-100 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SwayHeader compact />
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl items-start gap-6 px-3 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[11rem_minmax(0,1fr)_17rem]">
          <aside
            className="sticky top-28 hidden xl:block"
            aria-label="Explore Sway"
          >
            <nav aria-label="Dashboard navigation" className="space-y-1">
              <Link
                to="/dashboard"
                aria-current="page"
                className="flex items-center gap-3 rounded-xl bg-indigo-100 px-3 py-3 text-sm font-semibold text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <DashboardIcon name="home" />
                Home
              </Link>
              <Link
                to="/dashboard/user-index"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <DashboardIcon name="people" />
                Discover people
              </Link>
              <Link
                to="/dashboard/post-index"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <DashboardIcon name="posts" />
                All posts
              </Link>
            </nav>

            <div className="mt-5 border-t border-slate-200 px-3 pt-5">
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                A place to connect
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share an idea. Find your people. Join a conversation.
              </p>
            </div>
          </aside>

          <section
            id="feed"
            aria-labelledby="feed-heading"
            className="min-w-0 scroll-mt-48 xl:scroll-mt-28"
          >
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div className="flex min-w-0 items-center gap-3">
                <h1
                  id="feed-heading"
                  className="text-xl font-bold tracking-tight"
                >
                  Home feed
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  <span
                    className="size-1.5 rounded-full bg-indigo-500"
                    aria-hidden="true"
                  />
                  Latest
                </span>
              </div>
              <span className="hidden text-xs text-slate-500 sm:block">
                Newest first
              </span>
            </div>

            {canWrite && (
              <Link
                to="/dashboard/writing"
                className="group mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none sm:p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
                >
                  {session.user.name.trim().charAt(0).toUpperCase() || "S"}
                </span>
                <span className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 transition group-hover:border-indigo-200 group-hover:bg-indigo-50/50">
                  What would you like to share?
                </span>
                <span
                  className="hidden text-indigo-500 sm:block"
                  aria-hidden="true"
                >
                  <DashboardIcon name="plus" />
                </span>
              </Link>
            )}

            {data.pages.length > 0 ? (
              <>
                {data.pages.map((page, i) => (
                  <React.Fragment key={i}>
                    {page.data.map((post: PostDash) => (
                      <PostCard post={post} />
                    ))}
                  </React.Fragment>
                ))}

                <div ref={ref}>
                  {isFetching && !isFetchingNextPage ? "Fetching..." : null}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <span
                  className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
                  aria-hidden="true"
                >
                  <DashboardIcon name="posts" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">
                  The conversation starts here
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No posts yet. Share something with the community.
                </p>
                <Link
                  to={canWrite ? "/dashboard/writing" : "/"}
                  className="mt-5 inline-flex min-h-10 items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {canWrite ? "Create a post" : "Join Sway"}
                </Link>
              </div>
            )}
          </section>

          <aside
            className="sticky top-28 hidden space-y-4 lg:block"
            aria-label="About the community"
          >
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-20 items-end bg-indigo-600 px-5">
                <span
                  aria-hidden="true"
                  className="flex size-14 translate-y-5 items-center justify-center rounded-2xl border-4 border-white bg-slate-950 text-2xl font-black text-white"
                >
                  S
                </span>
              </div>
              <div className="px-5 pt-8 pb-5">
                <h2 className="text-base font-bold">
                  Your corner of the internet
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Welcome to Sway. A community for everyday stories, fresh
                  ideas, and the people behind them.
                </p>
                <Link
                  to={canWrite ? "/dashboard/writing" : "/"}
                  className="mt-5 flex min-h-10 items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {canWrite && <DashboardIcon name="plus" />}
                  {canWrite ? "Create a post" : "Join the conversation"}
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Explore the community
              </h2>
              <Link
                to="/dashboard/user-index"
                className="group mt-4 flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <DashboardIcon name="people" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold transition group-hover:text-indigo-600">
                    Find your people
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Discover someone new
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
              </Link>
              <Link
                to="/dashboard/post-index"
                className="group mt-5 flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <DashboardIcon name="posts" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold transition group-hover:text-indigo-600">
                    Browse the archive
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    More stories to explore
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  →
                </span>
              </Link>
            </section>

            <p className="px-2 text-xs leading-5 text-slate-500">
              Sway · A little more connected.
            </p>
          </aside>
        </div>
      </main>
      )
    </>
  );
}

function DashboardIcon({
  name,
}: {
  name: "home" | "people" | "posts" | "plus";
}) {
  const paths = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8m6 10v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    posts:
      "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5h8M8 12h8M8 16h5",
    plus: "M12 5v14M5 12h14",
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
    >
      <path d={paths[name]} />
    </svg>
  );
}
