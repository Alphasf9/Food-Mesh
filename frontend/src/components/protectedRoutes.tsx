import { useAppData } from "@/context/AppContext"
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
    const location = useLocation();

    const { auth, loading, user } = useAppData();

    if (loading) return null;


    if (!auth) {
        return <Navigate to={"/login"} replace />
    }

    if (user?.role === null && location.pathname !== "/select-role") {
        return <Navigate to={"/select-role"} replace />
    }

    if (user?.role !== null && location.pathname === "/select-role") {
        return <Navigate to={"/"} replace />
    }

    return <Outlet />;

}



export default ProtectedRoutes;