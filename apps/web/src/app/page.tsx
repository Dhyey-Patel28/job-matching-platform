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

type LoginUser = {
  id: string;
  role: Role;
  profileMode: ProfileMode;
  emailVerified?: boolean;
};

export default function AppPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [profileMode, setProfileMode] = useState<ProfileMode>("candidate");
  const [emailVerified, setEmailVerified] = useState<boolean | undefined>(undefined);

  // UI state
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("landing");

  // Toast
  const [toast, setToast] = useState<string | null>(null);

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
    const storedId = localStorage.getItem("userId");

    if (remembered === "true" && role && storedId) {
      setIsLoggedIn(true);
      setUserId(storedId);
      setUserRole(role);
      setProfileMode(
        storedMode ?? (role === "candidate" ? "candidate" : "employer"),
      );
      // Returning visitors go straight to discovery
      setView("discover");
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setUserRole(null);
      setView("landing");
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: LoginUser, remember: boolean) => {
    const { id, role, profileMode, emailVerified: verifiedFlag } = user;

    // Persist basic auth info
    localStorage.setItem("userId", id);
    localStorage.setItem("role", role);
    localStorage.setItem("profileMode", profileMode);
    if (remember) {
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
    }

    setUserId(id);
    setUserRole(role);
    setProfileMode(profileMode);
    setEmailVerified(
      typeof verifiedFlag === "boolean" ? verifiedFlag : undefined,
    );
    setIsLoggedIn(true);
    // After a fresh login, send them to profile setup first
    setView("profile");
  };

  const handleProfileModeChange = (mode: ProfileMode) => {
    setProfileMode(mode);
    localStorage.setItem("profileMode", mode);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Failed to hit logout API", e);
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole(null);
    setEmailVerified(undefined);
    setView("landing");

    setToast("You’ve been signed out.");
    window.setTimeout(() => setToast(null), 2500);
  };

  const onExplore = () => setView(isLoggedIn ? "discover" : "login");
  const onLogin = () => setView("login");
  const onCreate = () => setView("register");

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppBackground />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
          <div className="pointer-events-auto rounded-full bg-black/80 px-4 py-2 text-xs font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

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
          <LoginPage
            onLogin={handleLogin}
            onShowRegister={() => setView("register")}
          />
        </div>
      )}

      {view === "register" && (
        <div className="grid min-h-screen place-items-center px-4">
          <RegisterCard onBack={() => setView("login")} />
        </div>
      )}

      {view === "profile" && userRole && userId && (
        <div className="grid min-h-screen place-items-center px-4">
          <ProfileView
            userId={userId}
            userRole={userRole}
            profileMode={profileMode}
            onProfileModeChange={handleProfileModeChange}
            onBackToDiscover={() => setView("discover")}
            onLogout={handleLogout}
            emailVerified={emailVerified ?? undefined}
          />
        </div>
      )}

      {view === "discover" && userId && userRole && (
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
