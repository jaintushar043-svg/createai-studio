import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — TechmarqX MarqCreative AI" },
      { name: "description", content: "Get 20 free credits and start generating AI images." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account");
    navigate({ to: "/login" });
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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Create account</p>
        </div>
        <h1 className="text-2xl font-bold mb-1">Start creating</h1>
        <p className="text-sm text-muted-foreground mb-6">20 free credits on signup.</p>

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
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 hover:opacity-90 shadow-glow disabled:opacity-50">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
