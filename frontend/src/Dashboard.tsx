import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import PostCard from "./posts/PostCard.tsx";
import { type PostDash } from "./posts/types.ts";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router";
import { authClient } from "./lib/auth-client.ts";
import PageShell, { PageHeading } from "./layout/PageShell.tsx";

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const canWrite = session && !session.user.isAnonymous;

  const fetchSomePosts = async ({ pageParam }: { pageParam: number }) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/posts/dashboard/?pageParam=${pageParam}`,
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
    refetch,
    // isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ["posts-for-dashboard"],
    queryFn: fetchSomePosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref, inView } = useInView({
    rootMargin: "0px 0px 600px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching && !isFetchNextPageError) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetching, isFetchNextPageError]);

  return (
    <PageShell className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[11rem_minmax(0,1fr)_17rem] xl:gap-9">
      <aside
        className="sticky top-28 hidden xl:block"
        aria-label="Explore Sway"
      >
        <p className="ui-eyebrow mb-5 px-3">Your daily pause</p>
        <nav aria-label="Dashboard navigation" className="space-y-1">
          <Link
            to="/dashboard"
            aria-current="page"
            className="bg-brand-100/70 text-brand-700 focus-visible:ring-brand-500 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            <DashboardIcon name="home" />
            Home
          </Link>
          <Link
            to="/dashboard/user-index"
            className="focus-visible:ring-brand-500 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900 focus-visible:ring-2 focus-visible:outline-none"
          >
            <DashboardIcon name="people" />
            Discover people
          </Link>
          <Link
            to="/dashboard/post-index"
            className="focus-visible:ring-brand-500 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900 focus-visible:ring-2 focus-visible:outline-none"
          >
            <DashboardIcon name="posts" />
            All posts
          </Link>
        </nav>

        <div className="mt-8 border-t border-stone-200 px-3 pt-6">
          <p className="font-display text-ink text-xl leading-snug">
            A little more
            <br />
            connected.
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Share an idea. Find your people. Join a conversation.
          </p>
        </div>
      </aside>

      <section
        id="feed"
        aria-label="Home feed"
        className="min-w-0 scroll-mt-48 xl:scroll-mt-28"
      >
        <PageHeading
          eyebrow="The community journal"
          title="Home feed"
          description="A fresh perspective is just a conversation away."
        >
          <span className="ui-badge">
            <span
              className="bg-brand-500 size-1.5 rounded-full"
              aria-hidden="true"
            />
            Latest
          </span>
        </PageHeading>
        {canWrite && (
          <Link
            to="/dashboard/writing"
            className="group border-brand-200/70 bg-brand-50/60 hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-brand-500 mb-6 flex items-center gap-3 rounded-[1.25rem] border p-3 transition focus-visible:ring-2 focus-visible:outline-none sm:p-4"
          >
            <span
              aria-hidden="true"
              className="bg-brand-100 text-brand-700 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            >
              {session.user.name.trim().charAt(0).toUpperCase() || "S"}
            </span>
            <span className="text-brand-700 min-w-0 flex-1 py-2.5 text-sm">
              What would you like to share?
            </span>
            <span className="text-brand-500 hidden sm:block" aria-hidden="true">
              <DashboardIcon name="plus" />
            </span>
          </Link>
        )}
        {/* Check if posts exists instead of pages. */}
        {status === "pending" ? (
          <div role="status" className="space-y-4">
            <span className="sr-only">Loading posts…</span>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                aria-hidden="true"
                className="ui-card space-y-4 p-5 motion-safe:animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-stone-100" />
                  <div className="h-3 w-32 rounded bg-stone-100" />
                </div>
                <div className="h-5 w-2/3 rounded bg-stone-100" />
                <div className="h-16 rounded-xl bg-stone-50" />
              </div>
            ))}
          </div>
        ) : status === "error" && !data ? (
          <div role="alert" className="ui-card px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">We couldn’t load the feed</h2>
            <p className="mt-2 text-sm text-stone-600">{error.message}</p>
            <button
              type="button"
              className="ui-button-secondary mt-5"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              {isFetching ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : data?.pages.some((page) => page.data.length > 0) ? (
          <div className="flex flex-col gap-5">
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.data.map((post: PostDash) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </React.Fragment>
            ))}

            <div ref={ref} className="py-3 text-center text-sm text-stone-500">
              {isFetching && <p role="status">Loading more stories…</p>}
              {!hasNextPage && !isFetching && <p>You’re all caught up.</p>}

              {isFetchNextPageError && (
                <div className="ui-card p-5">
                  <p role="alert">Couldn't load more posts.</p>

                  <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => fetchNextPage()}
                    className="ui-button-secondary mt-3"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="ui-empty">
            <span
              className="bg-brand-50 text-brand-600 mx-auto flex size-12 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <DashboardIcon name="posts" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              The conversation starts here
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              No posts yet. Share something with the community.
            </p>
            <Link
              to={canWrite ? "/dashboard/writing" : "/"}
              className="ui-button-primary mt-5"
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
        <section className="bg-brand-800 relative overflow-hidden rounded-[1.25rem] p-6 text-white">
          <svg
            aria-hidden="true"
            viewBox="0 0 180 150"
            className="text-brand-300/20 pointer-events-none absolute -top-7 -right-9 w-48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <ellipse
              cx="95"
              cy="75"
              rx="75"
              ry="36"
              transform="rotate(-35 95 75)"
            />
            <ellipse
              cx="95"
              cy="75"
              rx="75"
              ry="48"
              transform="rotate(-35 95 75)"
            />
            <ellipse
              cx="95"
              cy="75"
              rx="75"
              ry="60"
              transform="rotate(-35 95 75)"
            />
          </svg>
          <div className="relative">
            <p className="text-brand-200 text-[0.6875rem] font-medium tracking-[0.18em] uppercase">
              Made for connection
            </p>
            <h2 className="font-display mt-8 text-[1.8rem] leading-[1.15]">
              Your corner
              <br />
              of the internet.
            </h2>
            <p className="text-brand-100/90 mt-4 text-sm leading-6">
              Welcome to Sway. A community for everyday stories, fresh ideas,
              and the people behind them.
            </p>
            <Link
              to={canWrite ? "/dashboard/writing" : "/"}
              className="text-brand-900 mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#e8edce] px-3 py-2.5 text-sm font-semibold transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {canWrite && <DashboardIcon name="plus" />}
              {canWrite ? "Create a post" : "Join the conversation"}
            </Link>
          </div>
        </section>

        <section className="px-1 py-5">
          <h2 className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
            Explore the community
          </h2>
          <Link
            to="/dashboard/user-index"
            className="group focus-visible:ring-brand-500 mt-4 flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <span className="bg-brand-50 text-brand-600 flex size-10 shrink-0 items-center justify-center rounded-xl">
              <DashboardIcon name="people" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="group-hover:text-brand-600 block text-sm font-semibold transition">
                Find your people
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Discover someone new
              </span>
            </span>
            <span aria-hidden="true" className="text-stone-400">
              →
            </span>
          </Link>
          <Link
            to="/dashboard/post-index"
            className="group focus-visible:ring-brand-500 mt-5 flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <span className="bg-brand-50 text-brand-600 flex size-10 shrink-0 items-center justify-center rounded-xl">
              <DashboardIcon name="posts" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="group-hover:text-brand-600 block text-sm font-semibold transition">
                Browse the archive
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                More stories to explore
              </span>
            </span>
            <span aria-hidden="true" className="text-stone-400">
              →
            </span>
          </Link>
        </section>

        <p className="px-2 text-xs leading-5 text-stone-500">
          Sway · A little more connected.
        </p>
      </aside>
    </PageShell>
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
