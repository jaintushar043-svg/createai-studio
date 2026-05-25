import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank you — MarqCreative AI" },
      { name: "description", content: "Your payment was received. Credits will be added to your wallet shortly." },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center glass-panel rounded-3xl p-8 sm:p-10">
        <div className="size-16 mx-auto rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Thank you!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          Your payment was received. Credits will be added to your wallet shortly. You'll get a confirmation on your registered email.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="w-full rounded-xl py-3 font-bold bg-primary text-primary-foreground hover:opacity-90 inline-flex items-center justify-center gap-2"
          >
            Go to dashboard <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/pricing"
            className="w-full rounded-xl py-3 font-medium text-sm text-muted-foreground hover:text-foreground"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
