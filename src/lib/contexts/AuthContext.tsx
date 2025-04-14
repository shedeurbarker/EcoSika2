"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User,
    onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
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
            }
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with email:", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Create new recycler document
            const recyclerRef = doc(db, "recyclers", user.uid);
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
        } catch (error) {
            console.error("Error signing up with email:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
