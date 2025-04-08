"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface PriceHistory {
    date: string;
    price: number;
}

export default function PricingPage() {
    const { user } = useAuth();
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [timeRange, setTimeRange] = useState<"week" | "month">("week");

    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                const pricesQuery = query(
                    collection(db, "prices"),
                    orderBy("timestamp", "desc"),
                    limit(1)
                );
                const snapshot = await getDocs(pricesQuery);
                if (!snapshot.empty) {
                    const price = snapshot.docs[0].data().price;
                    setCurrentPrice(price);
                }
            } catch (error) {
                console.error("Error fetching current price:", error);
            }
        };

        const fetchPriceHistory = async () => {
            try {
                const startDate = new Date();
                if (timeRange === "week") {
                    startDate.setDate(startDate.getDate() - 7);
                } else {
                    startDate.setMonth(startDate.getMonth() - 1);
                }

                const historyQuery = query(
                    collection(db, "prices"),
                    where("timestamp", ">=", startDate),
                    orderBy("timestamp", "asc")
                );
                const snapshot = await getDocs(historyQuery);

                const history = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        date: new Date(data.timestamp.toDate()).toLocaleDateString(),
                        price: data.price,
                    };
                });

                setPriceHistory(history);
            } catch (error) {
                console.error("Error fetching price history:", error);
            }
        };

        fetchCurrentPrice();
        fetchPriceHistory();
    }, [timeRange]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Please sign in to view pricing</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Pricing Dashboard</h1>
                <p className="mt-2 text-sm text-gray-500">
                    View current rates and historical price trends
                </p>
            </div>

            {/* Current Price Card */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Current Rate</h2>
                <p className="text-4xl font-bold text-green-600">
                    ₵{currentPrice.toFixed(2)}
                    <span className="text-lg font-normal text-gray-500">/bottle</span>
                </p>
            </div>

            {/* Price History Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Price History</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setTimeRange("week")}
                            className={`px-4 py-2 rounded-md ${
                                timeRange === "week"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setTimeRange("month")}
                            className={`px-4 py-2 rounded-md ${
                                timeRange === "month"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={priceHistory}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                domain={["auto", "auto"]}
                                tickFormatter={(value) => `₵${value.toFixed(2)}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`₵${value.toFixed(2)}`, "Price"]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#059669"
                                strokeWidth={2}
                                dot={{ fill: "#059669" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
