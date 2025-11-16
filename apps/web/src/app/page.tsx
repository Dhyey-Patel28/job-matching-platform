// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import AppBackground from "@/components/AppBackground";
import Splash from "@/components/Splash";
import LandingHero from "@/components/LandingHero";
import LoginPage from "@/components/LoginPage";
import DiscoverView from "@/components/DiscoverView";
import RegisterCard from "@/components/RegisterCard";
import ProfileView from "@/components/ProfileView";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";
type View = "landing" | "login" | "register" | "profile" | "discover";

export default function AppPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [profileMode, setProfileMode] = useState<ProfileMode>("candidate");

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
    const storedMode = localStorage.getItem("profileMode") as
      | ProfileMode
      | null;

    if (remembered === "true" && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setProfileMode(
        storedMode ?? (role === "candidate" ? "candidate" : "employer"),
      );
      // Returning visitors go straight to discovery; they can jump to Profile later
      setView("discover");
    } else {
      setView("landing");
    }
    setLoading(false);
  }, []);

  const handleLogin = (
    user: { role: Role; profileMode: ProfileMode },
    remember: boolean,
  ) => {
    const { role, profileMode } = user;

    localStorage.setItem("role", role);
    localStorage.setItem("profileMode", profileMode);
    if (remember) localStorage.setItem("isAuthenticated", "true");
    else localStorage.removeItem("isAuthenticated");

    setUserRole(role);
    setProfileMode(profileMode);
    setIsLoggedIn(true);
    // After a fresh login, send them to profile setup first
    setView("profile");
  };

  const handleProfileModeChange = (mode: ProfileMode) => {
    setProfileMode(mode);
    localStorage.setItem("profileMode", mode);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
    // You can keep or clear profileMode here; for now we keep it.
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

      {showSplash && <Splash onFinish={finishSplash} brand="Job Matching" />}

      {view === "landing" && (
        <LandingHero
          onExplore={onExplore}
          onLogin={onLogin}
          onCreate={onCreate}
        />
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

      {view === "profile" && userRole && (
        <div className="grid min-h-screen place-items-center px-4">
          <ProfileView
            userRole={userRole}
            profileMode={profileMode}
            onProfileModeChange={handleProfileModeChange}
            onBackToDiscover={() => setView("discover")}
            onLogout={handleLogout}
          />
        </div>
      )}

      {view === "discover" && (
        <DiscoverView
          userRole={userRole}
          profileMode={profileMode}
          onLogout={handleLogout}
          onEditProfile={() => setView("profile")}
        />
      )}
    </main>
  );
}
