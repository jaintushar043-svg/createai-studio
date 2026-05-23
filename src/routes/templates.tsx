import { createFileRoute } from "@tanstack/react-router";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import float1 from "@/assets/float-1.jpg";
import float2 from "@/assets/float-2.jpg";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — CreateAI" },
      { name: "description", content: "Ratio-ready templates for YouTube thumbnails, Instagram posts, ads, product photos and recruitment banners." },
      { property: "og:title", content: "Templates — CreateAI" },
      { property: "og:description", content: "Templates for thumbnails, social posts, ads and product photos." },
    ],
  }),
  component: TemplatesPage,
});

const templates = [
  { code: "T01", name: "YouTube Thumbnail", ratio: "1280 × 720 · 16:9", img: gallery2 },
  { code: "T02", name: "Instagram Post", ratio: "1080 × 1350 · 4:5", img: gallery3 },
  { code: "T03", name: "Marketing Ad", ratio: "1200 × 628 · 1.91:1", img: gallery4 },
  { code: "T04", name: "Product Photo", ratio: "1024 × 1024 · 1:1", img: gallery1 },
  { code: "T05", name: "Recruitment Banner", ratio: "1500 × 500 · 3:1", img: float2 },
  { code: "T06", name: "Reel / Story", ratio: "1080 × 1920 · 9:16", img: float1 },
];

const categories = ["All", "Social", "Marketing", "Ecommerce", "Recruitment", "Video"];

function TemplatesPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio / Templates</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Production Templates</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Pre-configured ratios and style descriptors for rapid asset creation.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
              i === 0 ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((t) => (
          <article
            key={t.code}
            className="group glass-panel rounded-2xl overflow-hidden hover:border-primary/40 transition-colors"
          >
            <div className="aspect-[4/3] overflow-hidden bg-card">
              <img src={t.img} alt={t.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-mono text-primary mb-1">{t.code}</p>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">{t.ratio}</p>
              </div>
              <button className="text-xs font-mono uppercase tracking-widest text-foreground hover:text-primary">Use →</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
