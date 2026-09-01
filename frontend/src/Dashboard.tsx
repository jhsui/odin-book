import { Link } from "react-router";
import AllPosts from "./AllPosts.tsx";
import SwayHeader from "./partials/SwayHeader.tsx";

export default function Dashboard() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>

        <header className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
            <span className="size-1.5 rounded-full bg-indigo-400" />
            Your community
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            See what everyone is
            <span className="text-indigo-400"> talking about.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Catch up on new ideas, discover people worth following, and share
            something of your own.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/20 sm:p-7">
            <AllPosts />
          </section>

          <aside className="space-y-4" aria-label="Explore Sway">
            <Link
              to="user-index"
              className="group block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a7 7 0 0 1 13.07 0A2.002 2.002 0 0 1 14.663 17H5.337a2.002 2.002 0 0 1-1.872-2.507Z" />
                </svg>
              </span>
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-white">
                    Find your people
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    Discover new voices in the community.
                  </span>
                </span>
                <ArrowIcon />
              </span>
            </Link>

            <Link
              to="post-index"
              className="group block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 15.5 3h-11ZM6 6.75A.75.75 0 0 1 6.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 6.75Zm0 3.5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm.75 2.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z" />
                </svg>
              </span>
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-white">
                    Browse the archive
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    Explore every story published on Sway.
                  </span>
                </span>
                <ArrowIcon />
              </span>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-indigo-300"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
