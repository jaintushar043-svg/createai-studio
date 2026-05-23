import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Download, Heart, Settings2 } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/image-lab")({
  head: () => ({
    meta: [
      { title: "Image Lab — TechmarqX" },
      { name: "description", content: "Generate AI images from text prompts. Choose from realistic, cinematic, anime, logo, product and fantasy styles." },
      { property: "og:title", content: "Image Lab — TechmarqX" },
      { property: "og:description", content: "Generate AI images from text prompts in seconds." },
    ],
  }),
  component: ImageLabPage,
});

const styles = ["Realistic", "Cinematic", "Anime", "Logo", "Product", "Fantasy"];
const ratios = ["1:1", "16:9", "9:16", "4:3", "3:2"];
const results = [gallery1, gallery2, gallery3, gallery4];

function ImageLabPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio / Image Lab</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Image Generator</h1>
        <p className="text-muted-foreground mt-2">Describe what you see — we render the rest.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* Controls */}
        <aside className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Prompt</label>
            <textarea
              rows={5}
              placeholder="A cinematic shot of a neon cyberpunk garden, ultra detailed..."
              className="w-full bg-background/60 border border-border rounded-xl p-4 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Negative prompt</label>
            <input
              placeholder="blurry, low quality, distorted"
              className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 block">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s, i) => (
                <button
                  key={s}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    i === 1 ? "bg-primary/10 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 block">Aspect ratio</label>
            <div className="flex flex-wrap gap-2">
              {ratios.map((r, i) => (
                <button
                  key={r}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    i === 1 ? "bg-primary/10 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 shadow-glow transition-all">
            <Sparkles className="size-4" /> Generate (2 credits)
          </button>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Recent generations</h2>
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <Settings2 className="size-4" /> Filter
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {results.map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-border bg-card">
                <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 p-3 flex justify-end gap-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="size-9 rounded-lg glass-panel flex items-center justify-center hover:text-primary">
                    <Heart className="size-4" />
                  </button>
                  <button className="size-9 rounded-lg glass-panel flex items-center justify-center hover:text-primary">
                    <Download className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
