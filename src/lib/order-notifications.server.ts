export const ADMIN_EMAIL = "srcangane@gmail.com";

export type PaidOrder = {
  id: string;
  product_title: string;
  price: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  child_name: string;
  party_date: string | null;
  party_time: string | null;
  party_location: string | null;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/**
 * Envia os e-mails de confirmação (admin + cliente) quando o pagamento é aprovado.
 * Nunca lança: uma falha de e-mail não pode derrubar o webhook de pagamento.
 */
export async function notifyOrderPaid(order: PaidOrder) {
  const data = {
    orderId: order.id,
    productTitle: order.product_title,
    priceFormatted: formatBRL(Number(order.price ?? 0)),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    childName: order.child_name,
    partyDate: order.party_date,
    partyTime: order.party_time,
    partyLocation: order.party_location,
  };

  try {
    const { sendOrderPaidEmails } = await import("@/lib/order-emails.server");
    await sendOrderPaidEmails(order, data);
  } catch (e) {
    console.error("[emails] falha ao enviar confirmacao do pedido", order.id, e);
  }
}
