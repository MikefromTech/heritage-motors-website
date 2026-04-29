import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ScanLine, Camera, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/scanner")({
  component: ScannerPage,
});

type ScannedTicket = {
  ticket_id: string;
  name: string;
  status: "valid" | "used";
  events: { title: string; date: string } | null;
};

const SCANNER_ID = "qr-scanner-region";

function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [ticket, setTicket] = useState<ScannedTicket | null>(null);
  const [manual, setManual] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  async function lookup(rawCode: string) {
    // Code may be a full URL or just the ticket id
    let id = rawCode.trim();
    const m = id.match(/\/ticket\/([A-Z0-9-]+)/i);
    if (m) id = m[1];
    const { data, error } = await supabase
      .from("tickets")
      .select("ticket_id,name,status,events(title,date)")
      .eq("ticket_id", id)
      .maybeSingle();
    if (error) return toast.error(error.message);
    if (!data) {
      toast.error("Ticket not found");
      setTicket(null);
      return;
    }
    setTicket(data as ScannedTicket);
  }

  async function startScan() {
    setScanning(true);
    setTicket(null);
    try {
      const html5 = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await stopScan();
          void lookup(decoded);
        },
        () => {}
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Camera unavailable");
      setScanning(false);
    }
  }

  async function stopScan() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear();
    } catch { /* ignore */ }
    scannerRef.current = null;
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      void stopScan();
    };
  }, []);

  async function markUsed() {
    if (!ticket) return;
    const { error } = await supabase
      .from("tickets")
      .update({ status: "used" })
      .eq("ticket_id", ticket.ticket_id);
    if (error) return toast.error(error.message);
    toast.success("Marked as used");
    setTicket({ ...ticket, status: "used" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" /> Check-in scanner
        </h2>
        <p className="text-sm text-muted-foreground">
          Scan a guest's QR code or look up a ticket by ID.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Camera</h3>
            {scanning ? (
              <Button variant="outline" size="sm" onClick={stopScan}>Stop</Button>
            ) : (
              <Button size="sm" onClick={startScan}>
                <Camera className="h-4 w-4" /> Start scan
              </Button>
            )}
          </div>
          <div
            id={SCANNER_ID}
            className="mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-muted"
          />

          <form
            className="mt-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) void lookup(manual);
            }}
          >
            <Input
              placeholder="TKT-XXXX-XXXX"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className="font-mono"
            />
            <Button type="submit" variant="soft">
              <Search className="h-4 w-4" /> Look up
            </Button>
          </form>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
          <h3 className="font-medium">Ticket details</h3>
          {!ticket ? (
            <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Scan or look up a ticket to see details.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2">
                {ticket.status === "valid" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> VALID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" /> USED
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Guest</p>
                <p className="font-display text-2xl">{ticket.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Event</p>
                <p className="font-medium">{ticket.events?.title ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.events ? formatDate(ticket.events.date) : ""}
                </p>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{ticket.ticket_id}</p>
              <Button
                size="lg"
                className="w-full"
                disabled={ticket.status === "used"}
                onClick={markUsed}
              >
                {ticket.status === "used" ? "Already checked in" : "Mark as used"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
