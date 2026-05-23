import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Download, Loader2, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { generateImage, listMyGenerations, getMyProfile } from "@/lib/generations.functions";

export const Route = createFileRoute("/image-lab")({
  head: () => ({
    meta: [
      { title: "Image Lab — TechmarqX" },
      { name: "description", content: "Generate AI images from text prompts. Realistic, cinematic, anime, logo, product and fantasy styles." },
    ],
  }),
  component: ImageLabPage,
});

const styles = ["Realistic", "Cinematic", "Anime", "Logo", "Product", "Fantasy"];
const ratios = ["1:1", "16:9", "9:16", "4:3", "3:2"];
const IMAGE_COST = 2;

function ImageLabPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const callGenerate = useServerFn(generateImage);
  const fetchGens = useServerFn(listMyGenerations);
  const fetchProfile = useServerFn(getMyProfile);

  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState<string>("Cinematic");
  const [ratio, setRatio] = useState<string>("16:9");

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile(), enabled: !!user });
  const gens = useQuery({ queryKey: ["my-generations"], queryFn: () => fetchGens(), enabled: !!user });

  const mutate = useMutation({
    mutationFn: () => callGenerate({ data: { prompt, negativePrompt: negative || undefined, style, aspectRatio: ratio } }),
    onSuccess: () => {
      toast.success("Image ready");
      qc.invalidateQueries({ queryKey: ["my-generations"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Generation failed"),
  });

  const onGenerate = () => {
    if (!user) { navigate({ to: "/login" }); return; }
    if (prompt.trim().length < 3) return toast.error("Add a longer prompt");
    mutate.mutate();
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2">Studio / Image Lab</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Image Generator</h1>
          <p className="text-muted-foreground mt-2">Describe what you see — we render the rest.</p>
        </div>
        {user && (
          <div className="glass-panel rounded-xl px-4 py-2 text-sm">
            <span className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground">Credits</span>
            <span className="ml-3 font-bold text-primary">{profile.data?.credits ?? "—"}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <aside className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Prompt</label>
            <textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic shot of a neon cyberpunk garden, ultra detailed..."
              className="w-full bg-background/60 border border-border rounded-xl p-4 text-sm outline-none focus:border-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Negative prompt</label>
            <input value={negative} onChange={(e) => setNegative(e.target.value)}
              placeholder="blurry, low quality, distorted"
              className="w-full bg-background/60 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 block">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    style === s ? "bg-primary/10 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 block">Aspect ratio</label>
            <div className="flex flex-wrap gap-2">
              {ratios.map((r) => (
                <button key={r} onClick={() => setRatio(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    ratio === r ? "bg-primary/10 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          <button onClick={onGenerate} disabled={mutate.isPending || loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 shadow-glow transition-all disabled:opacity-50">
            {mutate.isPending ? (<><Loader2 className="size-4 animate-spin" /> Rendering…</>) : (<><Sparkles className="size-4" /> Generate ({IMAGE_COST} credits)</>)}
          </button>
          {!user && !loading && (
            <p className="text-xs text-muted-foreground text-center">Sign in to start generating — 20 free credits await.</p>
          )}
        </aside>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Recent generations</h2>
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <Settings2 className="size-4" /> Filter
            </button>
          </div>
          {!user ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-sm text-muted-foreground">
              Sign in to see your renders.
            </div>
          ) : gens.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (gens.data ?? []).length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-sm text-muted-foreground">
              Your generations will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {gens.data!.filter(g => g.output_url).map((g) => (
                <div key={g.id} className="group relative rounded-2xl overflow-hidden border border-border bg-card">
                  <img src={g.output_url!} alt={g.prompt} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 p-3 flex justify-between items-end gap-2 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs line-clamp-2 flex-1 text-white/90">{g.prompt}</p>
                    <a href={g.output_url!} target="_blank" rel="noreferrer" download
                      className="size-9 rounded-lg glass-panel flex items-center justify-center hover:text-primary shrink-0">
                      <Download className="size-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
