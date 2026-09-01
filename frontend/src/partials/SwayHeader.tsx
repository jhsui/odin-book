import { Link, useLocation } from "react-router";

const navigation = [
  { label: "Feed", to: "/dashboard" },
  { label: "People", to: "/dashboard/user-index" },
  { label: "Explore", to: "/dashboard/post-index" },
];

export default function SwayHeader() {
  const { pathname } = useLocation();

  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Main navigation"
    >
      <Link
        to="/dashboard"
        className="flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-black text-white shadow-lg shadow-indigo-500/25">
          S
        </span>
        <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
          Sway
        </span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="mr-1 hidden items-center sm:flex">
          {navigation.map((item) => {
            const isActive =
              item.to === "/dashboard"
                ? pathname === item.to ||
                  pathname.startsWith("/dashboard/posts/")
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          to="/dashboard/writing"
          aria-current={pathname === "/dashboard/writing" ? "page" : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:translate-y-0"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Write
        </Link>
      </div>
    </nav>
  );
}
