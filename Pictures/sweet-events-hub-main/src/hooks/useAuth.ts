import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; email: string | null; isAdmin: boolean };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function resolve(userId: string, email: string | null) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setState({ status: "signed-in", userId, email, isAdmin: !!data });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setState({ status: "signed-out" });
      else void resolve(session.user.id, session.user.email ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) setState({ status: "signed-out" });
      else void resolve(session.user.id, session.user.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
