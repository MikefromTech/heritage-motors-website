import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Upcoming" },
  { to: "/past", label: "Past Events" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-primary ring-1 ring-foreground/10">
            <img src={logo} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            24.7 <span className="text-muted-foreground">cupcakes</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "bg-primary-soft text-foreground" }}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="ml-2 rounded-full border border-foreground/10 px-4 py-2 text-sm hover:bg-accent/30"
          >
            Admin
          </Link>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-foreground/10 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-primary-soft" }}
                className="rounded-2xl px-4 py-3 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-foreground/10 px-4 py-3 text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
