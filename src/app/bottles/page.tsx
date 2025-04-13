"use client";

import { useState, useEffect, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useAuth } from "@/lib/hooks/useAuth";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    getDoc,
    doc,
    orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { CameraIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface ScannedBottle {
    id: string;
    timestamp: Date;
}

interface Bin {
    id: string;
    binId: string;
    location: {
        address: string;
    };
}

interface BottlesRecycled {
    id: string;
    date: Date;
    total: number;
    earnings: number;
    status: "pending" | "credited" | "rejected";
}

export default function ScanPage() {
    const { user } = useAuth();
    const [selectedBin, setSelectedBin] = useState<string | null>(null);
    const [totalBottles, setTotalBottles] = useState<number | 0>(0);
    const [bins, setBins] = useState<Bin[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBulkUpload, setBulkUpload] = useState(false);
    const [isScanUpload, setScanUpload] = useState(false);
    const [bottlesRecycled, setBottlesRecycled] = useState<BottlesRecycled[]>([]);
    const [activeTab, setActiveTab] = useState("scan");
    const [isOnline, setIsOnline] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedBottles, setScannedBottles] = useState<ScannedBottle[]>([]);

    // Check if user is online
    useEffect(() => {
        const handleOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener("online", handleOnlineStatus);
        window.addEventListener("offline", handleOnlineStatus);

        handleOnlineStatus();
        return () => {
            window.removeEventListener("online", handleOnlineStatus);
            window.removeEventListener("offline", handleOnlineStatus);
        };
    }, []);

    // Fetch bins
    useEffect(() => {
        if (user) {
            const fetchBins = async () => {
                const binsQuery = query(collection(db, "bins")); //where("userId", "==", user.uid)
                const binsSnapshot = await getDocs(binsQuery);
                const binsData = binsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Bin[];
                setBins(binsData);
                console.log(binsData);
            };

            fetchBins();
        }
    }, [user]);

    // Fetch bottles
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch bottles recycles
            const bottlesQuery = query(
                collection(db, "bottles"),
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
            );
            const bottleSnapshot = await getDocs(bottlesQuery);

            const bottlesList = bottleSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.timestamp.toDate(),
                    total: data.total,
                    earnings: data.earnings,
                    status: data.status,
                };
            });

            setBottlesRecycled(bottlesList);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            //  setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const config = {
        qrbox: {
            width: 250,
            height: 250,
        },
        fps: 30,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        useBarCodeDetectorIfSupported: true,
        aspectRatio: 1.7777778,
    };

    let scanner: Html5QrcodeScanner | null = null;

    const scanMethod = () => {
        if (isOnline && user) {
            scanner = new Html5QrcodeScanner("reader", config, false);
        }
    };

    // Scan bottles
    const startScan = useCallback(
        async (status: boolean) => {
            if (isOnline && user) {
                if (!status && scanner !== null) {
                    scanner?.clear();
                } else {
                    scanMethod();
                    if (scanner !== null) {
                        scanner.render(
                            (decodedText: string) => onScanSuccess(decodedText),
                            onScanError
                        );
                    }
                }
            } else {
                console.log("offline");
            }
        },
        [isOnline, user]
    );

    const onScanSuccess = (decodedText: string) => {
        const onScanSuccess = (decodedText: string) => {
            setScannedBottles([...scannedBottles, { id: decodedText, timestamp: new Date() }]);
        };
    };

    const onScanError = (error: any) => {
        //console.error("Scan error:", error);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-400">Loading...</p>
                <div id="reader" className="hidden"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Recycle Bottles</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                {/* selector buttons */}
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setBulkUpload(isBulkUpload);
                            setActiveTab("bulk");
                        }}
                        className={`${
                            activeTab === "bulk"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        } px-4 py-2 rounded-md mr-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                    >
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => {
                            setScanUpload(isScanUpload);
                            setActiveTab("scan");
                        }}
                        className={`${
                            activeTab === "scan"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                    >
                        Scan Bottles
                    </button>
                </div>
                {/* Bulk Upload */}
                {activeTab === "bulk" && (
                    <div>
                        <p className="text-lg font-medium text-gray-900 mb-4">
                            Upload a list of Bottles you have packaged.
                        </p>
                        <form className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <select
                                        id="selectedBin"
                                        value={selectedBin ?? "Select Bin"}
                                        onChange={(e) => setSelectedBin(e.target.value)}
                                        className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                    >
                                        <option value="">Select Bin</option>
                                        {bins.map((bin) => (
                                            <option value={bin.id} key={bin.id}>
                                                {`${bin.binId} - ${bin.location.address}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="totalBottles"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Number of Bottles in this Batch
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={totalBottles}
                                        onChange={(e) => setTotalBottles(e.target.valueAsNumber)}
                                        className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                        required
                                        min="0"
                                        step="1"
                                        placeholder="Total bottles"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        //onClick={}
                                        disabled={
                                            isSubmitting ||
                                            totalBottles <= 0 ||
                                            !selectedBin ||
                                            !totalBottles
                                        }
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Submitting Bottles..." : "Submit Bottles"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Scan Bottles */}
                <div className={`${activeTab === "scan" ? "block" : "hidden"}`}>
                    <div className="bg-white rounded-lg shadow-md mt-8 p-4 mb-6 text-gray-400 w-full h-full">
                        <div id="reader"></div>
                    </div>

                    {/* start scan button */}
                    <div className="flex justify-center wrow-span-1">
                        <button
                            onClick={() => {
                                if (isScanning) {
                                    startScan(false); // stop scan
                                    setIsScanning(false);
                                } else {
                                    startScan(true); //
                                    setIsScanning(true);
                                }
                            }}
                            className={`${
                                !isScanning
                                    ? "bg-orange-600 text-white hover:bg-orange-700"
                                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            } px-4 py-2 rounded-md mr-6 focus:outline-none h-24 w-24 mt-5`}
                        >
                            {isScanning ? "Stop Scan" : "Start Scan"}
                        </button>
                        <div className="bg-white rounded-lg shadow-md p-0 mb-0 text-black w-36 h-36">
                            <div className="text-center text-gray-400">Bottles Scanned</div>
                            <div className="text-black-800 text-8xl font-bold text-center">0</div>
                            {scannedBottles.map((bottle) => (
                                <div key={bottle.id}>{bottle.id}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottles History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Bottles Recycled</h2>

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
                                    Bottles
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Earnings₵
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
                            {bottlesRecycled.length > 0 ? (
                                bottlesRecycled.map((bottles) => (
                                    <tr key={bottles.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {bottles.date.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span>{bottles.total < 0 ? "-" : "+"}₵</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Math.abs(bottles.earnings).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    bottles.status === "credited"
                                                        ? "bg-green-100 text-green-800"
                                                        : bottles.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {bottles.status}
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
                                        No bottle recycled yet
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
