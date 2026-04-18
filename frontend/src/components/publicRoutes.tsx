import { useAppData } from "@/context/AppContext"
import { Navigate, Outlet } from "react-router-dom";



const PublicRoutes = () => {
    const { auth, loading } = useAppData();


    if (loading) return null;

    return auth ? <Navigate to="/" replace /> : <Outlet />;
}


export default PublicRoutes;