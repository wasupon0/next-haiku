"use client";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../../actions/userController";

export default function Page() {
  const [formState, formAction] = useFormState(login, {});

  return (
    <>
      <h2 className={"text-center text-2xl text-gray-600 mb-5"}>Login In</h2>
      <form action={formAction} className="max-w-xs mx-auto">
        <div className="mb-3">
          <input
            name="username"
            type="text"
            placeholder="Username"
            className="w-full max-w-xs input input-bordered"
          />
          {formState.success == false && (
            <div
              role="alert"
              className="p-1 mt-2 rounded-lg h-fit alert alert-warning"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 stroke-current shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{formState.message}</span>
            </div>
          )}
        </div>
        <div className="mb-3">
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full max-w-xs input input-bordered"
          />
        </div>
        <button className="btn btn-primary">Login</button>
      </form>
    </>
  );
}
