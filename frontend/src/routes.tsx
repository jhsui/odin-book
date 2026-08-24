// import AllPosts from "./AllPosts.tsx";
import App from "./App.tsx";
import Dashboard from "./Dashboard.tsx";
import Writing from "./Writing.tsx";

const routes = [
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
          const res = await fetch("http://localhost:3000/posts/all");

          if (!res.ok) {
            throw new Error("Failed to load posts");
          }

          return res.json();
        },
      },
      {
        path: "writing",
        element: <Writing />,
      },
      // {
      //   path: "all-posts",
      //   element: <AllPosts />,
      //   loader: async () => {
      //     const res = await fetch("http://localhost:3000/posts/all");
      //     const { posts } = await res.json();

      //     return { posts };
      //   },
      // },
    ],
  },
];

export default routes;
