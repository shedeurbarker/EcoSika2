"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRecycler } from "@/lib/hooks/useRecycler";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import momo from "@/app/images/momo.jpg";
import Image from "next/image";

export default function SettingsPage() {
    const { user } = useAuth();
    const { recycler, loading } = useRecycler();
    const [mobileNumber, setMobileNumber] = useState("");
    const [mobileProvider, setMobileProvider] = useState("");
    const [notifications, setNotifications] = useState({
        priceAlerts: true,
        payoutConfirmations: true,
        binPickupReminders: true,
    });
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        //  if (recycler) {
        setMobileNumber(recycler?.mobileNumber || "");
        setMobileProvider(recycler?.mobileProvider || "");
        setNotifications(
            recycler?.notifications || {
                priceAlerts: true,
                payoutConfirmations: true,
                binPickupReminders: true,
            }
        );
        // }
    }, [recycler]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setSaveMessage("");

        try {
            const recyclerRef = doc(db, "recyclers", user.uid);
            await updateDoc(recyclerRef, {
                mobileNumber,
                mobileProvider,
                notifications,
            });
            setSaveMessage("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            setSaveMessage("Error saving settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-600">Mobile Money Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="mobileProvider"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mobile Money Provider
                        </label>

                        <div className="mt-2 mb-4">
                            <Image
                                src={momo}
                                alt="Mobile Money Providers: MTN Mobile Money, AirtelTigo Money, Vodafone Cash"
                                width={80}
                                className="rounded-sm"
                            />
                        </div>
                        <select
                            id="mobileProvider"
                            value={mobileProvider}
                            onChange={(e) => setMobileProvider(e.target.value)}
                            className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        >
                            <option value="">Select Provider</option>
                            <option value="MTN">MTN Momo</option>
                            <option value="Telecel">Telecel Cash</option>
                            <option value="AirtelTigo">AirtelTigo Cash</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="mobileNumber"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mobile Money Number
                        </label>
                        <input
                            type="tel"
                            id="mobileNumber"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Enter your mobile money number"
                            className="mt-1 block w-full py-3 px-4 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-600">
                    Notification Preferences
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label
                                htmlFor="priceAlerts"
                                className="text-sm font-medium text-gray-700"
                            >
                                Price Change Alerts
                            </label>
                            <p className="text-sm text-gray-500">
                                Get notified when bottle prices change
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                setNotifications((prev) => ({
                                    ...prev,
                                    priceAlerts: !prev.priceAlerts,
                                }))
                            }
                            className={`${
                                notifications.priceAlerts ? "bg-green-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        >
                            <span
                                className={`${
                                    notifications.priceAlerts ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label
                                htmlFor="payoutConfirmations"
                                className="text-sm font-medium text-gray-700"
                            >
                                Payout Confirmations
                            </label>
                            <p className="text-sm text-gray-500">
                                Get notified when your earnings are paid out
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                setNotifications((prev) => ({
                                    ...prev,
                                    payoutConfirmations: !prev.payoutConfirmations,
                                }))
                            }
                            className={`${
                                notifications.payoutConfirmations ? "bg-green-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        >
                            <span
                                className={`${
                                    notifications.payoutConfirmations
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label
                                htmlFor="binPickupReminders"
                                className="text-sm font-medium text-gray-700"
                            >
                                Bin Pickup Reminders
                            </label>
                            <p className="text-sm text-gray-500">
                                Get reminded when your bin is ready for pickup
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                setNotifications((prev) => ({
                                    ...prev,
                                    binPickupReminders: !prev.binPickupReminders,
                                }))
                            }
                            className={`${
                                notifications.binPickupReminders ? "bg-green-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        >
                            <span
                                className={`${
                                    notifications.binPickupReminders
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {saveMessage && (
                <div
                    className={`mt-4 p-4 rounded-md ${
                        saveMessage.includes("Error")
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                    }`}
                >
                    {saveMessage}
                </div>
            )}
        </div>
    );
}
