import { ADMIN_EMAIL, type PaidOrder } from "@/lib/order-notifications.server";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SITE_URL = "https://www.samaraconvites.com.br";

/**
 * Ponto único de envio dos e-mails de pedido pago (cliente + admin).
 */
export async function sendOrderPaidEmails(order: PaidOrder, data: Record<string, unknown>) {
  const orderUrl = `${SITE_URL}/meu-pedido/${order.id}`;

  if (order.customer_email) {
    try {
      const result = await sendTemplateEmail("order-paid-customer", order.customer_email, {
        templateData: { ...data, orderUrl },
        idempotencyKey: `order-paid-customer-${order.id}`,
      });
      if (!result.sent) {
        console.warn("[emails] cliente suprimido", order.customer_email);
      }
    } catch (e) {
      console.error("[emails] falha no e-mail do cliente", order.id, e);
    }
  }

  try {
    await sendTemplateEmail("order-paid-admin", ADMIN_EMAIL, {
      templateData: { ...data, customerEmail: order.customer_email },
      idempotencyKey: `order-paid-admin-${order.id}`,
    });
  } catch (e) {
    console.error("[emails] falha no e-mail do admin", order.id, e);
  }
}
