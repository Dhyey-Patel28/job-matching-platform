// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import AppBackground from "@/components/AppBackground";
import Splash from "@/components/Splash";
import LandingHero from "@/components/LandingHero";
import LoginPage from "@/components/LoginPage";
import DiscoverView from "@/components/DiscoverView";
import RegisterCard from "@/components/RegisterCard";

type Role = "candidate" | "recruiter";
type View = "landing" | "login" | "register" | "discover";

export default function AppPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("landing");

  // Splash once per tab
  const [showSplash, setShowSplash] = useState(false);
  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (!seen) setShowSplash(true);
  }, []);
  const finishSplash = () => {
    sessionStorage.setItem("splashSeen", "1");
    setShowSplash(false);
  };

  // Persisted login (when Remember me was checked)
  useEffect(() => {
    const remembered = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role") as Role | null;
    if (remembered === "true" && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setView("discover");
    } else {
      setView("landing");
    }
    setLoading(false);
  }, []);

  const handleLogin = (role: Role, remember: boolean) => {
    localStorage.setItem("role", role);
    if (remember) localStorage.setItem("isAuthenticated", "true");
    else localStorage.removeItem("isAuthenticated");
    setUserRole(role);
    setIsLoggedIn(true);
    setView("discover");
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
    setIsLoggedIn(false);
    setUserRole(null);
    setView("landing");
  };

  const onExplore = () => setView(isLoggedIn ? "discover" : "login");
  const onLogin = () => setView("login");
  const onCreate = () => setView("register");

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppBackground />
      
      {showSplash && (
        <Splash onFinish={finishSplash} brand="Job Matching" />
      )}

      {view === "landing" && (
        <LandingHero onExplore={onExplore} onLogin={onLogin} onCreate={onCreate} />
      )}

      {view === "login" && (
        <div className="grid min-h-screen place-items-center px-4">
          <LoginPage onLogin={handleLogin} />
        </div>
      )}

      {view === "register" && (
        <div className="grid min-h-screen place-items-center px-4">
          <RegisterCard onBack={() => setView("login")} />
        </div>
      )}

      {view === "discover" && (
        <DiscoverView userRole={userRole} onLogout={handleLogout} />
      )}
    </main>
  );
}
