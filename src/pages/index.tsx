import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // Check if the user already has an active session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // If logged in, send to dashboard
        router.push("/dashboard");
      } else {
        // If not logged in, send to login page
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  // This renders briefly while Supabase checks the session status
  return (
      <div className="flex h-screen items-center justify-center bg-slate-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-white" />
      </div>
  );
}