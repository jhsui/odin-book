import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import PageShell from "./layout/PageShell.tsx";

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
    <PageShell>
      <section className="ui-card mx-auto my-8 w-full max-w-lg p-6 text-center sm:my-16 sm:p-10">
        <Link
          to="/dashboard"
          className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
        >
          S<span className="sr-only">Go to Sway dashboard</span>
        </Link>
        <p className="mt-7 text-xs font-semibold tracking-wider text-indigo-600 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="ui-button-primary">
            Back to dashboard
          </Link>
          <Link to="/" className="ui-button-secondary">
            Go home
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
