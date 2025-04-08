"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

export default function Header() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close profile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            setShowSignOutDialog(false);
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="EcoSika Logo"
                                width={40}
                                height={40}
                                className="mr-2"
                                priority
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900">EcoSika</span>
                                <span className="text-xs font-medium text-green-600 italic">
                                    Plastic isn&apos;t waste until you waste it
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Profile Section */}
                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {user.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt="Profile"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                        <div
                                            className="py-1"
                                            role="menu"
                                            aria-orientation="vertical"
                                        >
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                                <p className="font-medium">
                                                    {user.displayName || "User"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    setShowSignOutDialog(true);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                role="menuitem"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Out Confirmation Dialog */}
            {showSignOutDialog && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Sign Out</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowSignOutDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
