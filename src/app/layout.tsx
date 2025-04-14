import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LoadingProvider } from "@/lib/contexts/LoadingContext";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import LoadingOverlay from "@/components/layout/LoadingOverlay";

export const metadata: Metadata = {
    title: "EcoSika",
    description: "Recycling made easy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="font-sans">
                <AuthProvider>
                    <LoadingProvider>
                        <div className="min-h-screen bg-gray-50">
                            <Header />
                            <Navigation />
                            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                                {children}
                            </main>
                            <LoadingOverlay />
                        </div>
                    </LoadingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
