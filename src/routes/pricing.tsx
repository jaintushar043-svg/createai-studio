import { createFileRoute } from "@tanstack/react-router";
import { Check, Zap } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — TechmarqX" },
      { name: "description", content: "Simple credit-based pricing for AI image and video generation. Free tier available." },
      { property: "og:title", content: "Pricing — TechmarqX" },
      { property: "og:description", content: "Simple credit-based pricing for AI image and video generation." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Try the studio risk-free.",
    features: ["50 image credits / month", "Standard quality", "PNG / JPG export", "Community templates"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$29",
    desc: "For serious creators and freelancers.",
    features: ["Unlimited image generations", "HD upscale", "Video studio access", "Voiceover (28 languages)", "Commercial rights"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$99",
    desc: "Built for agencies and teams.",
    features: ["Everything in Pro", "5 team seats", "Brand kits", "Priority rendering", "API access", "Dedicated support"],
    cta: "Start Studio",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-16 md:py-24">
      <header className="text-center max-w-2xl mx-auto mb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4">Plans &amp; Credits</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pay for output, not seats.</h1>
        <p className="text-muted-foreground">Simple credit-based pricing. Cancel anytime.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((p) => (
          <article
            key={p.name}
            className={`relative rounded-3xl p-8 border transition-all ${
              p.highlight
                ? "glass-panel border-primary/40 shadow-glow scale-[1.02]"
                : "bg-card/40 border-border"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest">
                Most Popular
              </span>
            )}
            <div className="flex items-center gap-2 mb-2">
              {p.highlight && <Zap className="size-4 text-primary" />}
              <h2 className="text-lg font-bold">{p.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <button
              className={`w-full rounded-xl py-3 font-bold mb-6 transition-all ${
                p.highlight
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p.cta}
            </button>
            <ul className="space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
