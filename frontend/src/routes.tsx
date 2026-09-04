import App from "./App.tsx";
import Dashboard from "./Dashboard.tsx";
import PostIndex from "./PostIndex.tsx";
import SinglePost from "./SinglePost.tsx";
import UserIndex from "./UserIndex.tsx";
import Writing from "./Writing.tsx";
import RouteError, { NotFound } from "./RouteError.tsx";
import type { RouteObject } from "react-router";
import UserProfile from "./UserProfile.tsx";
import UserOwnProfile from "./UserOwnProfile.tsx";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
  },
  {
    path: "dashboard",
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: async () => {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`);

          if (!res.ok) {
            throw new Error("Failed to load posts");
          }

          return res.json();
        },
      },
      {
        path: "posts/:postId",
        element: <SinglePost />,
        loader: async ({ params }) => {
          const { postId } = params;

          if (!postId) {
            throw new Response("Post ID is required", {
              status: 400,
            });
          }

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/posts/${encodeURIComponent(postId)}`,
          );

          if (res.status === 404) {
            throw new Response("Post not found", { status: 404 });
          }

          if (!res.ok) {
            throw new Response("Failed to load post", {
              status: res.status,
            });
          }

          return res.json();
        },
      },
      {
        path: "writing",
        element: <Writing />,
      },
      {
        path: "user-index",
        element: <UserIndex />,
      },
      {
        path: "post-index",
        element: <PostIndex />,
      },
    ],
  },
  {
    path: "user-profile",
    // what is the user ID from?
    element: <UserProfile userId={""} />,
  },
  {
    path: "me-profile",
    element: <UserOwnProfile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
