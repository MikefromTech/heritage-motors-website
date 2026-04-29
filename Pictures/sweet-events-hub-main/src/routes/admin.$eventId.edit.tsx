import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventForm, type EventFormValues } from "@/components/admin/EventForm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$eventId/edit")({
  component: EditEventPage,
});

function EditEventPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<EventFormValues | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setInitial({
          title: data.title,
          date: data.date,
          price: Number(data.price),
          description: data.description,
          media_urls: data.media_urls ?? [],
          type: data.type,
          category: data.category,
          location: data.location ?? "",
        });
      });
  }, [eventId]);

  if (!initial) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Edit event</h2>
      <EventForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          const { error } = await supabase
            .from("events")
            .update({
              title: values.title,
              date: values.date,
              price: values.price,
              description: values.description,
              media_urls: values.media_urls,
              type: values.type,
              category: values.category,
              location: values.location || null,
            })
            .eq("id", eventId);
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success("Event updated");
          navigate({ to: "/admin" });
        }}
      />
    </div>
  );
}
