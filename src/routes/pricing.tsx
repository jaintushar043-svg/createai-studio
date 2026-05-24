import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Zap, ExternalLink, CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Top-ups & Pricing — MarqCreative AI" },
      { name: "description", content: "INR credit top-ups via Razorpay. ₹10 = 50 credits, ₹100 = 700 credits. Pay-as-you-go AI image & video generation." },
      { property: "og:title", content: "Top-ups & Pricing — MarqCreative AI" },
      { property: "og:description", content: "INR credit top-ups via Razorpay. Pay-as-you-go." },
    ],
  }),
  component: PricingPage,
});

const RAZORPAY_LINK = "https://razorpay.me/@techmarqxprivatelimited";

type Pack = {
  id: string;
  inr: number;
  credits: number;
  label: string;
  note: string;
  popular?: boolean;
  savings?: string;
};

const packs: Pack[] = [
  { id: "starter", inr: 10, credits: 50, label: "Starter", note: "≈ 25 images" },
  { id: "creator", inr: 100, credits: 700, label: "Creator", note: "≈ 350 images · 70 videos", popular: true, savings: "40% more credits" },
  { id: "studio", inr: 500, credits: 4000, label: "Studio", note: "≈ 2,000 images · 400 videos", savings: "60% more credits" },
  { id: "pro", inr: 1000, credits: 9000, label: "Pro", note: "≈ 4,500 images · best value", savings: "80% more credits" },
];

function PricingPage() {
  const { user } = useAuth();

  const profile = useQuery({
    queryKey: ["profile-credits"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("credits, plan").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const orders = useQuery({
    queryKey: ["my-topups"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_orders")
        .select("id, amount_cents, credits, status, provider_order_id, created_at")
        .eq("user_id", user!.id)
        .eq("provider", "razorpay_manual")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Auto refetch on focus (after returning from Razorpay tab)
  useEffect(() => {
    const onFocus = () => { profile.refetch(); orders.refetch(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [profile, orders]);

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-24">
      {/* Hero */}
      <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4">Top-ups · INR</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">Pay only for what you create</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Secure UPI, cards & netbanking via Razorpay. Credits never expire.</p>

        {user && profile.data && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full glass-panel ring-1 ring-primary/30">
            <CreditCard className="size-4 text-primary" />
            <span className="text-sm font-mono">
              Balance: <span className="font-bold text-primary">{profile.data.credits}</span> credits
            </span>
          </div>
        )}
      </header>

      {/* Packs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto mb-12 sm:mb-16">
        {packs.map((p) => (
          <TopUpCard key={p.id} pack={p} userId={user?.id ?? null} onSubmitted={() => orders.refetch()} />
        ))}
      </div>

      {/* Trust row */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 sm:mb-16">
        <TrustChip icon={ShieldCheck} title="Verified by Razorpay" sub="UPI · Cards · Netbanking" />
        <TrustChip icon={Sparkles} title="Credits never expire" sub="Use whenever you want" />
        <TrustChip icon={Zap} title="Instant after verification" sub="Usually within minutes" />
      </div>

      {/* Orders */}
      {user && (
        <section className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4 px-1">Your top-up requests</h2>
          {(orders.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground glass-panel rounded-xl p-5">No top-ups yet.</p>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Credits</th>
                      <th className="text-left p-3">Payment ID</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.data!.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="p-3">₹{(o.amount_cents / 100).toFixed(0)}</td>
                        <td className="p-3">{o.credits}</td>
                        <td className="p-3 font-mono text-xs">{o.provider_order_id ?? "—"}</td>
                        <td className="p-3"><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile list */}
              <ul className="sm:hidden divide-y divide-border">
                {orders.data!.map((o) => (
                  <li key={o.id} className="p-4 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">₹{(o.amount_cents / 100).toFixed(0)} · {o.credits} credits</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
                    {o.provider_order_id && (
                      <span className="text-[11px] font-mono text-muted-foreground truncate">{o.provider_order_id}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* How it works */}
      <section className="max-w-2xl mx-auto text-center px-2">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">How it works</h2>
        <ol className="text-sm text-muted-foreground space-y-2.5 text-left">
          <li className="flex gap-3"><Step n={1}/><span>Pick a pack — we'll open Razorpay with the amount pre-filled.</span></li>
          <li className="flex gap-3"><Step n={2}/><span>Pay with UPI, card or netbanking. Copy the <strong className="text-foreground">Payment ID</strong> (looks like <code className="text-primary">pay_XXX</code>) from the success page.</span></li>
          <li className="flex gap-3"><Step n={3}/><span>Paste it back here. Credits land in your wallet after a quick verification.</span></li>
        </ol>
        {!user && (
          <p className="mt-6 text-sm">
            <Link to="/login" className="text-primary underline">Sign in</Link> to track your top-ups and balance.
          </p>
        )}
      </section>
    </main>
  );
}

function TopUpCard({
  pack,
  userId,
  onSubmitted,
}: {
  pack: Pack;
  userId: string | null;
  onSubmitted: () => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Please sign in first.");
      const trimmed = paymentId.trim();
      if (trimmed.length < 6) throw new Error("Enter a valid Razorpay Payment ID.");
      const { error } = await supabase.from("payment_orders").insert({
        user_id: userId,
        provider: "razorpay_manual",
        kind: "topup",
        credits: pack.credits,
        amount_cents: pack.inr * 100,
        currency: "INR",
        status: "pending",
        provider_order_id: trimmed,
        metadata: { pack: pack.id, label: pack.label },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment submitted — credits will be added after verification.");
      setPaymentId("");
      setShowInput(false);
      onSubmitted();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article
      className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all flex flex-col ${
        pack.popular
          ? "glass-panel border-primary/40 shadow-glow scale-[1.01]"
          : "bg-card/40 border-border hover:border-border/80"
      }`}
    >
      {pack.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest whitespace-nowrap">
          Most Popular
        </span>
      )}

      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold flex items-center gap-1.5">
          {pack.popular && <Zap className="size-4 text-primary" />}
          {pack.label}
        </h3>
        {pack.savings && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            {pack.savings}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">{pack.note}</p>

      <div className="mb-3">
        <span className="text-4xl font-bold tracking-tight">₹{pack.inr}</span>
        <span className="text-xs text-muted-foreground ml-1">one-time</span>
      </div>
      <p className="text-sm mb-5">
        <span className="text-primary font-bold text-lg">{pack.credits.toLocaleString()}</span>
        <span className="text-muted-foreground ml-1">credits</span>
      </p>

      <a
        href={`${RAZORPAY_LINK}?amount=${pack.inr * 100}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowInput(true)}
        className={`w-full rounded-xl py-3 font-bold mb-2 transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98] ${
          pack.popular
            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Pay ₹{pack.inr} <ExternalLink className="size-4" />
      </a>

      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 mb-3 self-center"
        >
          Already paid? Enter Payment ID
        </button>
      ) : (
        <div className="space-y-2 mb-3 pt-2 border-t border-border/50">
          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Razorpay Payment ID
          </label>
          <input
            type="text"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="pay_XXXXXXXXXXXX"
            autoComplete="off"
            className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || !userId}
            className="w-full rounded-xl py-2.5 font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {submit.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit for verification
          </button>
          {!userId && (
            <p className="text-xs text-muted-foreground text-center">
              <Link to="/login" className="text-primary underline">Sign in</Link> to submit.
            </p>
          )}
        </div>
      )}

      <ul className="space-y-1.5 mt-auto pt-3 border-t border-border/50">
        <li className="flex items-start gap-2 text-xs"><Check className="size-3.5 text-primary mt-0.5 shrink-0" /><span>UPI · Card · Netbanking</span></li>
        <li className="flex items-start gap-2 text-xs"><Check className="size-3.5 text-primary mt-0.5 shrink-0" /><span>Credits never expire</span></li>
      </ul>
    </article>
  );
}

function TrustChip({ icon: Icon, title, sub }: { icon: typeof ShieldCheck; title: string; sub: string }) {
  return (
    <div className="glass-panel rounded-xl p-4 flex items-start gap-3">
      <div className="size-9 rounded-lg bg-primary/10 ring-1 ring-primary/30 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="size-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-500",
    paid: "bg-emerald-500/15 text-emerald-500",
    failed: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest ${map[status] ?? "bg-secondary"}`}>
      {status}
    </span>
  );
}
