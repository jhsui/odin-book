import App from "./App.tsx";
import Dashboard from "./Dashboard.tsx";
import PostIndex from "./posts/PostIndex.tsx";
import UserIndex from "./users/UserIndex.tsx";
import RouteError, { NotFound } from "./RouteError.tsx";
import { redirect, type RouteObject } from "react-router";
import UserProfilePage from "./users/UserProfilePage.tsx";
import MyProfilePage from "./users/MyProfilePage.tsx";
import CreatePostPage from "./posts/CreatePostPage.tsx";
import PostDetailPage from "./posts/PostDetailPage.tsx";
import { authClient } from "./lib/auth-client.ts";

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
        element: <PostDetailPage />,
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
        element: <CreatePostPage />,
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
    path: "user-profile/:userId",
    element: <UserProfilePage />,
  },
  {
    path: "my-profile",
    element: <MyProfilePage />,
    errorElement: <RouteError />,
    loader: async () => {
      const { data: session } = await authClient.getSession();

      // Only signed-in non-anonymous users have profile.
      if (!session || session.user.isAnonymous) {
        // todo: add feedback in App.tsx
        return redirect("/?reason=registered-user-required");
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me/profile`,
        { credentials: "include" },
      );

      if (res.status === 401 || res.status === 403) {
        return redirect("/?reason=registered-user-required");
      }

      if (!res.ok) {
        throw new Response("Failed to fetch user data.", {
          status: res.status,
        });
      }

      const { user } = await res.json();
      return { user };
    },
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
