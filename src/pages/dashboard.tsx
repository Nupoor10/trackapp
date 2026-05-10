import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Trash2, DollarSign, TrendingDown, Wallet } from "lucide-react";

// --- TypeScript Interfaces ---
interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
}

interface Income {
    id: string;
    user_id: string;
    title: string;
    amount: number;
    created_at?: string;
}

interface Expense {
    id: string;
    user_id: string;
    title: string;
    category: string;
    amount: number;
    created_at?: string;
}

// --- Constants ---
const CATEGORIES = ["Housing", "Transportation", "Food", "Utilities", "Shopping", "Healthcare", "Entertainment", "Misc"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8b5cf6", "#ec4899", "#f43f5e", "#64748b"];

// --- Layout Component ---
function DashboardLayout({ children, profile, onLogout }: { children: React.ReactNode; profile: Profile | null; onLogout: () => void }) {
    return (
        <div className="flex h-screen bg-slate-800 font-sans text-slate-100">
            <aside className="flex w-64 flex-col items-center border-r border-slate-700 bg-slate-900 p-6 shadow-sm">
                <div className="mb-8 flex flex-col items-center">
                    {profile ? (
                        <>
                            <img
                                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`}
                                alt="Avatar"
                                className="h-24 w-24 rounded-full border-4 border-slate-700 bg-slate-800 shadow-sm"
                            />
                            <h2 className="mt-4 text-lg font-bold text-white">@{profile.username}</h2>
                        </>
                    ) : (
                        <div className="h-24 w-24 animate-pulse rounded-full bg-slate-700" />
                    )}
                </div>

                <nav className="flex w-full flex-col gap-2">
                    <div className="rounded-lg bg-indigo-900/50 px-4 py-2 font-medium text-indigo-300">Overview</div>
                </nav>

                <button
                    onClick={onLogout}
                    className="mt-auto w-full rounded-lg border border-red-900/50 px-4 py-2 font-medium text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-6xl">
                    <h1 className="mb-8 text-3xl font-bold text-white">Financial Dashboard</h1>
                    {children}
                </div>
            </main>
        </div>
    );
}

// --- Main Page Component ---
export default function Dashboard() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [incTitle, setIncTitle] = useState("");
    const [incAmt, setIncAmt] = useState("");
    const [expTitle, setExpTitle] = useState("");
    const [expCat, setExpCat] = useState(CATEGORIES[0]);
    const [expAmt, setExpAmt] = useState("");

    const fetchData = async (userId: string) => {
        const [incRes, expRes] = await Promise.all([
            supabase.from("incomes").select("*").eq("user_id", userId).order('created_at', { ascending: false }),
            supabase.from("expenses").select("*").eq("user_id", userId).order('created_at', { ascending: false })
        ]);

        if (incRes.data) setIncomes(incRes.data);
        if (expRes.data) setExpenses(expRes.data);
    };

    useEffect(() => {
        const initData = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setUser(session.user);

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();

            if (profileData) setProfile(profileData);

            fetchData(session.user.id);
        };

        initData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const balance = totalIncome - totalExpense;

    const chartData = CATEGORIES.map(cat => ({
        name: cat,
        value: expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + Number(curr.amount), 0)
    })).filter(d => d.value > 0);

    const addIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { data, error } = await supabase
            .from("incomes")
            .insert([{ user_id: user.id, title: incTitle, amount: Number(incAmt) }])
            .select();

        if (data && !error) setIncomes([data[0], ...incomes]);
        setIncTitle("");
        setIncAmt("");
    };

    const addExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { data, error } = await supabase
            .from("expenses")
            .insert([{ user_id: user.id, title: expTitle, category: expCat, amount: Number(expAmt) }])
            .select();

        if (data && !error) setExpenses([data[0], ...expenses]);
        setExpTitle("");
        setExpAmt("");
    };

    const deleteItem = async (table: "incomes" | "expenses", id: string) => {
        await supabase.from(table).delete().eq("id", id);
        if (table === "incomes") {
            setIncomes(incomes.filter(i => i.id !== id));
        } else {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    return (
        <DashboardLayout profile={profile} onLogout={handleLogout}>
            <div className="space-y-8">

                {/* 1. Top Section Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex items-center rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <div className="mr-4 rounded-full bg-green-900/30 p-3 text-green-400"><DollarSign size={24} /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Total Income</p>
                            <h2 className="text-2xl font-bold text-white">${totalIncome.toFixed(2)}</h2>
                        </div>
                    </div>

                    <div className="flex items-center rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <div className="mr-4 rounded-full bg-red-900/30 p-3 text-red-400"><TrendingDown size={24} /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Total Expenditure</p>
                            <h2 className="text-2xl font-bold text-white">${totalExpense.toFixed(2)}</h2>
                        </div>
                    </div>

                    <div className="flex items-center rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <div className={`mr-4 rounded-full p-3 ${balance >= 0 ? 'bg-indigo-900/30 text-indigo-400' : 'bg-orange-900/30 text-orange-400'}`}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">Remaining Balance</p>
                            <h2 className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                ${balance.toFixed(2)}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* 2. Chart & Forms Container */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Chart Visualization */}
                    <div className="flex flex-col rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <h3 className="mb-6 text-lg font-bold text-white">Expenses by Category</h3>
                        <div className="flex-1 flex items-center justify-center min-h-[300px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[CATEGORIES.indexOf(entry.name) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-slate-500 italic">No expenses recorded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Input Forms */}
                    <div className="flex flex-col space-y-6">

                        {/* Income Form */}
                        <div className="rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                            <h3 className="mb-4 text-lg font-bold text-white">Add Income</h3>
                            <form onSubmit={addIncome} className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Title</label>
                                    <input required value={incTitle} onChange={e => setIncTitle(e.target.value)} placeholder="e.g., Salary" className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div className="w-32">
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Amount</label>
                                    <input required type="number" min="0" step="0.01" value={incAmt} onChange={e => setIncAmt(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <button type="submit" className="cursor-pointer rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition-colors hover:bg-green-700">
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* Expense Form */}
                        <div className="rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700 flex-1">
                            <h3 className="mb-4 text-lg font-bold text-white">Add Expenditure</h3>
                            <form onSubmit={addExpense} className="flex flex-wrap items-end gap-4">
                                <div className="min-w-[140px] flex-1">
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Title</label>
                                    <input required value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="e.g., Groceries" className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div className="w-40">
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Category</label>
                                    <select value={expCat} onChange={e => setExpCat(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="mb-1 block text-sm font-medium text-slate-400">Amount</label>
                                    <input required type="number" min="0" step="0.01" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <button type="submit" className="cursor-pointer rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition-colors hover:bg-red-700">
                                    Add
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

                {/* 3. Data Tables */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <div className="rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <h3 className="mb-4 text-lg font-bold text-green-400">Income History</h3>
                        <div className="max-h-80 overflow-y-auto pr-2">
                            {incomes.length === 0 ? (
                                <p className="text-sm text-slate-500">No incomes recorded yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-800">
                                    {incomes.map(item => (
                                        <li key={item.id} className="flex items-center justify-between py-3">
                                            <span className="font-medium text-slate-200">{item.title}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-green-400">+${Number(item.amount).toFixed(2)}</span>
                                                <button onClick={() => deleteItem("incomes", item.id)} className="cursor-pointer text-slate-500 transition-colors hover:text-red-400">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 p-6 shadow-sm border border-slate-700">
                        <h3 className="mb-4 text-lg font-bold text-red-400">Expense History</h3>
                        <div className="max-h-80 overflow-y-auto pr-2">
                            {expenses.length === 0 ? (
                                <p className="text-sm text-slate-500">No expenses recorded yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-800">
                                    {expenses.map(item => (
                                        <li key={item.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium text-slate-200">{item.title}</p>
                                                <p className="text-xs font-medium text-slate-400">{item.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-red-400">-${Number(item.amount).toFixed(2)}</span>
                                                <button onClick={() => deleteItem("expenses", item.id)} className="cursor-pointer text-slate-500 transition-colors hover:text-red-400">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}