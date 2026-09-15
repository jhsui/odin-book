import { Link } from "react-router";
import SignInDialog from "./auth/SignInDialog.tsx";
import SignUpDialog from "./auth/SignUpDialog.tsx";
import { authClient } from "./lib/auth-client.ts";
import SignOutButton from "./auth/SignOutButton.tsx";

const conversations = [
  {
    initials: "AM",
    name: "Avery Morgan",
    time: "4 min",
    title: "The small rituals that make creative work easier",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    initials: "JK",
    name: "Jordan Kim",
    time: "12 min",
    title: "What I learned from building in public for 30 days",
    accent: "bg-sky-100 text-sky-700",
  },
];

function App() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.24),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(14,165,233,0.14),transparent_28%)]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 sm:pb-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-black shadow-lg shadow-indigo-500/20">
              S
            </span>
            <span className="text-xl font-bold tracking-tight">Sway</span>
          </Link>

          <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
            {isPending ? (
              <span
                role="status"
                className="h-10 w-28 rounded-xl bg-white/10 motion-safe:animate-pulse"
              >
                <span className="sr-only">Loading account…</span>
              </span>
            ) : session ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-indigo-400/25 bg-indigo-400/10 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-400/20 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                >
                  Open dashboard
                </Link>

                <div className="[&>button]:cursor-pointer [&>button]:rounded-xl [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-sm [&>button]:font-medium [&>button]:text-slate-400 [&>button]:transition [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-indigo-400 [&>button:focus-visible]:outline-none [&>button:hover]:bg-white/5 [&>button:hover]:text-white">
                  <SignOutButton />
                </div>
              </>
            ) : (
              <SignInDialog />
            )}
          </div>
        </header>

        <div className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <section className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              <span className="size-1.5 rounded-full bg-indigo-400" />
              Ideas worth sharing
            </div>

            <h1 className="text-5xl leading-[1.04] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              A calmer place for
              <span className="text-indigo-400"> real conversation.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Share what you are learning, follow thoughtful people, and keep up
              with ideas that actually matter to you.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {isPending ? (
                <span className="h-12 w-64 animate-pulse rounded-xl bg-white/10" />
              ) : session ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                >
                  Continue as {session.user.name}
                  <ArrowIcon />
                </Link>
              ) : (
                <>
                  <SignUpDialog />
                  <p className="text-sm text-slate-500">
                    Free to join. Start writing in minutes.
                  </p>
                </>
              )}
            </div>
          </section>

          <section
            className="relative mx-auto w-full max-w-lg lg:mx-0"
            aria-label="A preview of conversations on Sway"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-4xl border border-white/5 bg-white/2.5"
            />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-semibold">Today on Sway</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Fresh ideas from your community
                  </p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                  <span className="size-2 rounded-full bg-emerald-400" />
                </span>
              </div>

              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <article
                    key={conversation.name}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-lg shadow-black/10"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${conversation.accent}`}
                      >
                        {conversation.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {conversation.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {conversation.time} ago
                        </p>
                      </div>
                      <span className="text-slate-300">•••</span>
                    </div>
                    <h2 className="mt-4 text-lg leading-7 font-semibold">
                      {conversation.title}
                    </h2>
                    <div className="mt-5 flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span>♡ 24</span>
                      <span>8 replies</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sway</p>
          <p>Thoughtful people. Better conversations.</p>
        </footer>
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
      className="size-4"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.69l-3.22-3.22a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default App;
