"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRecycler } from "@/lib/hooks/useRecycler";
import { db } from "@/lib/firebase/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

interface Bin {
    id: string;
    binId: string;
    name: string;
    location: {
        address: string;
        geoPoint: {
            latitude: number;
            longitude: number;
        };
    };
    city: string;
    currentCapacity: number;
    maxCapacity: number;
    status: "active" | "full" | "inactive";
}

export default function BinsPage() {
    const { user } = useAuth();
    const { recycler } = useRecycler();
    const [activeTab, setActiveTab] = useState("my-bins");
    const [myBins, setMyBins] = useState<Bin[]>([]);
    const [allBins, setAllBins] = useState<Bin[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [openMenuContextID, setOpenMenuContextID] = useState<string | null>(null);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [showReportConfirmation, setShowReportConfirmation] = useState(false);
    const [binToMarkFull, setBinToMarkFull] = useState<string | null>(null);
    const [binToRemove, setBinToRemove] = useState<string | null>(null);
    const [isReporting, setIsReporting] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            // Don't close if clicking inside the dropdown or its trigger
            if (target.closest(".dropdown-menu") || target.closest(".dropdown-trigger")) {
                return;
            }
            setOpenMenuContextID(null);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch all bins and user's bins
    useEffect(() => {
        const fetchBins = async () => {
            if (!user || !recycler) return;

            try {
                // Fetch user's bins
                const userBinPromises = (recycler.binIds || []).map((id) =>
                    getDoc(doc(db, "bins", id))
                );
                const userBinDocs = await Promise.all(userBinPromises);
                const userBins = userBinDocs
                    .filter((doc) => doc.exists())
                    .map((doc) => ({ id: doc.id, ...doc.data() } as Bin));
                setMyBins(userBins);

                // Fetch all bins
                const allBinsSnapshot = await getDocs(collection(db, "bins"));
                const allBinsData = allBinsSnapshot.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as Bin)
                );
                setAllBins(allBinsData);
            } catch (error) {
                console.error("Error fetching bins:", error);
            } finally {
                //setLoading(false);
            }
        };

        fetchBins();
    }, [user, recycler]);

    const handleAddBin = async (binId: string) => {
        if (!user) return;

        try {
            await updateDoc(doc(db, "recyclers", user.uid), {
                binIds: arrayUnion(binId),
            });
            console.log("Bin added");
        } catch (error) {
            console.error("Error adding bin:", error);
        }
    };

    const handleRemoveBinClick = (id: string) => {
        setBinToRemove(id);
        setShowRemoveConfirmation(true);
        setOpenMenuContextID(null);
    };

    const handleRemoveBin = async (id: string) => {
        if (!user) return;
        setIsRemoving(true);

        try {
            await updateDoc(doc(db, "recyclers", user.uid), {
                binIds: arrayRemove(id),
            });
            setShowRemoveConfirmation(false);
            setBinToRemove(null);
            setOpenMenuContextID(null);
        } catch (error) {
            alert("Error removing bin: " + error);
        } finally {
            setIsRemoving(false);
        }
    };

    const handleBinFull = (id: string) => {
        setBinToMarkFull(id);
        setShowReportConfirmation(true);
        setOpenMenuContextID(null);
    };

    const confirmBinFull = async () => {
        if (!binToMarkFull) return;
        setIsReporting(true);

        try {
            await updateDoc(doc(db, "bins", binToMarkFull), {
                status: "full",
            });

            // Update local state
            setMyBins((prevBins) =>
                prevBins.map((bin) => (bin.id === binToMarkFull ? { ...bin, status: "full" } : bin))
            );

            setAllBins((prevBins) =>
                prevBins.map((bin) => (bin.id === binToMarkFull ? { ...bin, status: "full" } : bin))
            );
        } catch (error) {
            alert("Error marking bin as full: " + error);
        } finally {
            setIsReporting(false);
            setShowReportConfirmation(false);
            setBinToMarkFull(null);
        }
    };

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-center text-gray-600">Please sign in to view bins.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Bins</h1>

            {/* Remove Bin Confirmation Dialog */}
            {showRemoveConfirmation && binToRemove && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[200]">
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Bin</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove this bin from your list?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRemoveConfirmation(false);
                                    setBinToRemove(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                                disabled={isRemoving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRemoveBin(binToRemove)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                                disabled={isRemoving}
                            >
                                {isRemoving ? "Removing..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Full Bin Confirmation Dialog */}
            {showReportConfirmation && binToMarkFull && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[200]">
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Bin Full</h3>
                        <p className="text-gray-600 mb-6">
                            Send a BIN FULL notification to us and we will dispatch a rider to pick
                            it up. Click Continue only if you are sure the bin is full.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReportConfirmation(false);
                                    setBinToMarkFull(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                                disabled={isReporting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmBinFull}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                                disabled={isReporting}
                            >
                                {isReporting ? "Reporting..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("my-bins")}
                        className={`${
                            activeTab === "my-bins"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        My Bins
                    </button>
                    <button
                        onClick={() => setActiveTab("all-bins")}
                        className={`${
                            activeTab === "all-bins"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        All Bins
                    </button>
                </nav>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bin Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                City
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(activeTab === "my-bins" ? myBins : allBins).map((bin) => (
                            <tr key={bin.binId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bin.binId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bin.location.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bin.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bin.currentCapacity}/{bin.maxCapacity}
                                </td>
                                <td
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                                        bin.status === "active" ? "text-green-500" : "text-gray-500"
                                    }`}
                                >
                                    {bin.status}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {activeTab === "my-bins" ? (
                                        <div className="flex justify-end">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuContextID(
                                                            openMenuContextID === bin.id
                                                                ? null
                                                                : bin.id
                                                        );
                                                    }}
                                                    className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none dropdown-trigger"
                                                >
                                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                                </button>
                                                {openMenuContextID === bin.id && (
                                                    <div
                                                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[200] dropdown-menu"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div
                                                            className="py-1 flex flex-col"
                                                            role="menu"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleRemoveBinClick(bin.id);
                                                                }}
                                                                className="text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Remove Bin
                                                            </button>
                                                            {bin.status === "active" ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleBinFull(bin.id);
                                                                        setOpenMenuContextID(null);
                                                                    }}
                                                                    className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    role="menuitem"
                                                                >
                                                                    Report full Bin
                                                                </button>
                                                            ) : (
                                                                <div className="text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                                                                    {bin.status === "full"
                                                                        ? "Bin is full"
                                                                        : "Under Maintenance"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : recycler?.binIds?.includes(bin.id) ? (
                                        <span className="text-gray-400">Added</span>
                                    ) : (
                                        <button
                                            onClick={() => handleAddBin(bin.id)}
                                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={bin.status === "active" ? false : true}
                                        >
                                            {/* <PlusIcon className="h-4 w-4 mr-1" /> */}
                                            Add
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
