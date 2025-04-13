"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignInWithGoogle() {
    const handleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

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
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    return (
        <button
            onClick={handleSignIn}
            className="w-full h-10 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-200 transition-colors"
        >
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" // Replace with your image URL
                alt="Google Logo"
                className="w-6 h-6" // Adjust size as needed
            />
            Sign in with Google
        </button>
    );
}
