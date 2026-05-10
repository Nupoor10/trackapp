import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/router";

export default function SetupProfile() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords don't match");

        const { data: authData, error: authErr } = await supabase.auth.updateUser({ password });
        if (authErr) return alert(authErr.message);

        const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        if (authData.user) {
            await supabase.from("profiles").insert([{ id: authData.user.id, username, avatar_url }]);
        }

        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-700 text-white">
            <form onSubmit={handleSubmit} className="w-96 space-y-4 rounded-xl bg-slate-900 p-8 shadow-xl border border-neutral-700">
                <h2 className="mb-2 text-2xl font-bold">Setup Profile</h2>

                <input type="text" placeholder="Username" value={username} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" onChange={e => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" onChange={e => setPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} required className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" onChange={e => setConfirmPassword(e.target.value)} />

                <button className="cursor-pointer mt-4 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition-colors hover:bg-blue-700">Complete Setup</button>
            </form>
        </div>
    );
}