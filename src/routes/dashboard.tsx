import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Sparkles, ImageIcon, CreditCard, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile, listMyGenerations } from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TechmarqX MarqCreative AI" },
      { name: "description", content: "Your credits, recent generations and analytics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchGens = useServerFn(listMyGenerations);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(), enabled: !!user });
  const gens = useQuery({ queryKey: ["my-generations"], queryFn: () => fetchGens(), enabled: !!user });

  if (loading || !user) {
    return <main className="min-h-screen p-10"><p className="text-muted-foreground">Loading…</p></main>;
  }

  const completed = (gens.data ?? []).filter((g) => g.status === "succeeded").length;
  const totalSpent = (gens.data ?? []).reduce((s, g) => s + (g.credits_used ?? 0), 0);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio / Dashboard</p>
        <h1 className="text-3xl md:text-4xl font-bold">Welcome, {profile.data?.display_name ?? "creator"}</h1>
        <p className="text-muted-foreground mt-2">{user.email}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card icon={CreditCard} label="Credits" value={profile.data?.credits ?? "—"} accent />
        <Card icon={ImageIcon} label="Generations" value={completed} />
        <Card icon={Clock} label="Credits spent" value={totalSpent} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Recent generations</h2>
        <Link to="/image-lab" className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-2">
          <Sparkles className="size-3.5" /> New image
        </Link>
      </div>

      {gens.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading history…</p>
      ) : (gens.data ?? []).length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No generations yet.</p>
          <Link to="/image-lab" className="inline-block mt-4 bg-primary text-primary-foreground font-semibold rounded-xl px-5 py-2.5 text-sm shadow-glow">
            Generate your first image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gens.data!.map((g) => (
            <div key={g.id} className="rounded-2xl overflow-hidden border border-border bg-card group">
              {g.output_url ? (
                <img src={g.output_url} alt={g.prompt} loading="lazy" className="aspect-square w-full object-cover" />
              ) : (
                <div className="aspect-square w-full bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">
                  {g.status}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs line-clamp-2 text-foreground/80">{g.prompt}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {g.style ?? "—"} · {g.aspect_ratio ?? "1:1"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Card({ icon: Icon, label, value, accent }: { icon: any; label: string; value: any; accent?: boolean }) {
  return (
    <div className={`glass-panel rounded-2xl p-5 ${accent ? "ring-1 ring-primary/30" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className={`text-3xl font-bold ${accent ? "text-gradient" : ""}`}>{value}</p>
    </div>
  );
}
