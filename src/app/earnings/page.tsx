"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Link from "next/link";

interface Withdrawal {
    id: string;
    date: Date;
    amount: number;
    status: "pending" | "completed" | "failed";
    phoneNumber: string;
}

interface WalletBalance {
    total: number;
    available: number;
    pending: number;
}

interface Recycler {
    walletBalance: number;
    pendingBalance: number;
    mobileProvider: string | null;
    mobileNumber: string | null;
}

export default function EarningsPage() {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [recycler, setRecycler] = useState<Recycler | null>(null);
    const [balance, setBalance] = useState<WalletBalance>({
        total: 0,
        available: 0,
        pending: 0,
    });
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    // const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch recycler data
            const recyclerDoc = await getDoc(doc(db, "recyclers", user.uid));
            if (recyclerDoc.exists()) {
                setRecycler(recyclerDoc.data() as Recycler);
                setBalance({
                    total: recyclerDoc.data().totalEarnings || 0,
                    available: recyclerDoc.data().walletBalance || 0,
                    pending: recyclerDoc.data().pendingBalance || 0,
                });
            }

            // Fetch withdrawals for transaction history
            const withdrawalsQuery = query(
                collection(db, "withdrawals"),
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
            );
            const withdrawalsSnapshot = await getDocs(withdrawalsQuery);

            const withdrawalsList = withdrawalsSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.timestamp.toDate(),
                    amount: data.amount,
                    status: data.status,
                    phoneNumber: data.phoneNumber || "N/A",
                };
            });

            setWithdrawals(withdrawalsList);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            //  setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleWithdrawal = async () => {
        if (!user || !recycler) return;

        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (amount > recycler.walletBalance) {
            alert("Insufficient balance");
            return;
        }

        if (!recycler.mobileNumber) {
            alert("Please set up your payment details first");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create withdrawal request
            const withdrawalRef = await addDoc(collection(db, "withdrawals"), {
                userId: user.uid,
                amount: amount,
                provider: recycler.mobileProvider,
                phoneNumber: recycler.mobileNumber,
                status: "pending",
                timestamp: serverTimestamp(),
            });

            // Update recycler's wallet balance and pending balance
            await updateDoc(doc(db, "recyclers", user.uid), {
                walletBalance: increment(-amount),
                pendingBalance: increment(amount),
            });

            // Refresh data immediately
            await fetchData();

            setWithdrawalAmount("");
        } catch (error) {
            console.error("Error processing withdrawal:", error);
            alert("Failed to process withdrawal. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-400">Please sign in to view earnings</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">My Earnings</h1>
                <p className="mt-2 text-sm text-gray-500">
                    View your wallet balance and transaction history
                </p>
            </div>

            {/* Wallet Balance Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Balance
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        ₵{balance.total.toFixed(2)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Available Balance
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        ₵{balance.available.toFixed(2)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Pending Withdrawals
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        ₵{balance.pending.toFixed(2)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Withdraw Earnings</h2>
                    <button
                        onClick={() => setIsWithdrawing(!isWithdrawing)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        {isWithdrawing ? "Close" : "Withdraw"}
                    </button>
                </div>

                {isWithdrawing && (
                    <form onSubmit={handleWithdrawal} className="space-y-6">
                        <div>
                            <label
                                htmlFor="amount"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Amount (₵)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                required
                                min="1"
                                max={recycler?.walletBalance || 0}
                                step="0.01"
                                placeholder="Enter amount to withdraw"
                            />
                        </div>

                        {!recycler?.mobileProvider || !recycler?.mobileNumber ? (
                            <div className="text-center py-4">
                                <p className="text-gray-600 mb-2">
                                    Please set up your payment details first
                                </p>
                                <Link
                                    href="/settings"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Go to Settings
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <button
                                    onClick={handleWithdrawal}
                                    disabled={
                                        isSubmitting ||
                                        !withdrawalAmount ||
                                        parseFloat(withdrawalAmount) <= 0 ||
                                        parseFloat(withdrawalAmount) >
                                            (recycler?.walletBalance || 0)
                                    }
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting Request..." : "Submit Withdrawal"}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Amount
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Momo Number
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {withdrawals.length > 0 ? (
                                withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {withdrawal.date.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span
                                                className={
                                                    withdrawal.amount < 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }
                                            >
                                                {withdrawal.amount < 0 ? "-" : "+"}₵
                                                {Math.abs(withdrawal.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {withdrawal.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    withdrawal.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : withdrawal.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {withdrawal.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
