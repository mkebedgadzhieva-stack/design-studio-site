// src/features/auth/googleLogin.js
import { supabase } from "../../lib/supabase";

export async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/cabinet`,
    },
  });
}
