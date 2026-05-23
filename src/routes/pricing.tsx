import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Zap, ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Top-ups & Pricing — TechmarqX MarqCreative AI" },
      { name: "description", content: "INR credit top-ups via Razorpay. ₹10 = 50 credits, ₹100 = 700 credits. Pay-as-you-go AI image & video generation." },
      { property: "og:title", content: "Top-ups & Pricing — TechmarqX" },
      { property: "og:description", content: "INR credit top-ups via Razorpay. Pay-as-you-go." },
    ],
  }),
  component: PricingPage,
});

const RAZORPAY_LINK = "https://razorpay.me/@techmarqxprivatelimited";

const packs = [
  { id: "starter", inr: 10, credits: 50, label: "Starter", note: "≈ 25 images", popular: false },
  { id: "creator", inr: 100, credits: 700, label: "Creator", note: "≈ 350 images or 70 short videos", popular: true },
  { id: "studio", inr: 500, credits: 4000, label: "Studio", note: "≈ 2,000 images or 400 videos", popular: false },
  { id: "pro", inr: 1000, credits: 9000, label: "Pro Bundle", note: "≈ 4,500 images · best value", popular: false },
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

  return (
    <main className="min-h-screen px-6 md:px-12 py-16 md:py-24">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4">Top-ups · INR</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pay-as-you-go credits</h1>
        <p className="text-muted-foreground">Secure UPI / cards / netbanking via Razorpay. Credits added after verification.</p>
        {user && profile.data && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full glass-panel ring-1 ring-primary/30">
            <CreditCard className="size-4 text-primary" />
            <span className="text-sm font-mono">Balance: <span className="font-bold text-primary">{profile.data.credits}</span> credits</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
        {packs.map((p) => (
          <TopUpCard key={p.id} pack={p} userId={user?.id ?? null} onSubmitted={() => orders.refetch()} />
        ))}
      </div>

      {user && (
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Your top-up requests</h2>
          {(orders.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground glass-panel rounded-xl p-5">No top-ups yet.</p>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
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
                      <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                      <td className="p-3">₹{(o.amount_cents / 100).toFixed(0)}</td>
                      <td className="p-3">{o.credits}</td>
                      <td className="p-3 font-mono text-xs">{o.provider_order_id ?? "—"}</td>
                      <td className="p-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">How it works</h2>
        <ol className="text-sm text-muted-foreground space-y-2 text-left inline-block">
          <li><span className="text-primary font-bold">1.</span> Pick a pack, pay via Razorpay (UPI / card / netbanking).</li>
          <li><span className="text-primary font-bold">2.</span> Copy the Razorpay Payment ID from the success screen / email.</li>
          <li><span className="text-primary font-bold">3.</span> Paste it back here — we verify within 24h and your credits land in your wallet.</li>
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
  pack: (typeof packs)[number];
  userId: string | null;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      onSubmitted();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article
      className={`relative rounded-3xl p-6 border transition-all flex flex-col ${
        pack.popular ? "glass-panel border-primary/40 shadow-glow" : "bg-card/40 border-border"
      }`}
    >
      {pack.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest">
          Best Value
        </span>
      )}
      <div className="flex items-center gap-2 mb-1">
        {pack.popular && <Zap className="size-4 text-primary" />}
        <h3 className="text-lg font-bold">{pack.label}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{pack.note}</p>
      <div className="mb-4">
        <span className="text-4xl font-bold">₹{pack.inr}</span>
        <span className="text-sm text-muted-foreground"> one-time</span>
      </div>
      <p className="text-sm mb-5">
        <span className="text-primary font-bold">{pack.credits}</span> credits
      </p>

      {!open ? (
        <a
          href={`${RAZORPAY_LINK}?amount=${pack.inr * 100}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setTimeout(() => setOpen(true), 800)}
          className={`w-full rounded-xl py-3 font-bold mb-3 transition-all inline-flex items-center justify-center gap-2 ${
            pack.popular
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Pay ₹{pack.inr} <ExternalLink className="size-4" />
        </a>
      ) : (
        <div className="space-y-2 mb-3">
          <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Razorpay Payment ID</label>
          <input
            type="text"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="pay_XXXXXXXXXXXX"
            className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || !userId}
            className="w-full rounded-xl py-2.5 font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submit.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit for verification
          </button>
          {!userId && <p className="text-xs text-muted-foreground"><Link to="/login" className="text-primary underline">Sign in</Link> to submit.</p>}
        </div>
      )}

      <ul className="space-y-1.5 mt-auto pt-3 border-t border-border/50">
        <li className="flex items-start gap-2 text-xs"><Check className="size-3.5 text-primary mt-0.5 shrink-0" /><span>UPI / Card / Netbanking</span></li>
        <li className="flex items-start gap-2 text-xs"><Check className="size-3.5 text-primary mt-0.5 shrink-0" /><span>Credits never expire</span></li>
      </ul>
    </article>
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

// Auto-refresh balance when window regains focus (after paying in another tab)
function useFocusRefetch(refetch: () => void) {
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [refetch]);
}
void useFocusRefetch;
