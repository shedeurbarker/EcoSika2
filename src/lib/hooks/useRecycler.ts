import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "./useAuth";

export interface Recycler {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    walletBalance: number;
    pendingBalance: number;
    mobileProvider: string | null;
    mobileNumber: string | null;
    createdAt: any;
    lastLoginAt: any;
    totalBottlesRecycled: number;
    monthlyBottlesRecycled: number;
    totalEarnings: number;
    monthlyEarnings: number;
    totalCO2Saved: number;
    treesEquivalent: number;
    currentStreak: number;
    longestStreak: number;
    achievements: string[];
    notifications: {
        priceAlerts: boolean;
        payoutConfirmations: boolean;
        binPickupReminders: boolean;
    };
    binIds: string[];
}

export function useRecycler() {
    const { user } = useAuth();
    const [recycler, setRecycler] = useState<Recycler | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setRecycler(null);
            setLoading(false);
            return;
        }

        const recyclerRef = doc(db, "recyclers", user.uid);
        const unsubscribe = onSnapshot(
            recyclerRef,
            (doc) => {
                if (doc.exists()) {
                    setRecycler(doc.data() as Recycler);
                } else {
                    setError("Recycler profile not found");
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching recycler:", error);
                setError(error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return { recycler, loading, error };
}
