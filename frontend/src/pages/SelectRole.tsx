import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Role = "customer" | "rider" | "seller" | null;

const SelectRole = () => {
    const [role, setRole] = useState<Role>(null);
    const [loading, setLoading] = useState(false);

    const { setUser } = useAppData();
    const navigate = useNavigate();

    const roles = [
        {
            id: "customer" as Role,
            title: "Customer",
            desc: "Browse restaurants & order food",
            emoji: "🛍️",
            color: "bg-orange-100 text-orange-700 border-orange-200"
        },
        {
            id: "seller" as Role,
            title: "Restaurant Owner",
            desc: "Manage your restaurant & orders",
            emoji: "🍽️",
            color: "bg-emerald-100 text-emerald-700 border-emerald-200"
        },
        {
            id: "rider" as Role,
            title: "Delivery Partner",
            desc: "Deliver orders & earn money",
            emoji: "🏍️",
            color: "bg-blue-100 text-blue-700 border-blue-200"
        }
    ];

    const addRole = async () => {
        if (!role) return;

        setLoading(true);
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/add-role`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                    }
                }
            );

            localStorage.setItem("accessToken", res.data.token);
            setUser(res.data.user);
            navigate("/", { replace: true });

        } catch (error) {
            console.log(error);
            alert("Error adding role. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-400 to-yellow-400 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl">
                        👤
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Choose Your Role</h1>
                    <p className="text-white/90 mt-3 text-lg">
                        Tell us how you want to use FOOD MESH
                    </p>
                </div>

                {/* Role Selection Card */}
                <Card className="bg-white shadow-2xl border-0">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl text-gray-900">Select your profile</CardTitle>
                        <CardDescription className="text-base">
                            You can only choose one role for now
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {roles.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-center hover:shadow-md ${role === r.id
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <div className="text-4xl">{r.emoji}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-xl text-gray-900">{r.title}</h3>
                                        {role === r.id && (
                                            <Badge variant="default" className="bg-orange-500">Selected</Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mt-1">{r.desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Continue Button */}
                        <Button
                            onClick={addRole}
                            disabled={!role || loading}
                            className="w-full h-14 text-lg font-semibold mt-6"
                            size="lg"
                        >
                            {loading ? "Setting up your account..." : "Continue"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <p className="text-center text-white/80 text-sm mt-8">
                    You can change your role later from account settings
                </p>
            </div>
        </div>
    )
}

export default SelectRole