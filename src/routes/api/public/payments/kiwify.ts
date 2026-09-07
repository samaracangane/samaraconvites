import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { applyKiwifyEvent } from "@/lib/kiwify-orders.server";

export const Route = createFileRoute("/api/public/payments/kiwify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = new URL(request.url).searchParams.get("signature");
        const token = process.env["KIWIFY_WEBHOOK_TOKEN"] ?? "";

        if (!token) {
          console.error("[kiwify webhook] KIWIFY_WEBHOOK_TOKEN não configurado");
          return new Response("Webhook token not configured", { status: 500 });
        }

        const expected = createHmac("sha1", token).update(rawBody).digest("hex");
        if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event = String(payload.event_type ?? payload.type ?? "");
        const orderId =
          (payload.sck as string | null) ??
          (payload.order_id as string | null) ??
          (payload.id as string | null);

        if (!orderId) {
          console.error("[kiwify webhook] order_id ausente", payload);
          return new Response("Missing order reference", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        await supabaseAdmin.from("payment_events").insert({
          id: crypto.randomUUID(),
          event,
          order_id: orderId,
          payload: payload as any,
          provider: "kiwify",
          payment_id:
            (payload.payment_id as string | null) ??
            (payload.payment_id as string | null) ??
            (payload.id as string | null),
        });

        try {
          const result = await applyKiwifyEvent(orderId, event, payload);
          return new Response(
            JSON.stringify({ ok: true, changed: result.changed, status: result.payment_status }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (e) {
          console.error("[kiwify webhook] erro ao aplicar evento", orderId, e);
          return new Response("Failed to apply event", { status: 500 });
        }
      },
    },
  },
});
