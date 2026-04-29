import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MediaItem } from "@/components/site/MediaItem";
import { formatDate } from "@/lib/whatsapp";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/past")({
  head: () => ({
    meta: [
      { title: "Past Events — 24.7 cupcakes" },
      {
        name: "description",
        content:
          "Look back at our past events: Pickleball, Sip & Paint, and Perfume Making, all hosted by 24.7 cupcakes.",
      },
      { property: "og:title", content: "Past Events — 24.7 cupcakes" },
      {
        property: "og:description",
        content: "Pickleball, Sip & Paint, Perfume Making and more — past events by 24.7 cupcakes.",
      },
    ],
  }),
  component: PastPage,
});

type Cat = "pickleball" | "sip_paint" | "perfume";

type PastEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
  category: Cat | "other" | "candlelight";
  media_urls: string[];
};

const SECTIONS: { key: Cat; label: string; blurb: string }[] = [
  { key: "pickleball", label: "Pickleball", blurb: "Court-side cupcakes and friendly rallies." },
  { key: "sip_paint", label: "Sip & Paint", blurb: "Quiet afternoons with brushes and buttercream." },
  { key: "perfume", label: "Perfume Making", blurb: "Crafted scents, paired with our sweetest treats." },
];

function PastPage() {
  const [events, setEvents] = useState<PastEvent[] | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,date,description,category,media_urls")
      .eq("type", "past")
      .order("date", { ascending: false })
      .then(({ data }) => setEvents((data ?? []) as PastEvent[]));
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <header className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Memories</p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">Past events</h1>
          <p className="mt-3 text-muted-foreground">
            Snapshots and short clips from the gatherings we've already shared.
          </p>
        </header>

        <div className="space-y-20">
          {SECTIONS.map((s) => {
            const items = (events ?? []).filter((e) => e.category === s.key);
            return (
              <div key={s.key}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl">{s.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs">
                    {items.length} event{items.length === 1 ? "" : "s"}
                  </span>
                </div>

                {events === null ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    No memories here yet.
                  </div>
                ) : (
                  <div className="space-y-12">
                    {items.map((ev) => (
                      <EventStory key={ev.id} event={ev} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function EventStory({ event }: { event: PastEvent }) {
  const media = event.media_urls ?? [];
  return (
    <article className="rounded-3xl border border-border/60 bg-card p-5 shadow-card md:p-7">
      <header className="mb-5">
        <h3 className="font-display text-2xl md:text-3xl">{event.title}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {formatDate(event.date)}
        </div>
        {event.description && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}
      </header>
      {media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No media yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {media.map((url, i) => (
            <div
              key={url + i}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-muted"
            >
              <MediaItem url={url} alt={event.title} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
