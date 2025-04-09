"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRecycler } from "@/lib/hooks/useRecycler";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import EmailSignIn from "@/components/auth/EmailSignIn";
import Link from "next/link";
import {
    CameraIcon,
    InformationCircleIcon,
    MapPinIcon,
    ExclamationCircleIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { FireIcon, BuildingOfficeIcon } from "@heroicons/react/24/solid";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

// UI-specific data that doesn't come from Firestore
const mockData = {
    bottleRate: 0.03,
    recentTransactions: [
        { date: "June 15", amount: 3.0, bottles: 100, rate: 0.03 },
        { date: "June 14", amount: 2.1, bottles: 70, rate: 0.03 },
    ],
    notifications: [
        { type: "price", message: "Rate increased to ₵0.035/bottle!" },
        { type: "system", message: "New bins added near you!" },
    ],
    monthlyChallenge: {
        target: 500,
        current: 320,
        bonus: 10,
    },
    nearbyBins: [
        {
            id: "AC104",
            location: "Adenta Market",
            fillLevel: 65,
            maxCapacity: 100,
            distance: 1.2,
            status: "medium",
        },
        {
            id: "AC105",
            location: "East Legon",
            fillLevel: 20,
            maxCapacity: 100,
            distance: 2.5,
            status: "low",
        },
        {
            id: "AC106",
            location: "Tema Community 1",
            fillLevel: 85,
            maxCapacity: 100,
            distance: 3.8,
            status: "high",
        },
    ],
};

interface Stats {
    walletBalance: number;
    mobileProvider: string;
    monthlyEarnings: number;
    bottlesRecycled: number;
    co2Saved: number;
    pavementBlocks: number;
    treesEquivalent: number;
    totalEarnings: number;
}

export default function Home() {
    const { user } = useAuth();
    const { recycler, loading } = useRecycler();
    const [activeTab, setActiveTab] = useState("stats");
    const [stats, setStats] = useState<Stats>({
        walletBalance: 0,
        mobileProvider: "",
        monthlyEarnings: 0,
        bottlesRecycled: 0,
        co2Saved: 0,
        pavementBlocks: 0,
        treesEquivalent: 0,
        totalEarnings: 0,
    });

    // Calculate progress percentage for monthly challenge
    const challengeProgress =
        (mockData.monthlyChallenge.current / mockData.monthlyChallenge.target) * 100;

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                const recyclerDoc = await getDoc(doc(db, "recyclers", user.uid));
                if (recyclerDoc.exists()) {
                    const data = recyclerDoc.data();
                    setStats({
                        walletBalance: data.walletBalance || 0,
                        mobileProvider: data.mobileProvider || "",
                        monthlyEarnings: data.monthlyEarnings || 0,
                        bottlesRecycled: data.totalBottlesRecycled || 0,
                        co2Saved: data.totalCO2Saved || 0,
                        pavementBlocks: data.communityImpact || 0,
                        treesEquivalent: data.treesEquivalent || 0,
                        totalEarnings: data.totalEarnings || 0,
                    });
                }
            }
        };

        fetchStats();
    }, [user]);

    if (!user) {
        return (
            <main className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-4xl font-bold text-center text-gray-900">
                        Welcome to EcoSika
                    </h1>

                    <div className="space-y-6">
                        <p className="text-center text-gray-600">Please sign in to continue</p>
                        <div className="max-w-md mx-auto space-y-4">
                            <SignInWithGoogle />
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or</span>
                                </div>
                            </div>
                            <EmailSignIn />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // if (loading || !recycler) {
    //     return (
    //         <main className="min-h-screen p-8">
    //             <div className="max-w-4xl mx-auto">
    //                 <p className="text-center text-gray-600">Loading your profile...</p>
    //             </div>
    //         </main>
    //     );
    // }

    return (
        <main className="min-h-screen pb-24">
            {/* Wallet & Earnings Summary */}
            <section className="bg-white shadow-sm p-6 mb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Wallet Balance */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-600">Your Balance</h2>
                                <div className="flex items-center bg-white px-2 py-1 rounded-full text-xs text-gray-600">
                                    <span>{stats.mobileProvider || "No Provider"}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ₵{stats.walletBalance.toFixed(2)}
                            </p>
                        </div>

                        {/* Current Price per Bottle */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-600">
                                    Today&apos;s Rate
                                </h2>
                                <button className="text-blue-500 hover:text-blue-700">
                                    <InformationCircleIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ₵{mockData.bottleRate.toFixed(2)}
                                <span className="text-lg">/bottle</span>
                            </p>
                        </div>

                        {/* Earnings This Month */}
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-600">
                                    {new Date().toLocaleString("default", { month: "long" })}{" "}
                                    Earnings
                                </h2>
                                <span className="text-xs text-gray-500">
                                    vs.{" "}
                                    {new Date(
                                        new Date().setMonth(new Date().getMonth() - 1)
                                    ).toLocaleString("default", { month: "long" })}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ₵{stats.monthlyEarnings.toFixed(2)}
                            </p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            (stats.monthlyEarnings / stats.totalEarnings) * 100,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Primary Action Button - Scan Bottles */}
            <div className="fixed bottom-20 right-8 z-100">
                <Link href="/bottles">
                    <button className="bg-green-700 text-white rounded-full p-4 shadow-lg flex flex-col items-center">
                        <CameraIcon className="h-10 w-8" />
                        <span className="text-xs mt-1">Scan Bottles</span>
                    </button>
                </Link>
            </div>

            {/* Nearby Bins Map & Quick Stats Tabs */}
            <section className="mb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("stats")}
                                className={`${
                                    activeTab === "stats"
                                        ? "border-green-500 text-green-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <SparklesIcon className="mr-2" />
                                Quick Stats
                            </button>
                            <button
                                onClick={() => setActiveTab("map")}
                                className={`${
                                    activeTab === "map"
                                        ? "border-green-500 text-green-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <MapPinIcon className="mr-2" />
                                Nearby Bins
                            </button>
                        </nav>
                    </div>

                    {/* Map Tab Content */}
                    {activeTab === "map" && (
                        <div className="py-4">
                            <div className="bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center">
                                <p className="text-gray-500">Interactive Map Coming Soon</p>
                            </div>

                            <div className="space-y-3">
                                {mockData.nearbyBins.map((bin) => (
                                    <div
                                        key={bin.id}
                                        className="bg-white p-4 rounded-lg shadow-sm border-l-4 cursor-pointer"
                                        style={{
                                            borderLeftColor:
                                                bin.status === "low"
                                                    ? "#10B981"
                                                    : bin.status === "medium"
                                                    ? "#F59E0B"
                                                    : "#EF4444",
                                        }}
                                        //onClick={() => setSelectedBin(bin)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {bin.location}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {bin.distance}km away
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {bin.fillLevel}% full
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Max: {bin.maxCapacity}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Tab Content */}
                    {activeTab === "stats" && (
                        <div className="py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Total Bottles Recycled */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <SparklesIcon className="text-green-500 mr-2" />
                                        <h3 className="font-medium text-gray-900">
                                            Total Bottles Recycled
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.bottlesRecycled.toLocaleString()} bottles 🌍
                                    </p>
                                </div>

                                {/* Community Impact */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <BuildingOfficeIcon className="text-blue-500 mr-2" />
                                        <h3 className="font-medium text-gray-900">
                                            Community Impact
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {Math.floor(stats.bottlesRecycled / 100)} pavement blocks
                                        built 🧱
                                    </p>
                                </div>

                                {/* Environmental Impact */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <FireIcon className="text-green-500 mr-2" />
                                        <h3 className="font-medium text-gray-900">
                                            Environmental Impact
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.co2Saved}kg CO2 saved 🌳
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Equivalent to {stats.treesEquivalent} trees planted
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Activity Feed */}
            <section className="mb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {mockData.recentTransactions.map((transaction, index) => (
                                <div key={index} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {transaction.bottles} bottles recycled
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {transaction.date}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-green-600">
                                            +₵{transaction.amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Progress & Goals */}
            <section className="mb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Progress & Goals</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly Challenge */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Monthly Challenge</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Recycle {mockData.monthlyChallenge.target} bottles this month →
                                Unlock ₵{mockData.monthlyChallenge.bonus} bonus!
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>
                                    {mockData.monthlyChallenge.current}/
                                    {mockData.monthlyChallenge.target} bottles
                                </span>
                                <span>{Math.round(challengeProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${challengeProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Environmental Impact */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Environmental Impact</h3>
                            <p className="text-sm text-gray-600">
                                You&apos;ve saved {stats.co2Saved}kg of CO2 – equivalent to{" "}
                                {stats.treesEquivalent} trees planted 🌳
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Environmental Impact Summary */}
            <section className="mb-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Your Environmental Impact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">CO2 Saved</h3>
                                    <BuildingOfficeIcon className="h-5 w-5 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.co2Saved}kg
                                </p>
                                <p className="text-sm text-gray-600">
                                    You&apos;ve saved {stats.co2Saved}kg of CO2 –
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">
                                        Trees Equivalent
                                    </h3>
                                    <SparklesIcon className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.treesEquivalent}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Your recycling equals {stats.treesEquivalent} trees planted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seed Bins Section - Only visible to authenticated users */}
            {/* <section className="max-w-7xl mx-auto px-4 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Developer Tools</h2>
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch("/api/seed-bins");
                                const data = await response.json();
                                alert(data.message);
                            } catch (error) {
                                alert("Error seeding bins: " + error);
                            }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Seed 5 Bins
                    </button>
                </div>
            </section> */}
        </main>
    );
}
