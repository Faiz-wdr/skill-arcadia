import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // CORS Preflight handler
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Keepalive-Token",
      },
    });
  }

  // Enforce POST method only
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Validate secret keepalive token
  const providedToken = req.headers.get("x-keepalive-token");
  const expectedToken = Deno.env.get("KEEPALIVE_TOKEN");

  if (!expectedToken || providedToken !== expectedToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Initialize administrative Supabase client using runtime service role key
  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Perform isolated health/activity write on private.keepalive table
  const { error } = await supabaseAdmin
    .schema("private")
    .from("keepalive")
    .update({
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("Keepalive database error:", error);

    return new Response(
      JSON.stringify({ error: "Database check failed" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});
