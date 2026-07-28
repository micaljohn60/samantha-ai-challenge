"use client";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  onHelpClick?: () => void;
}

export default function Navbar({ onHelpClick }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm shrink-0">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Sammy.ai
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {/* Help button */}
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
              title="User guide"
            >
              <HelpCircle size={17} />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}

          {/* Profile Avatar + Dropdown */}
          <div className="relative">
            <div
              className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white flex items-center justify-center font-semibold shadow cursor-pointer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faUser} />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
