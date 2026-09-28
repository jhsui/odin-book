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

export default function SwayHeader({ compact = false }: { compact?: boolean }) {
  const { pathname } = useLocation();
  const isProfileActive = pathname === "/my-profile";

  // todo: is it okay to check auth in this way?
  const { data: session, isPending } = authClient.useSession();
  const isAnonymous = session?.user.isAnonymous === true;

  return (
    <nav
      className={`flex flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4 ${
        compact ? "py-4" : "border-b border-stone-200 pb-5 sm:pb-6"
      } ${
        isAnonymous ? "lg:flex-nowrap lg:gap-x-6" : "md:flex-nowrap md:gap-x-6"
      }`}
      aria-label="Main navigation"
    >
      <div className="flex shrink-0 items-center gap-3">
        <Link
          to="/"
          aria-label="Sway feed"
          className="focus-visible:ring-brand-400 focus-visible:ring-offset-canvas flex shrink-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          <span className="sway-mark">s</span>
          <span className="font-display text-ink hidden text-3xl tracking-tight sm:block">
            Sway
          </span>
        </Link>

        {isAnonymous && (
          <span className="hidden items-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-stone-500 sm:inline-flex">
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
        className={`order-last grid w-full grid-cols-3 gap-1 rounded-full border border-stone-200/80 bg-stone-200/40 p-1 ${
          isAnonymous
            ? "lg:order-0 lg:mx-auto lg:flex lg:w-auto lg:shrink-0"
            : "md:order-0 md:mx-auto md:flex md:w-auto md:shrink-0"
        }`}
      >
        {navigation.map((item) => {
          // Check if the button should have highlight.
          const isActive =
            item.to === "/dashboard"
              ? pathname === item.to
              : pathname.startsWith(item.to);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={`focus-visible:ring-brand-400 flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none ${
                  isActive
                    ? "text-brand-700 bg-white shadow-sm"
                    : "hover:text-ink text-stone-500 hover:bg-white/70"
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
          isAnonymous ? "justify-end lg:ml-0" : "justify-end md:ml-0"
        }`}
      >
        {isPending ? (
          <span
            role="status"
            className="h-11 w-32 rounded-full bg-stone-200 motion-safe:animate-pulse"
          >
            <span className="sr-only">Loading account…</span>
          </span>
        ) : !session ? (
          <div className="flex items-center gap-2 [&>button]:inline-flex [&>button]:h-11 [&>button]:cursor-pointer [&>button]:items-center [&>button]:justify-center [&>button]:px-3 [&>button]:py-2 [&>button]:whitespace-nowrap [&>button>svg]:hidden">
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
              className="ui-button-primary focus-visible:ring-offset-canvas px-3 sm:px-4"
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
              className={`focus-visible:ring-brand-400 inline-flex min-h-11 items-center justify-center rounded-full border px-2.5 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none sm:px-3 ${
                isProfileActive
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "hover:text-ink border-transparent text-stone-600 hover:border-stone-200 hover:bg-white"
              }`}
            >
              Profile
            </Link>
          </>
        )}

        {session && (
          <div className="[&>button:focus-visible]:ring-brand-400 [&>button:hover]:text-ink sm:border-l sm:border-stone-200 sm:pl-2 [&>button]:inline-flex [&>button]:min-h-11 [&>button]:cursor-pointer [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:px-2.5 [&>button]:py-2.5 [&>button]:text-sm [&>button]:font-medium [&>button]:whitespace-nowrap [&>button]:text-stone-500 [&>button]:transition sm:[&>button]:px-3 [&>button:focus-visible]:ring-2 [&>button:focus-visible]:outline-none [&>button:hover]:bg-stone-200/60">
            <SignOutButton />
          </div>
        )}
      </div>
    </nav>
  );
}
