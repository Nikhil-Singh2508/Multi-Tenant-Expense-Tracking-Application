"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.push("/auth/login");
  };

  // Detect if on workspace page
  const isWorkspace = pathname.startsWith("/workspace/");

  return (
    <nav className="w-full bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          ExpenseApp
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4 text-gray-700">
          <Link
            href="/dashboard"
            className={`hover:text-blue-600 ${
              pathname === "/dashboard" ? "font-semibold text-blue-600" : ""
            }`}
          >
            Dashboard
          </Link>

          {isWorkspace && (
            <span className="font-semibold text-gray-600">Workspace</span>
          )}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
