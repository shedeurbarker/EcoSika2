"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { withAuth } from "@/components/auth/withAuth";
import Link from "next/link";
import {
    FingerPrintIcon,
    InformationCircleIcon,
    MapPinIcon,
    ArrowPathRoundedSquareIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { FireIcon, BuildingOfficeIcon, TrashIcon } from "@heroicons/react/24/solid";
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
    recyclerCode: "ABC2",
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

function HomePage() {
    const { user } = useAuth();
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

    // if (!user) {
    //     return (
    //         <main className="min-h-screen p-8">
    //             <div className="max-w-4xl mx-auto space-y-8">
    //                 <h1 className="text-4xl font-bold text-center text-gray-900">
    //                     Welcome to EcoSika
    //                 </h1>

    //                 <div className="space-y-6">
    //                     <p className="text-center text-gray-600">Please sign in to continue</p>
    //                     <div className="max-w-md mx-auto space-y-4">
    //                         <SignInWithGoogle />
    //                         <div className="relative">
    //                             <div className="absolute inset-0 flex items-center">
    //                                 <div className="w-full border-t border-gray-300" />
    //                             </div>
    //                             <div className="relative flex justify-center text-sm">
    //                                 <span className="px-2 bg-white text-gray-500">Or</span>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
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

                        {/* recycler ID */}
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-medium text-gray-600">
                                    Your Recycler&apos;s ID
                                </h2>
                                <button className="text-blue-500 hover:text-blue-700">
                                    <FingerPrintIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {mockData.recyclerCode}
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
                    <button className="bg-green-700 text-white rounded-full p-2 shadow-lg flex flex-col items-center">
                        <ArrowPathRoundedSquareIcon className="h-6 w-11" />
                        <span className="text-xs mt-1">Recycle</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Total Bottles Recycled */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <TrashIcon className="text-gray-700 mr-2" />
                                        <h3 className="font-medium text-gray-500">
                                            Total Bottles Recycled
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-500">
                                        {stats.bottlesRecycled.toLocaleString()} bottles 🌍
                                    </p>
                                </div>

                                {/* Community Impact */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <BuildingOfficeIcon className="text-gray-500 mr-2" />
                                        <h3 className="font-medium text-gray-500">
                                            Community Impact
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-500">
                                        {Math.floor(stats.bottlesRecycled / 100)} pavement blocks
                                        built 🧱
                                    </p>
                                </div>

                                {/* Environmental Impact */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        {/* <FireIcon className="text-green-500 mr-2" /> */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 735 735"
                                        >
                                            <path
                                                d="m367.5 727.4 360-360-360-360-360 360z"
                                                fill="red"
                                            />
                                            <path
                                                d="M367.5 670.3 64.7 367.5 367.5 64.7l302.8 302.8z"
                                                fill="#fff"
                                            />
                                            <g stroke="#000" strokeWidth="5">
                                                <path d="M223.7 367.2h281.2" />
                                                <path
                                                    strokeWidth="4"
                                                    d="m462.7 418 32.98 23.79-31.36 15.1 42.2 3.79-11.36 15.1h23.3l.54 16.76-294.2-1.605s49.2-14.58 57.3-8.635c10.82-4.87 89.8-38.4 89.8-36.2m-75.72-25.98 1.62-85.4-42.72-23.2s-6.49-4.33-15.68-1.62c-3.25 1.08-7.57 2.16-7.57 2.16s23.3-19.47 27.58-17.84c4.33 1.62 34.61 16.22 34.61 16.22s-3.25-22.71-11.36-29.2-39.47-31.36-39.47-31.36v-5.95l42.72 25.96s1.62-24.87-7-39.47c-8.65-14.6-15.1-27.58-15.1-27.58l2.7-2.16 21.1 32.44 7-22.2 4.33-1.08s-5.41 31.36-1.62 41.1c3.79 9.73 17.84 62.73 17.84 62.73l21.1-30.3s.54-12.44-.54-21.1c-1.08-8.65-2.7-48.67-2.7-48.67h3.79l5.95 43.8 34.1-39.47v4.33s-33.51 42.2-31.89 51.4c1.62 9.19 3.24 14.6-2.7 27.58s-9.73 22.2-9.73 22.2 17.84-21.1 25.96-22.71c8.11-.54 18.91.54 26.48-5.95s25.96-27 25.96-27l-28.66 44.3s-13.51.54-18.91 6.49c-5.41 5.95-27.58 31.36-27.58 31.36v58.4l36.76 18.38-44.87 6.49-10.82 15.68-14.6-12.44-40.62 3.735z"
                                                />
                                                <path
                                                    fill="#fff"
                                                    d="M355.2 445.1c10.29-4.29 27-11.36 36.76-25.42 10.1-14.54 45.96-75.7 95.2-70.8-2.7 6.49-11.36 20.55-11.36 20.55l35.1-10.82s.54 46.5-65.97 76.2c-30.82 10.82-37.3 11.36-40 15.1-2.7 3.79-15.1 22.71-15.1 22.71l-55.14-24.3s14.06-.515 20.51-3.215z"
                                                />
                                            </g>
                                            <ellipse cy="385.8" cx="484.3" rx="5.95" ry="5.13" />
                                        </svg>
                                        <h3 className="font-medium text-gray-500">
                                            Environmental Impact
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-500">
                                        {stats.co2Saved}kg CO
                                        <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                                            2
                                        </span>{" "}
                                        saved
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
                                    <h3 className="text-sm font-medium text-gray-600">
                                        CO
                                        <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                                            2
                                        </span>{" "}
                                        Saved
                                    </h3>
                                    <BuildingOfficeIcon className="h-5 w-5 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.co2Saved}kg
                                </p>
                                <p className="text-sm text-gray-600">
                                    You&apos;ve saved {stats.co2Saved}kg of CO
                                    <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                                        2
                                    </span>
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">
                                        Trees Equivalent
                                    </h3>
                                    <SparklesIcon className="h-5 w-5 text-green-500" />
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
        </main>
    );
}

export default withAuth(HomePage);
