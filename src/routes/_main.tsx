import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/contexts/AppContext";
import { LogoMark } from "@/components/brand/Logo";

export const Route = createFileRoute("/_main")({ component: MainLayout });

function MainLayout() {
  const { ready, persona, state } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !persona) navigate({ to: "/login" });
  }, [ready, persona, navigate]);

  if (!ready || !persona || !state) {
    return <div className="grid min-h-screen place-items-center"><LogoMark className="h-12 w-12 animate-pulse" /></div>;
  }
  return <AppShell><Outlet /></AppShell>;
}
