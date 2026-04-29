import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/whatsapp";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminEventsList,
});

type Row = {
  id: string;
  title: string;
  date: string;
  price: number;
  type: "upcoming" | "past";
  category: string;
};

function AdminEventsList() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id,title,date,price,type,category")
      .order("date", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Event deleted");
    void load();
  }

  if (rows === null) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No events yet.{" "}
        <Link to="/admin/new" className="underline">Create the first one</Link>.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 bg-muted/40 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/40 last:border-0">
              <td className="px-5 py-3 font-medium">{r.title}</td>
              <td className="px-5 py-3 text-muted-foreground">{formatDate(r.date)}</td>
              <td className="px-5 py-3">{formatPrice(r.price)}</td>
              <td className="px-5 py-3 capitalize">{r.type}</td>
              <td className="px-5 py-3 capitalize">{r.category.replace("_", " ")}</td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="soft">
                    <Link to="/admin/$eventId/edit" params={{ eventId: r.id }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
