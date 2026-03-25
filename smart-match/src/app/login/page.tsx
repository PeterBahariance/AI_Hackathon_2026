"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const BOARD_ROLES = [
    "Member", "Volunteer", "President", "President Elect", "Secretary", "Treasurer",
    "Treasurer Elect", "Co-Director of Membership", "Director of Communications",
    "Director of Events", "Director of Inclusion & Diversity", "Director of New Professionals",
    "Director of Partnerships", "Director of Regional Engagement", "Metro Director",
];

const METRO_REGIONS = [
    "Los Angeles — West", "Los Angeles — East", "Los Angeles — North",
    "Los Angeles — Long Beach", "San Diego", "San Francisco", "Seattle",
    "Portland", "Ventura / Thousand Oaks",
];

const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#471f8d] focus:ring-2 focus:ring-[#471f8d]/20 transition-all";

const selectClass =
    "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#471f8d] focus:ring-2 focus:ring-[#471f8d]/20 transition-all appearance-none bg-white cursor-pointer";

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Derived state: Syncs the UI automatically when the URL changes
    const isLogin = searchParams.get("mode") !== "signup";
    
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [region, setRegion] = useState("");
    const [expertise, setExpertise] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // SEAMLESS SWITCH: Updates the URL, which then re-renders the page via searchParams
    const handleSwitchMode = (e: React.MouseEvent) => {
        e.preventDefault();
        setError("");
        if (isLogin) {
            router.push("/login?mode=signup");
        } else {
            router.push("/login");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await updateDoc(doc(db, "users", userCredential.user.uid), {
                    lastLoginAt: serverTimestamp(),
                });
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username,
                    email,
                    role,
                    metroRegion: region,
                    expertise: expertise || '',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                });
            }
            router.push("/");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: "#471f8d" }}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {isLogin ? "Sign in to access the dashboard" : "Join Insight Associations West"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input type="text" required className={inputClass} placeholder="Your display name" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select required className={selectClass} value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="" disabled>Select role</option>
                                        {BOARD_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metro Region</label>
                                    <select required className={selectClass} value={region} onChange={(e) => setRegion(e.target.value)}>
                                        <option value="" disabled>Select region</option>
                                        {METRO_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expertise <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input type="text" className={inputClass} placeholder="e.g., data analytics, brand strategy, AI" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
                            </div>
                            <hr className="border-gray-100" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input type="email" required className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" required className={inputClass} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 mt-2 cursor-pointer" style={{ backgroundColor: "#471f8d" }}>
                        {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button" 
                            onClick={handleSwitchMode}
                            className="ml-1 font-semibold hover:opacity-80 transition-colors cursor-pointer"
                            style={{ color: "#471f8d" }}
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </p>
                    <Link href="/" className="inline-block text-sm text-gray-400 hover:text-gray-600 cursor-pointer">&larr; Back to home</Link>
                </div>
            </div>
        </div>
    );
}

// THE ONLY DEFAULT EXPORT
export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="text-[#471f8d] font-bold">Loading...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    );
}