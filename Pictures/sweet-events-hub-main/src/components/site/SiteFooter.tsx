import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="font-display text-2xl">24.7 cupcakes</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A cupcake a day, keeps the therapist away. Soft, sweet, and always a little extra.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Explore</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/events" className="hover:text-foreground">Upcoming Events</Link></li>
            <li><Link to="/past" className="hover:text-foreground">Past Events</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Stay close</p>
          <a
            href="https://www.instagram.com/24.7_cupcakes"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 hover:bg-accent/30"
          >
            <Instagram className="h-4 w-4" /> @24.7_cupcakes
          </a>
          <p className="mt-4 text-muted-foreground">WhatsApp: +91 78886 77339</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 24.7 cupcakes. Made with frosting.
      </div>
    </footer>
  );
}
