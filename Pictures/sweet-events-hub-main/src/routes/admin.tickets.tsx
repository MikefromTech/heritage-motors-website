import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ticket as TicketIcon,
  ExternalLink,
  ScanLine,
  Copy,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { generateTicketId, ticketUrl } from "@/lib/tickets";
import { formatDate, whatsappTicketShareUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTickets,
});

type EventOption = { id: string; title: string; date: string };
type TicketRow = {
  ticket_id: string;
  name: string;
  status: "valid" | "used";
  created_at: string;
  events: { title: string } | null;
};

type LastCreated = {
  ticketId: string;
  guestName: string;
  eventTitle: string;
};

function AdminTickets() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [lastCreated, setLastCreated] = useState<LastCreated | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const [{ data: ev }, { data: tk }] = await Promise.all([
      supabase.from("events").select("id,title,date").order("date", { ascending: false }),
      supabase
        .from("tickets")
        .select("ticket_id,name,status,created_at,events(title)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setEvents((ev ?? []) as EventOption[]);
    setTickets((tk ?? []) as TicketRow[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function generate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !eventId) return;
    setSaving(true);
    try {
      let lastErr: string | null = null;
      for (let i = 0; i < 3; i++) {
        const newId = generateTicketId();
        const { error } = await supabase
          .from("tickets")
          .insert({ ticket_id: newId, name: name.trim(), event_id: eventId });
        if (!error) {
          const ev = events.find((e) => e.id === eventId);
          setLastCreated({
            ticketId: newId,
            guestName: name.trim(),
            eventTitle: ev?.title ?? "Event",
          });
          setName("");
          await load();
          toast.success("Ticket generated");
          return;
        }
        lastErr = error.message;
        if (!error.message.toLowerCase().includes("unique")) break;
      }
      toast.error(lastErr ?? "Failed to create ticket");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(ticketUrl(id));
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1800);
  }

  function shareWhatsApp(eventName: string, id: string) {
    window.open(
      whatsappTicketShareUrl(eventName, ticketUrl(id)),
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-8">
        <div className="flex items-center gap-2">
          <TicketIcon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl">Generate ticket</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          After payment confirmation, generate a ticket and share the link with the guest.
        </p>
        <form onSubmit={generate} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="name">Guest name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title} — {formatDate(ev.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" size="lg" disabled={saving || !name.trim() || !eventId}>
              {saving ? "Creating..." : "Generate ticket"}
            </Button>
          </div>
        </form>

        {lastCreated && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Ticket ready
                </p>
                <p className="mt-2 font-display text-xl leading-tight">
                  {lastCreated.guestName}
                </p>
                <p className="text-sm text-muted-foreground">{lastCreated.eventTitle}</p>
                <p className="mt-2 font-mono text-xs tracking-wider text-muted-foreground">
                  {lastCreated.ticketId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLastCreated(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                onClick={() => copyLink(lastCreated.ticketId)}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy link
                  </>
                )}
              </Button>
              <Button asChild variant="soft">
                <Link to="/ticket/$ticketId" params={{ ticketId: lastCreated.ticketId }} target="_blank">
                  <ExternalLink className="h-4 w-4" /> Open ticket
                </Link>
              </Button>
              <Button
                variant="whatsapp"
                onClick={() => shareWhatsApp(lastCreated.eventTitle, lastCreated.ticketId)}
              >
                <Share2 className="h-4 w-4" /> Share via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent tickets</h2>
          <Button asChild variant="soft">
            <Link to="/admin/scanner">
              <ScanLine className="h-4 w-4" /> Open scanner
            </Link>
          </Button>
        </div>
        {tickets === null ? (
          <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        ) : tickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No tickets yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Ticket</th>
                  <th className="px-5 py-3">Guest</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.ticket_id} className="border-b border-border/40 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs">{t.ticket_id}</td>
                    <td className="px-5 py-3 font-medium">{t.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {t.events?.title ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.status === "valid"
                            ? "bg-primary-soft text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyLink(t.ticket_id)}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="whatsapp"
                          onClick={() => shareWhatsApp(t.events?.title ?? "the event", t.ticket_id)}
                        >
                          <Share2 className="h-3.5 w-3.5" /> Share
                        </Button>
                        <Button asChild size="sm" variant="soft">
                          <Link to="/ticket/$ticketId" params={{ ticketId: t.ticket_id }} target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" /> Open
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
