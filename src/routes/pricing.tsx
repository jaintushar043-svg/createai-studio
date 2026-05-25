import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, ShieldCheck, Sparkles, Zap, Coins } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Buy Credits — MarqCreative AI" },
      { name: "description", content: "Pay-as-you-go credits. ₹1 = 1 credit. No plans, no subscriptions." },
      { property: "og:title", content: "Buy Credits — MarqCreative AI" },
      { property: "og:description", content: "Pay only for what you use. ₹1 = 1 credit." },
    ],
  }),
  component: PricingPage,
});

const RAZORPAY_LINK = "https://razorpay.me/@techmarqxprivatelimited";
const MIN = 10;
const MAX = 100000;
const QUICK = [100, 500, 1000, 2000];

function PricingPage() {
  const [amount, setAmount] = useState<string>("100");

  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed >= MIN && parsed <= MAX && Number.isInteger(parsed);
  const credits = valid ? parsed : 0;

  const payUrl = valid ? `${RAZORPAY_LINK}/${parsed}` : RAZORPAY_LINK;

  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-24">
      <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4">Pay as you go</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">Buy credits, your amount</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          <span className="text-foreground font-semibold">₹1 = 1 credit.</span> No plans. No subscriptions. Pay only for what you use.
        </p>
      </header>

      <section className="max-w-xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 ring-1 ring-primary/20 shadow-glow mb-10">
        <label htmlFor="amount" className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
          Enter amount (INR)
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-muted-foreground select-none">₹</span>
          <input
            id="amount"
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAX}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="100"
            className="w-full rounded-2xl bg-background/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none pl-10 sm:pl-12 pr-4 py-4 text-2xl sm:text-3xl font-bold tabular-nums transition"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
                parsed === v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/40 text-foreground border-border hover:border-primary/50"
              }`}
            >
              ₹{v.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-primary/5 ring-1 ring-primary/20 px-4 py-3">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            <Coins className="size-3.5 text-primary" /> You get
          </span>
          <span className="text-xl sm:text-2xl font-bold text-gradient tabular-nums">
            {credits.toLocaleString()} <span className="text-sm text-muted-foreground font-medium">credits</span>
          </span>
        </div>

        {!valid && amount !== "" && (
          <p className="text-xs text-destructive mt-2">Enter a whole amount between ₹{MIN} and ₹{MAX.toLocaleString()}.</p>
        )}

        <a
          href={payUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!valid}
          onClick={(e) => { if (!valid) e.preventDefault(); }}
          className={`mt-5 w-full rounded-xl py-3.5 font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            valid
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
              : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
          }`}
        >
          Buy Credits {valid && <>· ₹{parsed.toLocaleString()}</>} <ExternalLink className="size-4" />
        </a>

        <p className="text-[11px] text-muted-foreground text-center mt-3">
          You'll be redirected to Razorpay. Credits are added after payment is confirmed.
        </p>
      </section>

      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
        <TrustChip icon={ShieldCheck} title="Secure by Razorpay" sub="UPI · Cards · Netbanking" />
        <TrustChip icon={Sparkles} title="Credits never expire" sub="Use whenever you want" />
        <TrustChip icon={Zap} title="₹1 = 1 credit" sub="No hidden fees" />
      </div>

      <section className="max-w-2xl mx-auto text-center px-2">
        <p className="text-sm">
          <Link to="/dashboard" className="text-primary underline">Open your dashboard</Link> to see your balance and usage.
        </p>
      </section>
    </main>
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
