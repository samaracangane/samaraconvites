import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { playCoinSound } from "@/lib/coin-sound";

const HEART_ICON = "/heart-notification.png";
const PAID_STATUSES = ["paid", "delivered"];

function formatBRL(value: unknown) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

/**
 * Alerta de venda: toca som de moeda e mostra o coração
 * no toast e na notificação do sistema quando um pedido é pago.
 */
export function useSaleAlerts(enabled = true) {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    function announce(order: Record<string, any>) {
      const id = String(order?.id ?? "");
      if (!id || seen.current.has(id)) return;
      seen.current.add(id);

      const title = "Nova venda! 💖";
      const body = `${order.product_title ?? "Convite"} — ${formatBRL(order.price)}${
        order.customer_name ? ` • ${order.customer_name}` : ""
      }`;

      playCoinSound();

      toast.success(title, {
        description: body,
        duration: 10000,
        icon: (
          <img
            src={HEART_ICON}
            alt="Nova venda"
            width={24}
            height={24}
            className="h-6 w-6 animate-pulse"
          />
        ),
      });

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, { body, icon: HEART_ICON, badge: HEART_ICON, tag: id });
        } catch {
          /* ignora */
        }
      }
    }

    const channel = supabase
      .channel("sale-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (PAID_STATUSES.includes(row?.status)) announce(row);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          const prev = payload.old as Record<string, any>;
          if (row?.status === "paid" && prev?.status !== "paid") announce(row);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
