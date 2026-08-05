import {
  createOrderCharge,
  findOrCreateCustomer,
  getAsaasEnv,
  type AsaasEnv,
} from "@/lib/asaas.server";

export type CheckoutChargeInput = {
  orderId: string;
  productTitle: string;
  /** Valor em reais (ex.: 45.9). */
  price: number;
  customerEmail: string;
  customerName: string;
  customerDocument: string;
  customerPhone?: string | null;
};

export type CheckoutChargeResult = {
  paymentId: string;
  paymentUrl: string;
  customerId: string;
  env: AsaasEnv;
};

/**
 * Cria a cobrança do pedido no Asaas com o valor exato gravado no banco.
 * A cliente é levada para a página segura do Asaas, onde escolhe Pix ou cartão.
 */
export async function createCheckoutCharge(
  input: CheckoutChargeInput,
): Promise<CheckoutChargeResult> {
  const customerId = await findOrCreateCustomer({
    name: input.customerName,
    cpfCnpj: input.customerDocument,
    email: input.customerEmail,
    phone: input.customerPhone ?? null,
  });

  const payment = await createOrderCharge({
    customerId,
    orderId: input.orderId,
    productTitle: input.productTitle,
    price: input.price,
  });

  return {
    paymentId: payment.id,
    paymentUrl: payment.invoiceUrl,
    customerId,
    env: getAsaasEnv(),
  };
}
