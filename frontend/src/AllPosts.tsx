import { Link, useLoaderData } from "react-router";

type Post = {
  id: string;
  title: string;
};

type PostsLoaderData = {
  posts: Post[];
};

export default function AllPosts() {
  // todo: pagination
  const { posts } = useLoaderData() as PostsLoaderData;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">All posts</h2>
      </div>

      {posts.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={`posts/${post.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl px-3 py-4 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                <span className="font-medium text-slate-800 transition group-hover:text-indigo-600">
                  {post.title}
                </span>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 15.5 3h-11ZM6 6.75A.75.75 0 0 1 6.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 6.75Zm0 3.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" />
            </svg>
          </span>
          <h3 className="mt-4 font-semibold text-slate-900">No posts yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create your first post to see it here.
          </p>

          <Link
            to="/dashboard/writing"
            className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Write a post
          </Link>
        </div>
      )}
    </div>
  );
}
