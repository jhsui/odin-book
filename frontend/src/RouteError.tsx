import { Link, isRouteErrorResponse, useRouteError } from "react-router";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const isNotFound = error.status === 404;

    return (
      <ErrorPage
        eyebrow={`${error.status} error`}
        title={
          isNotFound ? "We could not find that page" : "Something went wrong"
        }
        message={
          typeof error.data === "string"
            ? error.data
            : isNotFound
              ? "The page may have moved, or the link may be out of date."
              : error.statusText || "Please try again in a moment."
        }
      />
    );
  }

  return (
    <ErrorPage
      eyebrow="Unexpected error"
      title="Something went wrong"
      message={
        error instanceof Error
          ? error.message
          : "Please return to the dashboard and try again."
      }
    />
  );
}

export function NotFound() {
  return (
    <ErrorPage
      eyebrow="404 error"
      title="This page wandered off"
      message="The page you are looking for does not exist or may have moved."
    />
  );
}

function ErrorPage({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent_40%)]"
      />

      <section className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-12">
        <Link
          to="/dashboard"
          className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-black shadow-lg shadow-indigo-500/25 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        >
          S<span className="sr-only">Go to Sway dashboard</span>
        </Link>
        <p className="mt-7 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 leading-7 text-slate-400">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            Back to dashboard
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
