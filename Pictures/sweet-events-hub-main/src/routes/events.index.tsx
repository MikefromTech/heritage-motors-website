import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventCard, type EventCardProps } from "@/components/site/EventCard";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Upcoming Events — 24.7 cupcakes" },
      {
        name: "description",
        content: "Explore upcoming lifestyle events by 24.7 cupcakes and reserve your spot.",
      },
      { property: "og:title", content: "Upcoming Events — 24.7 cupcakes" },
      {
        property: "og:description",
        content: "Explore upcoming lifestyle events by 24.7 cupcakes.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<EventCardProps[] | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,date,price,media_urls,location")
      .eq("type", "upcoming")
      .order("date", { ascending: true })
      .then(({ data }) => setEvents((data ?? []) as EventCardProps[]));
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <header className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">Events on the calendar</h1>
          <p className="mt-3 text-muted-foreground">
            Tap a card to view details or reserve directly via WhatsApp.
          </p>
        </header>

        {events === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No upcoming events yet — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} {...e} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
