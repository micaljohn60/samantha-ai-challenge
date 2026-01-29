"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full mx-auto  bg-white border border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold text-gray-800">Samantha.ai</h1>

        {/* Nav Links */}
        <nav className="flex items-center gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              >
                <Icon
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Avatar */}
        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow">
          MJ
        </div>
      </div>
    </header>
  );
}
