"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar";
import UserGuide from "@/components/UserGuide";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("sammy_guide_seen")) {
      setShowGuide(true);
    }
  }, []);

  const handleCloseGuide = () => {
    localStorage.setItem("sammy_guide_seen", "1");
    setShowGuide(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar onHelpClick={() => setShowGuide(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
      {showGuide && <UserGuide onClose={handleCloseGuide} />}
    </div>
  );
}
