import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type CurrentUser = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
};

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({ user: null, isAdmin: false, loading: true });

  useEffect(() => {
    let active = true;

    async function refresh(user: User | null) {
      if (!user) {
        if (active) setState({ user: null, isAdmin: false, loading: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setState({ user, isAdmin: !!data, loading: false });
    }

    supabase.auth.getUser().then(({ data }) => refresh(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      refresh(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
