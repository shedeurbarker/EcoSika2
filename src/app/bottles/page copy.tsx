"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useAuth } from "@/lib/hooks/useAuth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { CameraIcon } from "@heroicons/react/24/outline";

interface ScannedBottle {
    id: string;
    timestamp: Date;
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
    const [isOnline, setIsOnline] = useState(false);

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
        if (isOnline && user) {
            console.log("Online");
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                    fps: 30,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    useBarCodeDetectorIfSupported: true,
                    aspectRatio: 1.7777778,
                },
                false
            );
            scanner.render((decodedText: string) => onScanSuccess(decodedText), onScanError);
        } else {
            console.log("Offline");
        }
    }, [isOnline, user]);

    const onScanSuccess = (decodedText: string) => {
        setScannedBottles([...scannedBottles, { id: decodedText, timestamp: new Date() }]);
    };

    const onScanError = (error: any) => {
        //console.warn(error);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div id="reader" className="hidden"></div>
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Scan Bottles</h1>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-gray-400 w-full h-full">
                <div id="reader"></div>
            </div>
            <div className="flex justify-center">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-gray-400 w-64">
                    <h2 className="text-xl font-semibold mb-4 text-gray-600 text-center">
                        Scanned Bottles
                    </h2>

                    {scannedBottles.length === 0 ? (
                        <p className="text-gray-500 text-center">No bottles scanned yet</p>
                    ) : (
                        <p className="text-gray-500 text-center text-7xl">
                            {scannedBottles.length}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
