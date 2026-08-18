import { useRef } from "react";

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
        className="m-auto w-full max-w-[400px] rounded-xl border-0 bg-white p-6 shadow-2xl backdrop:bg-black/50"
      >
        <h2 id="signup-title" className="mb-4 text-xl font-bold">
          Sign up
        </h2>

        <form className="grid gap-4">
          <div>
            <label className="mb-1 block" htmlFor="email">
              Email
            </label>

            <input
              className="w-full rounded-lg border p-2"
              type="email"
              id="email"
              name="email"
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
