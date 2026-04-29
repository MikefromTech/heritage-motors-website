import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { EventForm } from "@/components/admin/EventForm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/new")({
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Create event</h2>
      <EventForm
        submitLabel="Create event"
        onSubmit={async (values) => {
          const { error } = await supabase.from("events").insert({
            title: values.title,
            date: values.date,
            price: values.price,
            description: values.description,
            media_urls: values.media_urls,
            type: values.type,
            category: values.category,
            location: values.location || null,
          });
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success("Event created");
          navigate({ to: "/admin" });
        }}
      />
    </div>
  );
}
