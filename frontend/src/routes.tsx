import App from "./App.tsx";
import Dashboard from "./Dashboard.tsx";
import SinglePost from "./SinglePost.tsx";
import Writing from "./Writing.tsx";
import type { RouteObject } from "react-router";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "dashboard",
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: async () => {
          const res = await fetch("http://localhost:3000/posts");

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
            `http://localhost:3000/posts/${encodeURIComponent(postId)}`,
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
    ],
  },
];

export default routes;
