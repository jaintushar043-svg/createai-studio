import { createFileRoute } from "@tanstack/react-router";
import { Video, Upload, Mic, Sparkles, Play } from "lucide-react";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/video-studio")({
  head: () => ({
    meta: [
      { title: "Video Studio — CreateAI" },
      { name: "description", content: "Generate AI videos, reels, marketing ads and AI avatars with voiceover support. Export MP4." },
      { property: "og:title", content: "Video Studio — CreateAI" },
      { property: "og:description", content: "Generate AI videos, reels and marketing ads with voiceover." },
    ],
  }),
  component: VideoStudioPage,
});

const modes = [
  { icon: Video, label: "Text → Video" },
  { icon: Upload, label: "Image → Video" },
  { icon: Sparkles, label: "AI Avatar" },
  { icon: Play, label: "Reels Generator" },
];

function VideoStudioPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio / Video</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Video Studio</h1>
        <p className="text-muted-foreground mt-2">Cinematic motion from a prompt, an image or an avatar.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {modes.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            className={`glass-panel rounded-2xl p-5 text-left transition-colors ${
              i === 0 ? "border-primary/40 ring-1 ring-primary/30" : "hover:border-primary/30"
            }`}
          >
            <Icon className="size-5 text-primary mb-3" />
            <p className="text-sm font-semibold">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Scene prompt</label>
            <textarea
              rows={4}
              placeholder="A drone shot flying over misty mountains at sunrise, cinematic anamorphic..."
              className="w-full bg-background/60 border border-border rounded-xl p-4 text-sm outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Duration</label>
              <select className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none">
                <option>5 seconds</option>
                <option>10 seconds</option>
                <option>15 seconds</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Aspect</label>
              <select className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none">
                <option>16:9 Cinematic</option>
                <option>9:16 Reels</option>
                <option>1:1 Square</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/40">
            <div className="flex items-center gap-3">
              <Mic className="size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">Voiceover</p>
                <p className="text-xs text-muted-foreground">AI narration in 28 languages</p>
              </div>
            </div>
            <button className="text-xs font-mono uppercase tracking-widest text-primary">Enable</button>
          </div>

          <button className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 shadow-glow">
            <Sparkles className="size-4" /> Render Video (12 credits)
          </button>
        </div>

        <aside>
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Latest renders</h2>
          <div className="space-y-4">
            {[gallery2, gallery3].map((src, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-border bg-card">
                <img src={src} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="size-12 rounded-full glass-panel flex items-center justify-center">
                    <Play className="size-5 ml-0.5" />
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center text-xs">
                  <span className="font-mono uppercase tracking-widest text-muted-foreground">10s · 1080p</span>
                  <span className="text-primary">MP4</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
