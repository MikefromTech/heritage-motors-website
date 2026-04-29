import { useState, useEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Upload, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isVideoUrl } from "@/lib/media";
import { toast } from "sonner";

export type EventFormValues = {
  title: string;
  date: string;
  price: number;
  description: string;
  media_urls: string[];
  type: "upcoming" | "past";
  category: "pickleball" | "sip_paint" | "perfume" | "candlelight" | "other";
  location: string;
};

export function EventForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<EventFormValues>;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EventFormValues>({
    title: initial?.title ?? "",
    date: initial?.date ?? "",
    price: initial?.price ?? 0,
    description: initial?.description ?? "",
    media_urls: initial?.media_urls ?? [],
    type: initial?.type ?? "upcoming",
    category: initial?.category ?? "other",
    location: initial?.location ?? "",
  });
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setValues((v) => ({ ...v, ...initial } as EventFormValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.title, initial?.date]);

  function update<K extends keyof EventFormValues>(key: K, val: EventFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    update("media_urls", [...values.media_urls, u]);
    setUrlInput("");
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const { error } = await supabase.storage
          .from("event-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }
        const { data } = supabase.storage.from("event-media").getPublicUrl(path);
        const url = data.publicUrl.toLowerCase().endsWith("." + ext)
          ? data.publicUrl
          : `${data.publicUrl}#.${ext}`;
        uploaded.push(url);
      }
      if (uploaded.length) {
        update("media_urls", [...values.media_urls, ...uploaded]);
        toast.success(`Uploaded ${uploaded.length} file${uploaded.length === 1 ? "" : "s"}`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handle(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-6 rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={values.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date & time</Label>
          <Input
            id="date"
            type="datetime-local"
            required
            value={values.date ? toLocalInput(values.date) : ""}
            onChange={(e) => update("date", new Date(e.target.value).toISOString())}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1}
            required
            value={values.price}
            onChange={(e) => update("price", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={values.location} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={values.type} onValueChange={(v) => update("type", v as EventFormValues["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Category</Label>
          <Select value={values.category} onValueChange={(v) => update("category", v as EventFormValues["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="candlelight">Candlelight Dinner</SelectItem>
              <SelectItem value="pickleball">Pickleball</SelectItem>
              <SelectItem value="sip_paint">Sip & Paint</SelectItem>
              <SelectItem value="perfume">Perfume Making</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Photos & videos</Label>
          <p className="text-xs text-muted-foreground">
            Upload from your device (images or short MP4 clips, ideally 15–30s) or paste a URL.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="soft"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload files"}
            </Button>
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Or paste a URL https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
            />
            <Button type="button" variant="soft" onClick={addUrl}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {values.media_urls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {values.media_urls.map((url, i) => (
                <div key={url + i} className="group relative aspect-square overflow-hidden rounded-2xl bg-muted">
                  {isVideoUrl(url) ? (
                    <>
                      <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/15">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-background/95 shadow">
                          <Play className="h-4 w-4 translate-x-0.5 fill-foreground text-foreground" />
                        </span>
                      </span>
                    </>
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => update("media_urls", values.media_urls.filter((_, idx) => idx !== i))}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 shadow transition hover:bg-background"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button type="submit" size="lg" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
