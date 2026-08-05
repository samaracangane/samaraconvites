/**
 * Cliente do Asaas (gateway de pagamento brasileiro) — Pix e cartão de crédito.
 * Todo o acesso acontece no servidor: a chave nunca vai para o navegador.
 */

export type AsaasEnv = "sandbox" | "live";

function getApiKey(): string {
  const key = process.env["ASAAS_API_KEY"];
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return key.trim();
}

/** Ambiente derivado da própria chave (chaves de teste contêm "hmlg"). */
export function getAsaasEnv(): AsaasEnv {
  const explicit = process.env["ASAAS_ENV"]?.trim().toLowerCase();
  if (explicit === "sandbox" || explicit === "live") return explicit;
  return getApiKey().includes("hmlg") ? "sandbox" : "live";
}

function baseUrl(env: AsaasEnv): string {
  return env === "sandbox"
    ? "https://api-sandbox.asaas.com/v3"
    : "https://api.asaas.com/v3";
}

async function asaasFetch<T = any>(
  path: string,
  init?: RequestInit & { method?: string },
): Promise<T> {
  const env = getAsaasEnv();
  const res = await fetch(`${baseUrl(env)}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      "User-Agent": "SamaraEncantoConvites",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* resposta não-JSON */
  }

  if (!res.ok) {
    const detail =
      json?.errors?.map((e: any) => e.description).join(" | ") ||
      json?.message ||
      text ||
      res.statusText;
    console.error(`[asaas] ${init?.method ?? "GET"} ${path} -> ${res.status}: ${detail}`);
    throw new Error(`Falha no pagamento: ${detail}`);
  }

  return json as T;
}

export function onlyDigits(v: string | null | undefined): string {
  return (v ?? "").replace(/\D+/g, "");
}

/** Valida CPF (11) ou CNPJ (14) por dígitos verificadores. */
export function isValidCpfCnpj(raw: string): boolean {
  const v = onlyDigits(raw);
  if (v.length === 11) {
    if (/^(\d)\1{10}$/.test(v)) return false;
    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(v[i]) * (len + 1 - i);
      const d = (sum * 10) % 11;
      return d === 10 ? 0 : d;
    };
    return calc(9) === Number(v[9]) && calc(10) === Number(v[10]);
  }
  if (v.length === 14) {
    if (/^(\d)\1{13}$/.test(v)) return false;
    const calc = (len: number) => {
      const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(v[i]) * (weights[i] as number);
      const d = sum % 11;
      return d < 2 ? 0 : 11 - d;
    };
    return calc(12) === Number(v[12]) && calc(13) === Number(v[13]);
  }
  return false;
}

/** Localiza (pelo CPF/CNPJ) ou cria a cliente no Asaas. */
export async function findOrCreateCustomer(input: {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string | null;
}): Promise<string> {
  const cpfCnpj = onlyDigits(input.cpfCnpj);

  const found = await asaasFetch<{ data?: Array<{ id: string }> }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}&limit=1`,
  );
  const existing = found?.data?.[0]?.id;
  if (existing) return existing;

  const created = await asaasFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name.slice(0, 100),
      cpfCnpj,
      email: input.email,
      mobilePhone: onlyDigits(input.phone) || undefined,
      notificationDisabled: false,
    }),
  });
  return created.id;
}

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  billingType: string;
  invoiceUrl: string;
  externalReference?: string | null;
};

/** Cria a cobrança do pedido (cliente escolhe Pix ou cartão na página do Asaas). */
export async function createOrderCharge(input: {
  customerId: string;
  orderId: string;
  productTitle: string;
  /** Valor em reais (ex.: 45.9). */
  price: number;
}): Promise<AsaasPayment> {
  const value = Math.round(Number(input.price) * 100) / 100;
  if (!Number.isFinite(value) || value < 5) {
    throw new Error("Valor do pedido inválido para cobrança (mínimo R$ 5,00)");
  }

  const due = new Date();
  due.setDate(due.getDate() + 3);
  const dueDate = due.toISOString().slice(0, 10);

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED",
      value,
      dueDate,
      description: `${input.productTitle} — convite digital personalizado`.slice(0, 500),
      externalReference: input.orderId,
    }),
  });
}

/** Consulta a cobrança direto no Asaas (usado para confirmar o webhook). */
export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}
