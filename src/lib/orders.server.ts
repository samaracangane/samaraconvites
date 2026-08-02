import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

/** Produto guarda-chuva na Paddle usado para preços customizados por pedido. */
const PADDLE_UMBRELLA_PRODUCT_EXTERNAL_ID = "convite_digital";

let cachedProductId: Partial<Record<PaddleEnv, string>> = {};

async function paddleJson(env: PaddleEnv, path: string, init?: RequestInit) {
  const res = await gatewayFetch(env, path, init);
  const json = (await res.json()) as any;
  if (!res.ok) {
    const detail = json?.error?.detail ?? res.statusText;
    throw new Error(`Paddle ${path}: ${detail}`);
  }
  return json;
}

/** Resolve (e memoriza) o produto guarda-chuva no ambiente informado. */
export async function getUmbrellaProductId(env: PaddleEnv): Promise<string> {
  const cached = cachedProductId[env];
  if (cached) return cached;

  const json = await paddleJson(
    env,
    `/products?external_id=${encodeURIComponent(PADDLE_UMBRELLA_PRODUCT_EXTERNAL_ID)}&status=active`,
  );
  const id = json?.data?.[0]?.id as string | undefined;
  if (!id) {
    throw new Error(
      `Produto "${PADDLE_UMBRELLA_PRODUCT_EXTERNAL_ID}" não encontrado no ambiente ${env}`,
    );
  }
  cachedProductId = { ...cachedProductId, [env]: id };
  return id;
}

/** Localiza ou cria a cliente na Paddle a partir do e-mail. */
export async function findOrCreateCustomer(
  env: PaddleEnv,
  email: string,
  name?: string | null,
): Promise<string | null> {
  try {
    const found = await paddleJson(
      env,
      `/customers?email=${encodeURIComponent(email)}&per_page=1`,
    );
    const existing = found?.data?.[0]?.id as string | undefined;
    if (existing) return existing;

    const created = await paddleJson(env, "/customers", {
      method: "POST",
      body: JSON.stringify({ email, name: name || undefined, locale: "pt-BR" }),
    });
    return (created?.data?.id as string | undefined) ?? null;
  } catch (e) {
    // Cliente é opcional: o checkout coleta o e-mail se não conseguirmos vincular.
    console.warn("[paddle] não foi possível vincular a cliente", e);
    return null;
  }
}

export type CheckoutTransactionInput = {
  env: PaddleEnv;
  orderId: string;
  productTitle: string;
  /** Valor em reais (ex.: 45.9) — convertido para centavos aqui. */
  price: number;
  customerEmail: string;
  customerName?: string | null;
};

/**
 * Cria uma transação na Paddle com preço customizado idêntico ao do pedido.
 * Isso elimina a necessidade de manter um "tier" de preço por produto: o valor
 * cobrado é sempre exatamente o valor gravado no pedido.
 */
export async function createCheckoutTransaction(input: CheckoutTransactionInput) {
  const { env, orderId, productTitle, price, customerEmail, customerName } = input;

  const amountCents = Math.round(Number(price) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 70) {
    throw new Error("Valor do pedido inválido para cobrança (mínimo R$ 0,70)");
  }

  const productId = await getUmbrellaProductId(env);
  const customerId = await findOrCreateCustomer(env, customerEmail, customerName);

  const body: Record<string, unknown> = {
    collection_mode: "automatic",
    currency_code: "BRL",
    custom_data: { orderId, environment: env },
    items: [
      {
        quantity: 1,
        price: {
          product_id: productId,
          name: productTitle.slice(0, 200),
          description: `Convite personalizado — pedido ${orderId.slice(0, 8)}`,
          tax_mode: "account_setting",
          unit_price: { amount: String(amountCents), currency_code: "BRL" },
          quantity: { minimum: 1, maximum: 1 },
        },
      },
    ],
  };
  if (customerId) body["customer_id"] = customerId;

  const json = await paddleJson(env, "/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    transactionId: json?.data?.id as string,
    paddleCustomerId: customerId,
    amountCents,
  };
}
