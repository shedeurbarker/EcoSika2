"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function EmailSignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [showResetForm, setShowResetForm] = useState(false);

    const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;

            // Check if user already exists in recyclers collection
            const recyclerRef = doc(db, "recyclers", user.uid);
            const recyclerDoc = await getDoc(recyclerRef);

            if (!recyclerDoc.exists()) {
                // Create new recycler document
                await setDoc(recyclerRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    phoneNumber: user.phoneNumber,
                    walletBalance: 0,
                    pendingBalance: 0,
                    mobileProvider: null,
                    mobileNumber: null,
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                    totalBottlesRecycled: 0,
                    monthlyBottlesRecycled: 0,
                    totalEarnings: 0,
                    monthlyEarnings: 0,
                    totalCO2Saved: 0,
                    treesEquivalent: 0,
                    communityImpact: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    achievements: [],
                    notifications: {
                        priceAlerts: true,
                        payoutConfirmations: true,
                        binPickupReminders: true,
                    },
                });
            } else {
                // Update last login
                await setDoc(
                    recyclerRef,
                    {
                        lastLoginAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }
        } catch (error: any) {
            setError(error.message || "An error occurred during authentication");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (resetPassword) {
                await resetPassword(email);
                setResetEmailSent(true);
            }
        } catch (error: any) {
            setError(error.message || "An error occurred while resetting password");
        } finally {
            setLoading(false);
        }
    };

    if (showResetForm) {
        return (
            <div className="mt-8 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                {resetEmailSent ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    Password reset email sent
                                </h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Check your email for instructions to reset your password.</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowResetForm(false)}
                                        className="text-sm font-medium text-green-600 hover:text-green-500"
                                    >
                                        Back to sign in
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label
                                htmlFor="reset-email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setShowResetForm(false)}
                                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                            >
                                Back to sign in
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {loading ? "Sending..." : "Send reset link"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
                {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="sign-up"
                            name="sign-up"
                            type="checkbox"
                            checked={isSignUp}
                            onChange={(e) => setIsSignUp(e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sign-up" className="ml-2 block text-sm text-gray-900">
                            Sign up for a new account
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm font-medium text-green-600 hover:text-green-500"
                    >
                        Forgot password?
                    </button>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                    {isSignUp
                        ? "Already have an account? Sign in"
                        : "Don't have an account? Sign up"}
                </button>
            </form>
        </div>
    );
}
