import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — TechmarqX MarqCreative AI" },
      { name: "description", content: "Sign in to TechmarqX to generate AI images and videos." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    router.invalidate();
    navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) { setLoading(false); return toast.error(result.error.message); }
    if (result.redirected) return;
    router.invalidate();
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="size-5 text-primary" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Sign in</p>
        </div>
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Continue creating with MarqCreative AI.</p>

        <button onClick={handleGoogle} disabled={loading}
          className="w-full border border-border rounded-xl py-3 text-sm font-medium hover:bg-white/5 transition-colors mb-4">
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 hover:opacity-90 shadow-glow disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
