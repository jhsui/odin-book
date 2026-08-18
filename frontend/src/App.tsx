// import { useState } from "react";
import "./App.css";
import SignUpDialog from "./SignUpDialog";

function App() {
  return (
    <>
      <h1 className="">Sway - Best Social Media Platform</h1>
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
        Sign in
      </button>

      <SignUpDialog></SignUpDialog>
    </>
  );
}

export default App;
