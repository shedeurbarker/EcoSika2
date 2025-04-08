"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface ScannedBottle {
    id: string;
    timestamp: Date;
    binId: string | null;
}

interface Bin {
    id: string;
    name: string;
    location: string;
}

export default function ScanPage() {
    const { user } = useAuth();
    const [scannedBottles, setScannedBottles] = useState<ScannedBottle[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedBin, setSelectedBin] = useState<string | null>(null);
    const [bins, setBins] = useState<Bin[]>([]);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener("online", handleOnlineStatus);
        window.addEventListener("offline", handleOnlineStatus);

        return () => {
            window.removeEventListener("online", handleOnlineStatus);
            window.removeEventListener("offline", handleOnlineStatus);
        };
    }, []);

    useEffect(() => {
        if (user) {
            const fetchBins = async () => {
                const binsQuery = query(collection(db, "bins"), where("userId", "==", user.uid));
                const binsSnapshot = await getDocs(binsQuery);
                const binsData = binsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Bin[];
                setBins(binsData);
            };

            fetchBins();
        }
    }, [user]);

    useEffect(() => {
        if (typeof window !== "undefined" && user) {
            const scanner = new Html5QrcodeScanner("reader", {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            scanner.render((decodedText: string) => onScanSuccess(decodedText), onScanError);

            return () => {
                scanner.clear().catch(console.error);
            };
        }
    }, [user]);

    const onScanSuccess = async (decodedText: string) => {
        try {
            const bottle: ScannedBottle = {
                id: decodedText,
                timestamp: new Date(),
                binId: selectedBin,
            };

            setScannedBottles((prev) => [...prev, bottle]);

            if (isOnline) {
                await addDoc(collection(db, "scannedBottles"), {
                    ...bottle,
                    userId: user?.uid,
                    timestamp: new Date(),
                });
            }
        } catch (error) {
            console.error("Error processing scan:", error);
        }
    };

    const onScanError = (error: any) => {
        console.warn(error);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg">Please sign in to scan bottles</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Scan Bottles</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bin</label>
                <select
                    value={selectedBin || ""}
                    onChange={(e) => setSelectedBin(e.target.value || null)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                    <option value="">Select a bin</option>
                    {bins.map((bin) => (
                        <option key={bin.id} value={bin.id}>
                            {bin.name} - {bin.location}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-gray-400">
                <div id="reader" className="w-full"></div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-600">Scanned Bottles</h2>
                {scannedBottles.length === 0 ? (
                    <p className="text-gray-500">No bottles scanned yet</p>
                ) : (
                    <ul className="space-y-2">
                        {scannedBottles.map((bottle, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <span>Bottle ID: {bottle.id}</span>
                                <span className="text-sm text-gray-500">
                                    {bottle.timestamp.toLocaleTimeString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!isOnline && (
                <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
                    Offline Mode - Scans will be synced when online
                </div>
            )}
        </div>
    );
}
