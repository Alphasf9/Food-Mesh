/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";

const Login = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const{setUser,setAuth}= useAppData()

    const responseGoogle = async (authResults: any) => {
        setLoading(true)
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
                code: authResults["code"]
            });

            localStorage.setItem("accessToken", result.data.token);
            console.log("Login successful, token stored:", authResults["code"]);
            toast.success(result.data.message);
            setLoading(false);
            setUser(result.data.user);
            setAuth(true);
            navigate("/")
        } catch (error) {
            console.log(error);
            toast.error("Login failed");
            setLoading(false);
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: responseGoogle,
        flow: "auth-code",
    })

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-400 via-pink-400 to-yellow-400 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center text-7xl shadow-2xl shadow-orange-300 mb-6">
                        🍔
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tighter drop-shadow-md">FOOD MESH</h1>
                    <p className="text-white/90 mt-2 text-xl font-medium">Fresh • Fast • Delicious</p>
                </div>

                {/* Main Card using ShadCN */}
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-3xl font-bold text-gray-900">
                            Welcome Back 👋
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600 mt-2">
                            Sign in to discover tasty meals near you
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* Google Login Button */}
                        <Button
                            onClick={() => googleLogin()}
                            disabled={loading}
                            className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-900 active:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing you in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                                        alt="Google"
                                        className="w-6 h-6"
                                    />
                                    Continue with Google
                                </div>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-gray-400 text-sm font-medium px-4">OR</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Email Login Teaser */}
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">
                                Email or phone login coming soon
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-white/80 text-sm">
                        By continuing, you agree to our{" "}
                        <span className="underline hover:text-white cursor-pointer">Terms</span> and{" "}
                        <span className="underline hover:text-white cursor-pointer">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login