import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const withAuth = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.push("/login");
            }
        }, [user, loading, router]);

        if (loading) {
            return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }

        if (!user) {
            return null;
        }

        return <WrappedComponent {...props} user={user} />;
    };
};
