import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Wand2, Video, Image as ImageIcon, Layers, Zap } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import float1 from "@/assets/float-1.jpg";
import float2 from "@/assets/float-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TechmarqX — Generate Stunning Images & Videos with AI" },
      { name: "description", content: "Transform prompts into cinematic images, videos, ads, thumbnails and marketing content. Built for creators, agencies and ecommerce brands." },
      { property: "og:title", content: "TechmarqX — Generate Stunning Images & Videos with AI" },
      { property: "og:description", content: "Transform prompts into cinematic images, videos and marketing content." },
    ],
  }),
  component: LandingPage,
});

const galleryItems = [
  { src: gallery1, code: "01. LIQUID FLOW", title: "Experimental macro textures" },
  { src: gallery2, code: "02. ALTITUDE", title: "Cinematic world building" },
  { src: gallery3, code: "03. NEON EDGE", title: "Commercial fashion AI" },
  { src: gallery4, code: "04. STUDIO SET", title: "Product visualization v2" },
];

const styles = ["Realistic", "Cinematic", "Anime", "Logo", "Product", "Fantasy"];

const featureCards = [
  { icon: ImageIcon, title: "AI Image Generator", desc: "Text to image across 6 cinematic styles, HD upscale, PNG / JPG export." },
  { icon: Video, title: "AI Video Studio", desc: "Text-to-video, image-to-video, AI avatars and Reels with voiceover." },
  { icon: Wand2, title: "Prompt Enhancer", desc: "Rewrite rough ideas into model-ready prompts in a single click." },
  { icon: Layers, title: "Templates", desc: "YouTube thumbnails, IG posts, ads and product photos — ratio-ready." },
];

function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

        {/* Floating preview tiles */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-40">
          <div className="absolute top-24 left-[8%] animate-float-slow hidden md:block">
            <img
              src={float1}
              alt=""
              width={192}
              height={256}
              className="w-48 h-64 object-cover rounded-2xl glass-panel"
            />
          </div>
          <div className="absolute bottom-32 right-[8%] animate-float-slower hidden md:block">
            <img
              src={float2}
              alt=""
              width={256}
              height={192}
              className="w-64 h-48 object-cover rounded-2xl glass-panel"
            />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl animate-fade-up">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-6 block">
            Next Generation Engine v4.0
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-balance mb-8 leading-[0.95]">
            Visions into <span className="text-gradient">Reality.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Generate cinematic images, videos, ads and thumbnails from a single prompt — purpose-built for creators, agencies and brands.
          </p>

          {/* Prompt bar */}
          <div className="relative max-w-2xl mx-auto w-full group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition-opacity duration-500" />
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative glass-panel rounded-2xl p-2 flex items-center"
            >
              <Sparkles className="size-5 text-primary ml-4 shrink-0" />
              <input
                type="text"
                placeholder="A cinematic shot of a neon cyberpunk garden..."
                className="flex-1 bg-transparent px-3 py-4 outline-none text-base md:text-lg placeholder:text-muted-foreground/60 font-medium"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-5 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 flex items-center gap-2"
              >
                Generate <ArrowRight className="size-4" />
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {styles.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full border border-border text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:text-primary hover:border-primary/50 transition-colors cursor-pointer"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="px-6 md:px-12 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group glass-panel rounded-2xl p-6 hover:border-primary/40 transition-colors"
              >
                <Icon className="size-6 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Gallery */}
      <section className="px-6 md:px-12 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Studio Gallery</h2>
              <p className="text-muted-foreground mt-2">Curated results from the TechmarqX community</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-white/5 transition-colors">Image Feed</button>
              <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-white/5 transition-colors">Video Reels</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {galleryItems.map((item, i) => (
              <article
                key={item.code}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all hover:border-primary/50"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-mono text-primary mb-1">{item.code}</p>
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                {i === 0 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 overflow-hidden">
                    <div className="h-full w-1/3 bg-primary animate-shimmer" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="px-6 md:px-12 py-24 bg-card/40">
        <div className="max-w-6xl mx-auto glass-panel rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <Zap className="size-6 text-primary mb-4" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to scale your output?</h3>
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl">
              Unlock unlimited generations, HD upscaling and commercial rights with the Pro tier.
            </p>
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">$29<span className="text-sm text-muted-foreground">/mo</span></span>
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Professional</span>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold">Unlimited</span>
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Credits</span>
              </div>
            </div>
          </div>
          <Link
            to="/pricing"
            className="w-full md:w-auto px-10 md:px-12 py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:scale-105 transition-transform shadow-glow text-center"
          >
            Get Full Access
          </Link>
        </div>
      </section>

      <footer className="py-10 border-t border-border flex flex-col md:flex-row justify-between gap-4 px-6 md:px-12">
        <p className="text-xs font-mono text-muted-foreground">© 2026 TECHMARQX — MARQCREATIVE AI — ALL RIGHTS RESERVED</p>
        <div className="flex gap-6 text-xs font-mono text-muted-foreground uppercase">
          <Link to="/templates" className="hover:text-foreground">Templates</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href="#" className="hover:text-foreground">Community</a>
        </div>
      </footer>
    </main>
  );
}
