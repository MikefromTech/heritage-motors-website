import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/whatsapp";
import { isVideoUrl } from "@/lib/media";
import { Calendar, MapPin, Play } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  price: number;
  media_urls: string[];
  location: string | null;
}

export function EventCard({ id, title, date, price, media_urls, location }: EventCardProps) {
  const cover = media_urls?.[0];
  return (
    <article className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition hover:shadow-soft">
      <Link to="/events/$eventId" params={{ eventId: id }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {cover ? (
            isVideoUrl(cover) ? (
              <>
                <video
                  src={cover}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/10">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-background/95 shadow-lg">
                    <Play className="h-5 w-5 translate-x-0.5 fill-foreground text-foreground" />
                  </span>
                </span>
              </>
            ) : (
              <img
                src={cover}
                alt={title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">No image</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
            {formatPrice(price)}
          </span>
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-display text-xl leading-tight">{title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(date)}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            )}
          </div>
        </div>
        <Button asChild variant="soft" size="sm" className="w-full">
          <Link to="/events/$eventId" params={{ eventId: id }}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
