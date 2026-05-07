"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { user, loading, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            MyLink
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {user.displayName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-purple-500/30 p-0.5 overflow-hidden ring-2 ring-transparent hover:ring-purple-500/20 transition-all">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-9 w-9 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              className="rounded-full bg-slate-900 dark:bg-slate-100 text-slate-50 dark:text-slate-900 hover:opacity-90 transition-all px-6"
            >
              Google 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
