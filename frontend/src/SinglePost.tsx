import { Link, useLoaderData } from "react-router";
import LikeButton from "./partials/likeButton";
import CommentSection from "./CommentSection";
import formatDateTime from "./utils/formatDateTime";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    name: string;
  };
};

export default function SinglePost() {
  const { post } = useLoaderData() as { post: Post };

  const createdAt = formatDateTime(post.createdAt);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-indigo-600 transition hover:text-indigo-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          <span aria-hidden="true">&larr;</span>
          Back to all posts
        </Link>

        <article className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-8 sm:px-10">
            <p className="mb-3 text-sm font-semibold tracking-wider text-indigo-600 uppercase">
              Post
            </p>

            <h1 className="text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-3">
              <p>
                Author:{" "}
                <span className="font-medium text-slate-700">
                  {post.author.name}
                </span>
              </p>

              <span className="hidden text-slate-300 sm:inline">•</span>

              <time dateTime={post.createdAt}>Published {createdAt}</time>
            </div>
          </header>

          <div className="px-6 py-8 sm:px-10">
            <p className="text-base leading-8 wrap-break-word whitespace-pre-wrap text-slate-700 sm:text-lg">
              {post.content}
            </p>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-5 sm:px-10">
            <LikeButton postId={post.id} />
          </div>
        </article>
        <CommentSection postId={post.id}></CommentSection>
      </div>
    </main>
  );
}
