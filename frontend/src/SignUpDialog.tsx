import {
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEventHandler,
} from "react";
import { authClient } from "./lib/auth-client.ts";

export default function SignUpDialog() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.username,
      },
      // {
      //   onRequest: (ctx) => {
      //     //show loading
      //   },
      //   onSuccess: (ctx) => {
      //     //redirect to the dashboard or sign in page
      //   },
      //   onError: (ctx) => {
      //     // display the error message
      //     alert(ctx.error.message);
      //   },
      // },
    );

    if (error) {
      console.error(error.message);
      console.error(error.status);
      console.error(error.code);
    } else {
      console.log(data.user);
    }
  };

  return (
    <>
      <button
        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        onClick={() => dialogRef.current?.showModal()}
      >
        Sign up
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="signup-title"
        onClick={handleBackdropClick}
        className="m-auto w-full max-w-100 rounded-xl border-0 bg-white p-6 shadow-2xl backdrop:bg-black/50"
      >
        <h2 id="signup-title" className="mb-4 text-xl font-bold">
          Sign up
        </h2>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block" htmlFor="email">
              Email
            </label>

            <input
              className="w-full rounded-lg border p-2"
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block" htmlFor="username">
              Username
            </label>

            <input
              className="w-full rounded-lg border p-2"
              type="text"
              id="username"
              name="username"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block" htmlFor="password">
              Password
            </label>

            <input
              className="w-full rounded-lg border p-2"
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block" htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              className="w-full rounded-lg border p-2"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Create account
            </button>

            <button
              type="button"
              className="rounded-lg bg-gray-900 px-4 py-2 text-white"
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
