"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    if (!token) {
        return (
            <div className="space-y-6 text-center">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <p className="text-sm text-rose-200">
                        Invalid or missing reset token. Please request a new password reset link.
                    </p>
                </div>
                <Link href="/forgot-password">
                    <Button variant="outline" className="w-full h-12 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl">
                        Request new link
                    </Button>
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password.");
            }

            setSuccess(true);
            // Wait a moment then redirect
            setTimeout(() => {
                router.push("/sign-in");
            }, 3000);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-white">Password Reset!</h3>
                        <p className="text-sm text-emerald-200">
                            Your password has been successfully updated. Redirecting you to sign in...
                        </p>
                    </div>
                </div>
                <Link href="/sign-in">
                    <Button variant="outline" className="w-full h-12 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl">
                        Sign In Now
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5 group">
                <label className="text-[14px] font-medium text-slate-300 ml-1 group-focus-within:text-blue-400 transition-colors" htmlFor="password">
                    New Password
                </label>
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

            <div className="space-y-2.5 group">
                <label className="text-[14px] font-medium text-slate-300 ml-1 group-focus-within:text-blue-400 transition-colors" htmlFor="confirmPassword">
                    Confirm Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-[18px] w-[18px] text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-12 h-14 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 rounded-xl hover:bg-slate-900/80 transition-all font-medium font-mono text-[15px]"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 mt-2 text-sm text-rose-300 bg-rose-500/10 rounded-xl border border-rose-500/20 backdrop-blur-sm animate-in fade-in flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
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
                            <span>Resetting Password...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 w-full">
                            <span>Update Password</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="fixed inset-0 z-[100] h-screen w-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-[420px] relative z-10 transition-all duration-300 transform scale-100 hover:scale-[1.01]">
                <Card className="border border-slate-700/60 bg-slate-800/80 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden p-1.5">
                    <CardHeader className="pt-8 pb-6 px-8 text-center border-b border-slate-700/50">
                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mb-5 ring-1 ring-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] transform rotate-3">
                            <Lock className="w-7 h-7 text-blue-400 transform -rotate-3" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white mb-2">Create New Password</CardTitle>
                        <CardDescription className="text-slate-400 text-[15px]">
                            Please enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pt-8 pb-8">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
