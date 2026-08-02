import { ADMIN_EMAIL, type PaidOrder } from "@/lib/order-notifications.server";

/**
 * Ponto único de envio dos e-mails de pedido pago.
 * Será ligado ao sistema de e-mails assim que o domínio de envio estiver configurado.
 */
export async function sendOrderPaidEmails(order: PaidOrder, data: Record<string, unknown>) {
  console.log("[emails] pedido pago (envio pendente de configuração de domínio)", {
    admin: ADMIN_EMAIL,
    customer: order.customer_email,
    data,
  });
}
