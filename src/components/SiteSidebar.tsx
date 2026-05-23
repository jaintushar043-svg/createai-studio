import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, ImageIcon, Video, LayoutGrid, CreditCard } from "lucide-react";

const navItems = [
  { to: "/", icon: Sparkles, label: "Home" },
  { to: "/image-lab", icon: ImageIcon, label: "Image Lab" },
  { to: "/video-studio", icon: Video, label: "Video Studio" },
  { to: "/templates", icon: LayoutGrid, label: "Templates" },
  { to: "/pricing", icon: CreditCard, label: "Pricing" },
] as const;

export function SiteSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 top-0 bottom-0 w-20 border-r border-border bg-background/60 backdrop-blur-xl z-50 flex flex-col items-center py-8 gap-10"
    >
      <Link to="/" aria-label="TechmarqX home" title="TechmarqX — MarqCreative AI" className="size-10 bg-primary rounded-xl flex items-center justify-center font-bold text-primary-foreground shadow-glow">
        T
      </Link>
      <div className="flex flex-col gap-3">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              title={label}
              className={`size-12 rounded-xl flex items-center justify-center transition-all group relative ${
                active
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <div className="size-10 rounded-full bg-secondary border border-border" />
      </div>
    </nav>
  );
}
