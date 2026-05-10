import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (!error) {
            setStep(2);
            alert("OTP send successfully!")
        }
            
        else alert(error.message);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
        if (!error) router.push("/setup-profile");
        else alert(error.message);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-700 text-white">
            <div className="w-96 rounded-xl bg-slate-900 p-8 shadow-xl border border-neutral-700">
                <h2 className="mb-6 text-2xl font-bold">{step === 1 ? "Register" : "Enter Code"}</h2>
                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <input type="email" placeholder="Email" value={email} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" onChange={(e) => setEmail(e.target.value)} />
                        <button className="cursor-pointer w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition-colors hover:bg-blue-700">Send OTP</button>
                        <p className="mt-4 text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input type="text" placeholder="8-digit code" value={otp} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" onChange={(e) => setOtp(e.target.value)} />
                        <button className="cursor-pointer w-full rounded-lg bg-green-600 p-3 font-semibold text-white transition-colors hover:bg-green-700">Verify</button>
                    </form>
                )}
            </div>
        </div>
    );
}
