import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Zap, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Top-ups & Pricing — MarqCreative AI" },
      { name: "description", content: "INR credit top-ups via Razorpay. ₹100 = 700 credits, ₹500 = 4000 credits." },
      { property: "og:title", content: "Top-ups & Pricing — MarqCreative AI" },
      { property: "og:description", content: "INR credit top-ups via Razorpay." },
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
  { id: "creator", inr: 100, credits: 700, label: "Creator", note: "≈ 350 images · 70 videos", popular: true, savings: "40% more credits" },
  { id: "studio", inr: 500, credits: 4000, label: "Studio", note: "≈ 2,000 images · 400 videos", savings: "60% more credits" },
];

function buildPayUrl(inr: number) {
  return `${RAZORPAY_LINK}/${inr}`;
}

function PricingPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-24">
      <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4">Top-ups · INR</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">Pay only for what you create</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Secure UPI, cards & netbanking via Razorpay. Credits never expire.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto mb-12 sm:mb-16">
        {packs.map((p) => (
          <TopUpCard key={p.id} pack={p} />
        ))}
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 sm:mb-16">
        <TrustChip icon={ShieldCheck} title="Verified by Razorpay" sub="UPI · Cards · Netbanking" />
        <TrustChip icon={Sparkles} title="Credits never expire" sub="Use whenever you want" />
        <TrustChip icon={Zap} title="Added after payment" sub="Usually within minutes" />
      </div>

      <section className="max-w-2xl mx-auto text-center px-2">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">How it works</h2>
        <ol className="text-sm text-muted-foreground space-y-2.5 text-left">
          <li className="flex gap-3"><Step n={1}/><span>Pick a pack — we'll open Razorpay with the amount pre-filled.</span></li>
          <li className="flex gap-3"><Step n={2}/><span>Pay with UPI, card or netbanking on the secure Razorpay page.</span></li>
          <li className="flex gap-3"><Step n={3}/><span>You'll be redirected to a thank-you page. Credits land in your wallet shortly.</span></li>
        </ol>
        <p className="mt-6 text-sm">
          <Link to="/dashboard" className="text-primary underline">Open your dashboard</Link> to track your balance.
        </p>
      </section>
    </main>
  );
}

function TopUpCard({ pack }: { pack: Pack }) {
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
        href={buildPayUrl(pack.inr)}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full rounded-xl py-3 font-bold transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98] ${
          pack.popular
            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Pay ₹{pack.inr} <ExternalLink className="size-4" />
      </a>

      <ul className="space-y-1.5 mt-auto pt-4 border-t border-border/50 mt-4">
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
