/**
 * Cliente da API do Asaas (server-only).
 * A credencial vive apenas em ASAAS_API_KEY (secret do backend) e nunca é
 * exposta ao navegador.
 *
 * Docs: https://docs.asaas.com
 */

const SANDBOX_BASE = "https://api-sandbox.asaas.com/v3";
const PROD_BASE = "https://api.asaas.com/v3";

export type AsaasBillingType = "PIX" | "CREDIT_CARD";

function getApiKey(): string {
  const key = process.env["ASAAS_API_KEY"];
  if (!key) throw new Error("ASAAS_API_KEY não configurada");
  return key.trim();
}

/** sandbox por padrão; produção só quando ASAAS_ENV=production. */
export function getAsaasEnv(): "sandbox" | "production" {
  const env = (process.env["ASAAS_ENV"] ?? "").trim().toLowerCase();
  if (env === "production" || env === "prod" || env === "live") return "production";
  return "sandbox";
}

function baseUrl(): string {
  return getAsaasEnv() === "production" ? PROD_BASE : SANDBOX_BASE;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      "User-Agent": "SamaraEncantoConvites",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const description =
      body?.errors?.[0]?.description ?? body?.message ?? `Asaas respondeu ${res.status}`;
    // Log sem dados sensíveis.
    console.error("[asaas] erro", path, res.status, description);
    throw new Error(description);
  }

  return body as T;
}

export type AsaasCustomer = { id: string };

export async function findOrCreateCustomer(input: {
  name: string;
  email: string | null;
  cpfCnpj: string;
  phone?: string | null;
}): Promise<string> {
  const doc = input.cpfCnpj.replace(/\D/g, "");
  const existing = await asaasFetch<{ data?: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(doc)}&limit=1`,
  );
  if (existing?.data?.[0]?.id) return existing.data[0].id;

  const created = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email ?? undefined,
      cpfCnpj: doc,
      mobilePhone: input.phone ? input.phone.replace(/\D/g, "") : undefined,
      notificationDisabled: false,
    }),
  });
  return created.id;
}

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  invoiceUrl: string;
  dueDate: string;
  billingType: string;
};

export async function createPayment(input: {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  description: string;
  externalReference: string;
  dueDate: string;
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
    }),
  });
}

export type AsaasPixQr = {
  encodedImage: string;
  payload: string;
  expirationDate: string | null;
};

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQr> {
  return asaasFetch<AsaasPixQr>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

/** Data de vencimento: hoje + n dias, no formato YYYY-MM-DD (fuso de Brasília). */
export function dueDateInDays(days: number): string {
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

/** Status do Asaas -> status financeiro amigável usado na loja. */
export function mapAsaasStatus(status: string): {
  payment_status: string;
  paid: boolean;
  canceled: boolean;
} {
  const s = (status ?? "").toUpperCase();
  switch (s) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return { payment_status: "paid", paid: true, canceled: false };
    case "AWAITING_RISK_ANALYSIS":
    case "PENDING":
      return { payment_status: s === "PENDING" ? "pending" : "in_analysis", paid: false, canceled: false };
    case "OVERDUE":
      return { payment_status: "overdue", paid: false, canceled: false };
    case "REFUNDED":
    case "REFUND_REQUESTED":
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
      return { payment_status: "refunded", paid: false, canceled: true };
    case "PAYMENT_DELETED":
    case "DELETED":
      return { payment_status: "canceled", paid: false, canceled: true };
    case "PAYMENT_REPROVED_BY_RISK_ANALYSIS":
    case "DECLINED":
      return { payment_status: "declined", paid: false, canceled: false };
    default:
      return { payment_status: s.toLowerCase() || "pending", paid: false, canceled: false };
  }
}
