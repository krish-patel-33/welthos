"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Lock, LogIn, Loader2, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-[420px] relative z-10 transition-all duration-300 transform scale-100 hover:scale-[1.01]">
        <Card className="border border-slate-700/60 bg-slate-800/80 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden p-1.5">
          <CardHeader className="pt-8 pb-6 px-8 text-center border-b border-slate-700/50">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mb-5 ring-1 ring-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] transform rotate-3">
              <LogIn className="w-7 h-7 text-blue-400 transform -rotate-3" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white mb-2">Welcome back</CardTitle>
            <CardDescription className="text-slate-400 text-[15px]">
              Sign in to your personal dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pt-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5 group">
                <label className="text-[14px] font-medium text-slate-300 ml-1 group-focus-within:text-blue-400 transition-colors" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-[18px] w-[18px] text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 rounded-xl hover:bg-slate-900/80 transition-all font-medium text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-2.5 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[14px] font-medium text-slate-300 group-focus-within:text-blue-400 transition-colors" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[13px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 rounded-xl hover:bg-slate-900/80 transition-all font-medium font-mono text-[15px]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 mt-2 text-sm text-rose-300 bg-rose-500/10 rounded-xl border border-rose-500/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-rose-400" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8V13M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-semibold text-[15px] rounded-xl transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 group overflow-hidden relative"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 w-full">
                      <span>Sign In to Welthos</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
