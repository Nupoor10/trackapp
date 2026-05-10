import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) router.push("/dashboard");
        else alert(error.message);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-700 text-white">
            <form onSubmit={handleLogin} className="w-96 space-y-4 rounded-xl bg-slate-900 p-8 shadow-xl border border-neutral-700">
                <h2 className="mb-2 text-2xl font-bold">Login</h2>

                <input type="email" placeholder="Email" value={email} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" onChange={e => setPassword(e.target.value)} />

                <button className="cursor-pointer mt-4 w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition-colors hover:bg-indigo-700">Login</button>

                <p className="mt-4 text-center text-sm text-slate-400">
                    New user?{" "}
                    <Link href="/register" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 hover:underline">
                        Register here
                    </Link>
                </p>
            </form>
        </div>
    );
}