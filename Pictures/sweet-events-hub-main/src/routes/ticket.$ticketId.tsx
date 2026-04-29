import { createFileRoute, Link } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/whatsapp";
import { ticketUrl } from "@/lib/tickets";
import { whatsappTicketShareUrl } from "@/lib/whatsapp";
import { CheckCircle2, XCircle, Calendar, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ticket/$ticketId")({
  head: () => ({
    meta: [
      { title: "Your ticket — 24.7 cupcakes" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TicketPage,
});

type TicketRow = {
  ticket_id: string;
  name: string;
  status: "valid" | "used";
  created_at: string;
  events: {
    id: string;
    title: string;
    date: string;
    location: string | null;
  } | null;
};

function TicketPage() {
  const { ticketId } = Route.useParams();
  const [ticket, setTicket] = useState<TicketRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const ticketCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("tickets")
        .select("ticket_id,name,status,created_at,events(id,title,date,location)")
        .eq("ticket_id", ticketId)
        .maybeSingle();
      if (!alive) return;
      setTicket((data as TicketRow | null) ?? null);
      setLoading(false);
    })();
    QRCode.toDataURL(ticketUrl(ticketId), {
      width: 480,
      margin: 1,
      color: { dark: "#1a3320", light: "#ffffff" },
    }).then((url) => alive && setQrDataUrl(url));
    return () => {
      alive = false;
    };
  }, [ticketId]);

  async function handleDownload() {
    const node = ticketCardRef.current;
    if (!node || !ticket) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `ticket-${ticket.ticket_id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Ticket downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function handleShare() {
    if (!ticket) return;
    const eventName = ticket.events?.title ?? "the event";
    const url = whatsappTicketShareUrl(eventName, ticketUrl(ticket.ticket_id));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background">
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-8 md:py-12">
        {loading ? (
          <div className="h-[520px] w-full animate-pulse rounded-[2rem] bg-muted" />
        ) : ticket === null ? (
          <div className="w-full rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-card">
            <h1 className="font-display text-3xl">Ticket not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This ticket ID doesn't exist or has been removed.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
            >
              Go home
            </Link>
          </div>
        ) : (
          <>
            <TicketCard ref={ticketCardRef} ticket={ticket} qrDataUrl={qrDataUrl} />

            <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground">
              Show this QR code at the entrance
            </p>

            <div className="mt-6 flex w-full flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleDownload}
                disabled={downloading || !qrDataUrl}
              >
                <Download className="h-4 w-4" />
                {downloading ? "Preparing..." : "Download ticket"}
              </Button>
              <Button size="lg" variant="whatsapp" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share via WhatsApp
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

type TicketCardProps = {
  ticket: TicketRow;
  qrDataUrl: string;
};

const TicketCard = forwardRef<HTMLDivElement, TicketCardProps>(function TicketCard(
  { ticket, qrDataUrl },
  ref
) {
  const isUsed = ticket.status === "used";
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-[2rem] bg-card shadow-[0_30px_80px_-30px_rgba(40,80,40,0.35)] ring-1 ring-border/60"
    >
      {/* Header band */}
      <div className="bg-primary-soft px-8 pt-10 pb-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70">
          24.7 cupcakes • Event pass
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
          {ticket.events?.title ?? "Event"}
        </h1>
        {ticket.events?.date && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground/75">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(ticket.events.date)}
          </p>
        )}
      </div>

      {/* Perforation */}
      <div className="relative h-6 bg-card">
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t border-dashed border-border" />
      </div>

      {/* Body */}
      <div className="px-8 pb-8 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Guest
            </p>
            <p className="mt-1 font-display text-lg leading-tight">{ticket.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Status
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
              {isUsed ? (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">USED</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-primary">VALID</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-7 grid place-items-center">
          <div className="rounded-2xl border border-border/60 bg-white p-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR code"
                crossOrigin="anonymous"
                className={`h-56 w-56 ${isUsed ? "opacity-30 grayscale" : ""}`}
              />
            ) : (
              <div className="h-56 w-56 animate-pulse rounded-md bg-muted" />
            )}
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-xs tracking-[0.2em] text-muted-foreground">
          {ticket.ticket_id}
        </p>
        <p className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          Show this ticket at the entrance
        </p>
      </div>
    </div>
  );
});
