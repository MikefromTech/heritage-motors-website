import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — 24.7 cupcakes" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const auth = useAuth();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {auth.status === "loading" && (
          <div className="mx-auto h-32 max-w-md animate-pulse rounded-3xl bg-muted" />
        )}
        {auth.status === "signed-out" && <SignInForm />}
        {auth.status === "signed-in" && !auth.isAdmin && (
          <NotAuthorized email={auth.email} />
        )}
        {auth.status === "signed-in" && auth.isAdmin && (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </span>
                <h1 className="mt-2 font-display text-3xl md:text-4xl">Event manager</h1>
                <p className="text-sm text-muted-foreground">{auth.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="soft">
                  <Link to="/admin" activeOptions={{ exact: true }}>Events</Link>
                </Button>
                <Button asChild variant="soft">
                  <Link to="/admin/tickets">Tickets</Link>
                </Button>
                <Button asChild variant="soft">
                  <Link to="/admin/scanner">Scanner</Link>
                </Button>
                <Button asChild variant="default">
                  <Link to="/admin/new">+ New event</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success("Signed out");
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </div>
            <Outlet />
          </>
        )}
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAILS = ["charimike97@gmail.com", "24.7cupcakes@gmail.com"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(normalized)) {
      toast.error("This email is not authorized for admin access.");
      return;
    }
    setLoading(true);
    try {
      // Try sign in first; if user doesn't exist, sign them up automatically.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (signInErr) {
        const msg = signInErr.message.toLowerCase();
        if (msg.includes("invalid") || msg.includes("credentials")) {
          // Try sign up (auto-confirm is enabled)
          const { error: signUpErr } = await supabase.auth.signUp({
            email: normalized,
            password,
            options: { emailRedirectTo: window.location.origin + "/admin" },
          });
          if (signUpErr) throw signUpErr;
          // Try sign in again now that the user exists
          const { error: retryErr } = await supabase.auth.signInWithPassword({
            email: normalized,
            password,
          });
          if (retryErr) throw retryErr;
        } else {
          throw signInErr;
        }
      }
      toast.success("Welcome");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-card">
      <h1 className="font-display text-3xl">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Only authorized admins can manage events.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function NotAuthorized({ email }: { email: string | null }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card p-8 text-center shadow-card">
      <h1 className="font-display text-3xl">Not authorized</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as <span className="font-medium">{email}</span>, but this account doesn't have
        admin access. Ask the site owner to grant your user the <code>admin</code> role.
      </p>
      <Button
        variant="outline"
        className="mt-6"
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
