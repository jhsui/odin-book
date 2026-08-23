// import { useState } from "react";
// import Dashboard from "./Dashboard.tsx";
import SignInDialog from "./partials/SignInDialog.tsx";
import SignUpDialog from "./partials/SignUpDialog.tsx";

import { authClient } from "./lib/auth-client.ts";

function App() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  return (
    <>
      <h1 className="">Sway - Best Social Media Platform</h1>

      <button
        type="button"
        onClick={() => console.log(session, isPending, error, refetch)}
      >
        show session
      </button>

      <SignInDialog />
      <SignUpDialog />
    </>
  );
}

export default App;
