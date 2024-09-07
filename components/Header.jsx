import Link from "next/link";
import { logout } from "../actions/userController";
import { getUserFromCookie } from "../lib/getUser";

export default async function Header() {
  const user = await getUserFromCookie();

  return (
    <header className="shadow-lg">
      <div className="container mx-auto">
        <div className="navbar">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost text-xl">
              Haiku Next
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              {user && (
                <>
                  <li>
                    <Link href="/create-haiku" className="btn btn-primary mr-3">
                      Create Haiku
                    </Link>
                  </li>

                  <li>
                    <form action={logout} className="btn btn-neutral">
                      <button>Log Out</button>
                    </form>
                  </li>
                </>
              )}
              {!user && (
                <li>
                  <Link href="/login">Log In</Link>{" "}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
