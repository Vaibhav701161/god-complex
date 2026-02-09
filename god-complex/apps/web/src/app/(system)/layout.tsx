"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { DashboardProvider } from "@/hooks/useDashboardContext";
import { useRouter, usePathname } from "next/navigation";
export default function SystemLayout({ children, }: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading: authLoading, error: authError, logout } = useAuth();
    const { user, loading: userLoading, error: userError, refetch, invalidate } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [userLoadingTimeout, setUserLoadingTimeout] = useState(false);
    const [userLoadingError, setUserLoadingError] = useState(false);
    useEffect(() => {
        if (authLoading) {
            const timer = setTimeout(() => setLoadingTimeout(true), 10000);
            return () => clearTimeout(timer);
        }
        else {
            setLoadingTimeout(false);
        }
    }, [authLoading]);
    useEffect(() => {
        if (userLoading) {
            const timer = setTimeout(() => setUserLoadingTimeout(true), 5000);
            return () => clearTimeout(timer);
        }
        else {
            setUserLoadingTimeout(false);
        }
    }, [userLoading]);
    useEffect(() => {
        if (userLoading) {
            const timer = setTimeout(() => setUserLoadingError(true), 10000);
            return () => clearTimeout(timer);
        }
        else {
            setUserLoadingError(false);
        }
    }, [userLoading]);
    useEffect(() => {
        console.log("[SystemLayout] Effect triggered - authLoading:", authLoading, "userLoading:", userLoading, "isAuthenticated:", isAuthenticated, "user:", user?.email, "applicationDone:", user?.applicationDone, "pathname:", pathname);
        if (authLoading) {
            console.log("[SystemLayout] Still loading auth, waiting...");
            return;
        }
        if (!isAuthenticated) {
            console.log("[SystemLayout] Not authenticated, redirecting to /signin");
            router.push("/signin");
            return;
        }
        const allowedWithoutApplication = ["/profile", "/groups"];
        const isAllowedPath = allowedWithoutApplication.some(path => pathname?.startsWith(path));
        if (user && user.applicationDone === false && !isAllowedPath) {
            console.log("[SystemLayout] Application not done, redirecting to /application");
            router.push("/application");
            return;
        }
        console.log("[SystemLayout] All checks passed, rendering children");
    }, [isAuthenticated, authLoading, user, userLoading, router, pathname]);
    if (authLoading) {
        return (<div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center gap-6">
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                    AUTHENTICATING...
                </div>
                {loadingTimeout && (<div className="text-center space-y-4">
                        <p className="text-yellow-500 font-mono text-xs">
                            Authentication is taking longer than expected...
                        </p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono tracking-widest rounded">
                            RETRY
                        </button>
                        <p className="text-gray-600 font-mono text-[10px]">
                            Backend server may be unresponsive
                        </p>
                    </div>)}
            </div>);
    }
    if (authError) {
        return (<div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center gap-6">
                <div className="text-red-500 font-mono text-sm tracking-widest">
                    AUTH ERROR: {authError}
                </div>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono tracking-widest rounded">
                    RETRY
                </button>
            </div>);
    }
    if (!isAuthenticated) {
        return null;
    }
    return (<DashboardProvider user={user} userLoading={userLoading} userError={userError} refetchUser={refetch} stale={false}>
            <div className="flex min-h-screen bg-[#0a0e14]">
                
                <Sidebar />

                
                
                <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                    {userLoading && userLoadingTimeout && !userLoadingError && (<div className="fixed top-4 right-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded font-mono text-xs z-50">
                             User data is taking longer than expected to load...
                        </div>)}
                    {userLoadingError && (<div className="fixed inset-0 md:left-64 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-[#0a0e14] border-2 border-red-500/50 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
                                <div className="text-center space-y-6">
                                    <div className="text-red-500 text-4xl mb-4"></div>
                                    <h2 className="text-red-500 font-mono text-lg tracking-widest uppercase">
                                        User Data Load Failed
                                    </h2>
                                    <p className="text-gray-400 font-mono text-xs">
                                        Unable to load user data after 10 seconds. This may indicate a server issue or network problem.
                                    </p>
                                    <div className="space-y-3 pt-4">
                                        <button onClick={() => {
                setUserLoadingError(false);
                invalidate();
            }} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono tracking-widest uppercase transition-colors rounded">
                                            Retry Loading
                                        </button>
                                        <button onClick={() => window.location.reload()} className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white text-xs font-mono tracking-widest uppercase transition-colors rounded">
                                            Reload Page
                                        </button>
                                        <button onClick={logout} className="w-full py-3 px-4 bg-red-900/30 hover:bg-red-900/40 border border-red-500/50 text-red-500 text-xs font-mono tracking-widest uppercase transition-colors rounded">
                                            Logout
                                        </button>
                                    </div>
                                    <p className="text-gray-600 font-mono text-[10px] pt-2">
                                        Backend may be unresponsive
                                    </p>
                                </div>
                            </div>
                        </div>)}
                    {children}
                </div>
            </div>
        </DashboardProvider>);
}
