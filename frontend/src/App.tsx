import { Link, useSearchParams } from "react-router";
import SignInDialog from "./auth/SignInDialog.tsx";
import SignUpDialog from "./auth/SignUpDialog.tsx";
import { authClient } from "./lib/auth-client.ts";
import SignOutButton from "./auth/SignOutButton.tsx";

const conversations = [
  {
    initials: "AM",
    name: "Avery Morgan",
    topic: "Everyday inspiration",
    title: "The small rituals that make creative work easier",
    excerpt: "Sometimes a fresh perspective starts with a slower morning.",
    accent: "bg-[#eadbc9] text-[#71573e]",
  },
  {
    initials: "JK",
    name: "Jordan Kim",
    topic: "Learning out loud",
    title: "What I learned from building in public for 30 days",
    excerpt: "A work in progress can be the beginning of a good conversation.",
    accent: "bg-brand-100 text-brand-700",
  },
];

function App() {
  const { data: session, isPending } = authClient.useSession();
  const isAnonymous = session?.user.isAnonymous === true;

  const [searchParams, setSearchParams] = useSearchParams();
  const showProfileBanner =
    searchParams.get("reason") === "registered-user-required";

  function dismissProfileBanner() {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("reason");
        return next;
      },
      { replace: true }, // Replaces the current browser-history entry instead of adding another one.
    );
  }

  return (
    <main className="bg-canvas text-ink min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-5 sm:pb-6">
          <Link
            to="/"
            aria-label="Sway home"
            className="focus-visible:ring-brand-600 focus-visible:ring-offset-canvas flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <span className="sway-mark">s</span>
            <span className="font-display text-3xl tracking-tight">Sway</span>
          </Link>

          <p className="hidden text-sm text-stone-500 md:block">
            A little less noise. A little more connection.
          </p>

          <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3 md:ml-0">
            {isPending ? (
              <span
                role="status"
                className="h-11 w-28 rounded-full bg-stone-200 motion-safe:animate-pulse"
              >
                <span className="sr-only">Loading account…</span>
              </span>
            ) : session ? (
              <>
                {isAnonymous && <span className="ui-badge">Guest</span>}
                <Link to="/dashboard" className="ui-button-primary">
                  Open dashboard
                </Link>
                <div className="[&>button:focus-visible]:ring-brand-600 [&>button:hover]:text-brand-700 [&>button]:min-h-11 [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-sm [&>button]:font-medium [&>button]:text-stone-600 [&>button]:transition [&>button:focus-visible]:ring-2 [&>button:focus-visible]:outline-none [&>button:hover]:bg-stone-200/60">
                  <SignOutButton />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 [&>button]:px-4 [&>button]:whitespace-nowrap [&>button>svg]:hidden">
                <SignInDialog />
                <SignUpDialog />
              </div>
            )}
          </div>
        </header>

        {showProfileBanner && (
          <section
            aria-label="Profile access"
            className="border-brand-200 bg-brand-50 relative mt-6 rounded-2xl border p-5 sm:p-6"
          >
            <div role="alert" className="pr-10">
              <h2 className="text-brand-800 text-base font-semibold">
                Sign in to view your profile
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Profiles are available to registered members. Sign in or create
                an account to view yours.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SignInDialog />
              <SignUpDialog />
            </div>
            <button
              type="button"
              aria-label="Dismiss profile notice"
              onClick={dismissProfileBanner}
              className="text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-600 absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full text-xl transition focus-visible:ring-2 focus-visible:outline-none"
            >
              <span aria-hidden="true">×</span>
            </button>
          </section>
        )}

        <div className="grid flex-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <section className="max-w-2xl">
            <div className="text-brand-700 mb-7 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
              <span className="bg-brand-600 size-2 rounded-full" />A space to be
              yourself
            </div>
            <h1 className="font-display text-[3.5rem] leading-[1.04] tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.3rem]">
              Good ideas grow
              <span className="text-brand-600 block italic">
                in good company.
              </span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-8 text-stone-600 sm:text-lg">
              Share what you’re learning. Find your people. Make room for
              conversations that stay with you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isPending ? (
                <span className="h-12 w-56 rounded-full bg-stone-200 motion-safe:animate-pulse" />
              ) : session ? (
                <Link to="/dashboard" className="ui-button-primary">
                  Continue as
                  <span className="font-semibold underline underline-offset-4">
                    {session.user.name}
                  </span>
                  <ArrowIcon />
                </Link>
              ) : (
                <>
                  <SignUpDialog />
                  <span className="text-sm text-stone-500">
                    Your next conversation starts here.
                  </span>
                </>
              )}
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-stone-200 pt-5 text-sm text-stone-500 sm:mt-14">
              <span
                className="font-display text-brand-600 text-2xl"
                aria-hidden="true"
              >
                ✳
              </span>
              <p>A thoughtful corner of the internet, made for you.</p>
            </div>
          </section>

          <section
            className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end"
            aria-label="Example conversations on Sway"
          >
            <div className="bg-brand-800 relative overflow-hidden rounded-4xl px-5 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 size-52 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-5 -right-5 size-38 rounded-full border border-white/10"
              />
              <div className="relative mb-7 flex items-center justify-between gap-3 text-white">
                <div>
                  <p className="text-brand-200 text-xs font-medium tracking-[0.16em] uppercase">
                    The conversation starts small
                  </p>
                  <p className="font-display mt-2 text-3xl">
                    A thought. A spark. A hello.
                  </p>
                </div>
              </div>

              <div className="relative space-y-4">
                {conversations.map((conversation, index) => (
                  <article
                    key={conversation.name}
                    className={`text-ink rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-6 ${index === 0 ? "bg-[#fffdf7] sm:mr-6" : "bg-[#e9eee4] sm:ml-6"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${conversation.accent}`}
                      >
                        {conversation.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {conversation.name}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {conversation.topic}
                        </p>
                      </div>
                      <span className="text-stone-400" aria-hidden="true">
                        ···
                      </span>
                    </div>
                    <h2 className="font-display mt-4 text-[1.4rem] leading-7 tracking-tight">
                      {conversation.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {conversation.excerpt}
                    </p>
                    <div className="text-brand-700 mt-4 flex items-center gap-2 border-t border-stone-300/50 pt-3 text-xs font-medium">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 9.5a6.5 6.5 0 0 1-6.5 6.5 7.5 7.5 0 0 1-2.5-.5L3 17l1.3-4.2A6.5 6.5 0 1 1 16.5 9.5Z"
                        />
                      </svg>
                      There’s a conversation in every idea
                    </div>
                  </article>
                ))}
              </div>
              <p className="text-brand-200 relative mt-6 text-center text-xs tracking-wide">
                A glimpse of what you could share · Example posts
              </p>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-stone-200 pt-5 pb-1 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
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
