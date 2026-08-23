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
      },
      {
        path: "writing",
        element: <Writing />,
      },
    ],
  },
];

export default routes;
