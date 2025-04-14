"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import logo from "@/app/images/logo.jpg";

export default function Header() {
    const { user, signOut } = useAuth();
    const router = useRouter();
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
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <Image
                                    src={logo}
                                    alt="EcoSika Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            </Link>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xl font-bold text-gray-900">EcoSika</p>
                            <p className="text-sm text-green-600">
                                "Plastic isn't waste, until you waste it"
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <UserIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                </button>
                                {showProfileMenu && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                                        <p className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            {user.email}
                                        </p>
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Not Signed In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
