import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Sparkles, ImageIcon, CreditCard, Clock, Crown, Download, Plus, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile, listMyGenerations } from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MarqCreative AI" },
      { name: "description", content: "Your credits, recent generations and account overview." },
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
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="animate-pulse space-y-8 max-w-6xl">
          <div className="h-10 w-2/3 max-w-md bg-secondary/40 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 bg-secondary/40 rounded-2xl" />
            <div className="h-28 bg-secondary/40 rounded-2xl" />
            <div className="h-28 bg-secondary/40 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square bg-secondary/40 rounded-2xl" />)}
          </div>
        </div>
      </main>
    );
  }

  const completed = (gens.data ?? []).filter((g) => g.status === "succeeded").length;
  const totalSpent = (gens.data ?? []).reduce((s, g) => s + (g.credits_used ?? 0), 0);
  const credits = profile.data?.credits ?? 0;
  const plan = profile.data?.plan ?? "free";
  const lowBalance = credits < 10;

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      {/* Header */}
      <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio · Dashboard</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Welcome, {profile.data?.display_name ?? "creator"}</h1>
          <p className="text-sm text-muted-foreground mt-1.5 truncate">{user.email}</p>
        </div>
        <Link
          to="/image-lab"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl px-5 py-2.5 text-sm shadow-glow hover:opacity-90 active:scale-[0.98] transition"
        >
          <Sparkles className="size-4" /> New generation
        </Link>
      </header>

      {/* Low balance banner */}
      {lowBalance && (
        <div className="mb-6 glass-panel rounded-xl p-4 ring-1 ring-amber-500/30 bg-amber-500/5 flex items-center gap-3">
          <AlertCircle className="size-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">You're low on credits</p>
            <p className="text-xs text-muted-foreground">Top up to keep generating without interruption.</p>
          </div>
          <Link to="/pricing" className="text-xs font-bold bg-amber-500 text-black rounded-lg px-3 py-1.5 hover:opacity-90 shrink-0">
            Top up
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard icon={CreditCard} label="Credits" value={profile.isLoading ? "—" : credits} accent action={
          <Link to="/pricing" className="text-[10px] font-mono uppercase tracking-widest text-primary inline-flex items-center gap-1">
            <Plus className="size-3" /> Top up
          </Link>
        } />
        <StatCard icon={Crown} label="Plan" value={<span className="capitalize">{plan}</span>} />
        <StatCard icon={ImageIcon} label="Generations" value={completed} />
        <StatCard icon={Clock} label="Credits spent" value={totalSpent} />
      </div>

      {/* History */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Recent generations</h2>
        {(gens.data ?? []).length > 0 && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {gens.data!.length} item{gens.data!.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {gens.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : gens.error ? (
        <p className="text-sm text-destructive glass-panel rounded-xl p-5">Failed to load history. Refresh to retry.</p>
      ) : (gens.data ?? []).length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center">
          <ImageIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-4">No generations yet.</p>
          <Link to="/image-lab" className="inline-block bg-primary text-primary-foreground font-semibold rounded-xl px-5 py-2.5 text-sm shadow-glow">
            Generate your first image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {gens.data!.map((g) => (
            <article key={g.id} className="rounded-2xl overflow-hidden border border-border bg-card group relative">
              {g.output_url ? (
                <>
                  <img src={g.output_url} alt={g.prompt} loading="lazy" className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
                  <a
                    href={g.output_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 size-8 rounded-lg bg-black/60 backdrop-blur opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white hover:bg-primary"
                    aria-label="Download"
                  >
                    <Download className="size-4" />
                  </a>
                </>
              ) : (
                <div className="aspect-square w-full bg-secondary/40 flex items-center justify-center text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  {g.status}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs line-clamp-2 text-foreground/80 leading-snug">{g.prompt}</p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                  {g.style ?? "default"} · {g.aspect_ratio ?? "1:1"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  action,
}: {
  icon: typeof CreditCard;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className={`glass-panel rounded-2xl p-4 sm:p-5 ${accent ? "ring-1 ring-primary/30" : ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground truncate">{label}</p>
        <Icon className={`size-4 shrink-0 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${accent ? "text-gradient" : ""}`}>{value}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
