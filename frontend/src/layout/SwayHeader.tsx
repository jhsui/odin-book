import { Link, useLocation } from "react-router";
import { authClient } from "../lib/auth-client.ts";
import SignOutButton from "../auth/SignOutButton.tsx";
import SignUpDialog from "../auth/SignUpDialog.tsx";
import SignInDialog from "../auth/SignInDialog.tsx";

const navigation = [
  { label: "Feed", to: "/dashboard" },
  { label: "People", to: "/dashboard/user-index" },
  { label: "Explore", to: "/dashboard/post-index" },
];

export default function SwayHeader() {
  const { pathname } = useLocation();
  const isProfileActive = pathname === "/my-profile";

  // todo: is it okay to check auth in this way?
  const { data: session, isPending } = authClient.useSession();
  const isAnonymous = session?.user.isAnonymous === true;

  return (
    <nav
      className={`flex flex-wrap items-center gap-x-3 gap-y-4 border-b border-white/10 pb-5 sm:gap-x-4 sm:pb-6 ${
        isAnonymous ? "lg:flex-nowrap lg:gap-x-6" : "md:flex-nowrap md:gap-x-6"
      }`}
      aria-label="Main navigation"
    >
      <div className="flex shrink-0 items-center gap-3">
        <Link
          to="/dashboard"
          aria-label="Sway feed"
          className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-black text-white shadow-lg shadow-indigo-500/20">
            S
          </span>
          <span className="hidden text-xl font-bold tracking-tight text-white sm:block">
            Sway
          </span>
        </Link>

        {isAnonymous && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-medium text-sky-200">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-3.5"
            >
              <circle cx="10" cy="6.25" r="2.75" />
              <path strokeLinecap="round" d="M4.5 16a5.5 5.5 0 0 1 11 0" />
            </svg>
            Guest
          </span>
        )}
      </div>

      <ul
        className={`order-last grid w-full grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 ${
          isAnonymous
            ? "lg:order-0 lg:mx-auto lg:flex lg:w-auto lg:shrink-0"
            : "md:order-0 md:mx-auto md:flex md:w-auto md:shrink-0"
        }`}
      >
        {navigation.map((item) => {
          const isActive =
            item.to === "/dashboard"
              ? pathname === item.to || pathname.startsWith("/dashboard/posts/")
              : pathname.startsWith(item.to);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
                  isActive
                    ? "bg-indigo-400/15 text-indigo-200 ring-1 ring-indigo-400/25 ring-inset"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        className={`ml-auto flex max-w-full min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 ${
          isAnonymous
            ? "w-full justify-between sm:w-auto sm:justify-end lg:ml-0"
            : "justify-end md:ml-0"
        }`}
      >
        {isPending ? (
          <span
            role="status"
            className="h-10 w-48 rounded-xl bg-white/10 motion-safe:animate-pulse"
          >
            <span className="sr-only">Loading account…</span>
          </span>
        ) : isAnonymous ? (
          <div className="flex items-center gap-2 [&>button]:inline-flex [&>button]:h-10 [&>button]:cursor-pointer [&>button]:items-center [&>button]:justify-center [&>button]:px-3 [&>button]:py-2 [&>button]:whitespace-nowrap [&>button>svg]:hidden">
            <SignInDialog />
            <SignUpDialog />
          </div>
        ) : (
          <>
            <Link
              to="/dashboard/writing"
              aria-current={
                pathname === "/dashboard/writing" ? "page" : undefined
              }
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:bg-indigo-600 sm:gap-2 sm:px-4"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 shrink-0"
              >
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Write
            </Link>

            <Link
              to="/my-profile"
              aria-current={isProfileActive ? "page" : undefined}
              className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-2.5 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none sm:px-3 ${
                isProfileActive
                  ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`}
            >
              Profile
            </Link>
          </>
        )}

        {session && (
          <div className="sm:border-l sm:border-white/10 sm:pl-2 [&>button]:inline-flex [&>button]:min-h-10 [&>button]:cursor-pointer [&>button]:items-center [&>button]:justify-center [&>button]:rounded-xl [&>button]:px-2.5 [&>button]:py-2.5 [&>button]:text-sm [&>button]:font-medium [&>button]:whitespace-nowrap [&>button]:text-slate-400 [&>button]:transition sm:[&>button]:px-3 [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-indigo-400 [&>button:focus-visible]:outline-none [&>button:hover]:bg-white/5 [&>button:hover]:text-white">
            <SignOutButton />
          </div>
        )}
      </div>
    </nav>
  );
}
