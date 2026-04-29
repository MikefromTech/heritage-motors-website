import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Play } from "lucide-react";
import { formatDate, formatPrice, whatsappReserveUrl } from "@/lib/whatsapp";
import { MediaItem } from "@/components/site/MediaItem";
import { isVideoUrl } from "@/lib/media";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="font-display text-3xl">Event not found</h1>
        <Link to="/events" className="mt-4 inline-block text-sm underline">
          Back to events
        </Link>
      </div>
    </div>
  ),
});

type Event = {
  id: string;
  title: string;
  date: string;
  price: number;
  description: string;
  media_urls: string[];
  location: string | null;
  type: "upcoming" | "past";
};

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const [event, setEvent] = useState<Event | null | "not-found">(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,date,price,description,media_urls,location,type")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data }) => {
        setEvent(data ? (data as Event) : "not-found");
      });
  }, [eventId]);

  if (event === null) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="aspect-[16/9] animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }
  if (event === "not-found") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="grid place-items-center py-32 text-center">
          <h1 className="font-display text-3xl">Event not found</h1>
          <Link to="/events" className="mt-4 text-sm underline">
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const cover = event.media_urls?.[active] ?? event.media_urls?.[0];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-16">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All events
        </Link>

        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-3">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
              {cover ? <MediaItem url={cover} alt={event.title} /> : null}
            </div>
            {event.media_urls && event.media_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {event.media_urls.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setActive(i)}
                    className={`relative aspect-square overflow-hidden rounded-2xl ring-2 transition ${
                      i === active ? "ring-primary" : "ring-transparent hover:ring-border"
                    }`}
                  >
                    {isVideoUrl(url) ? (
                      <>
                        <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 grid place-items-center bg-black/15">
                          <Play className="h-5 w-5 fill-white text-white" />
                        </span>
                      </>
                    ) : (
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 md:pl-4">
            <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium capitalize">
              {event.type}
            </span>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{event.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(event.date)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {event.location}
                </span>
              )}
            </div>
            <p className="mt-3 font-display text-3xl">{formatPrice(event.price)}</p>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
              {event.description}
            </p>

            {event.type === "upcoming" && (
              <Button asChild size="xl" variant="whatsapp" className="mt-7 w-full">
                <a href={whatsappReserveUrl(event.title)} target="_blank" rel="noreferrer">
                  Reserve via WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
