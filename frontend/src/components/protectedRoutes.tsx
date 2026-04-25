import { useAppData } from "@/context/AppContext"
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
    const location = useLocation();
    const { auth, loading, initializing, user } = useAppData();

    if (initializing || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin h-10 w-10 border-b-2 border-black rounded-full" />
            </div>
        );
    }

    if (!auth) {
        return <Navigate to={"/login"} replace />
    }

    if (!user?.role && location.pathname !== "/select-role") {
        return <Navigate to={"/select-role"} replace />
    }

    if (user?.role && location.pathname === "/select-role") {
        return <Navigate to={"/"} replace />
    }

    if (user?.role === "seller" && location.pathname !== "/my-restaurant") {
        return <Navigate to={"/my-restaurant"} replace />
    }

    return <Outlet />;
}

export default ProtectedRoutes;