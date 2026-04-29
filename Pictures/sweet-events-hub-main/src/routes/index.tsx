import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { formatDate, formatPrice, whatsappReserveUrl } from "@/lib/whatsapp";
import logo from "@/assets/logo.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "24.7 cupcakes — Sweet events, made cozy" },
      {
        name: "description",
        content:
          "Reserve your spot at our next Candlelight Dinner and explore upcoming lifestyle events by 24.7 cupcakes.",
      },
      { property: "og:title", content: "24.7 cupcakes — Sweet events, made cozy" },
      { property: "og:description", content: "A cupcake a day, keeps the therapist away." },
    ],
  }),
  component: HomePage,
});

type Featured = {
  id: string;
  title: string;
  date: string;
  price: number;
  description: string;
  media_urls: string[];
  location: string | null;
};

function HomePage() {
  const [featured, setFeatured] = useState<Featured | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("events")
      .select("id,title,date,price,description,media_urls,location")
      .eq("type", "upcoming")
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setFeatured(data as Featured | null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-soft" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:gap-8 md:px-6 md:py-24 lg:py-32">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Lifestyle events by 24.7 cupcakes
            </span>
            <h1 className="text-balance font-display text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              A cupcake a day,{" "}
              <span className="italic text-muted-foreground">keeps the therapist away.</span>
            </h1>
            <p className="max-w-md text-balance text-lg text-muted-foreground">
              Cozy, curated gatherings with our signature sweetness. Show up, slow down, and leave a little softer.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="xl" variant="hero">
                <Link to="/events">
                  Reserve Spot <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/past">See past events</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-accent/60 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/50 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-primary p-10 shadow-soft">
              <div className="grid h-full place-items-center">
                <img
                  src={logo}
                  alt="24.7 cupcakes"
                  className="max-h-[80%] w-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured upcoming event */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Up next</p>
            <h2 className="mt-1 font-display text-3xl md:text-4xl">Featured event</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/events">All upcoming →</Link>
          </Button>
        </div>

        {featured ? (
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-card">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] overflow-hidden bg-muted md:aspect-auto">
                {featured.media_urls?.[0] && (
                  <img
                    src={featured.media_urls[0]}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center gap-5 p-7 md:p-10">
                <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium">
                  Upcoming · {formatPrice(featured.price)}
                </span>
                <h3 className="font-display text-3xl md:text-4xl">{featured.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {formatDate(featured.date)}
                  </span>
                  {featured.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {featured.location}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{featured.description}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild size="lg" variant="hero">
                    <a href={whatsappReserveUrl(featured.title)} target="_blank" rel="noreferrer">
                      Reserve Spot
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/events/$eventId" params={{ eventId: featured.id }}>
                      View details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-border p-12 text-center text-muted-foreground">
            No upcoming events yet — check back soon.
          </div>
        )}
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Intimate", d: "Small groups, big warmth. Every event feels handcrafted." },
            { t: "Sweet", d: "Always paired with our signature cupcakes and treats." },
            { t: "Effortless", d: "Reserve in one tap on WhatsApp. We handle the rest." },
          ].map((p) => (
            <div key={p.t} className="rounded-3xl border border-border/60 bg-card p-7 shadow-card">
              <h3 className="font-display text-2xl">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
