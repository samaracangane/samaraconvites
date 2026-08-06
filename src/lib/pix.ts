/**
 * Gerador de código PIX "copia e cola" (BR Code / EMV-QRCPS-MPM) do Banco Central.
 * Usado para receber por PIX na conta PicPay da loja.
 */

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** Remove acentos e caracteres não aceitos pelo padrão do BR Code. */
function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .trim()
    .slice(0, max)
    .toUpperCase();
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type PixInput = {
  /** Chave PIX cadastrada no PicPay (CPF, e-mail, telefone ou aleatória). */
  key: string;
  /** Nome do recebedor (máx. 25 caracteres). */
  merchantName: string;
  /** Cidade do recebedor (máx. 15 caracteres). */
  merchantCity: string;
  /** Valor em reais. */
  amount: number;
  /** Identificador do pedido (máx. 25 caracteres, sem espaços). */
  txid: string;
  /** Descrição curta opcional. */
  description?: string | null;
};

/** Monta o código PIX copia e cola com valor e identificador do pedido. */
export function buildPixPayload(input: PixInput): string {
  const key = input.key.trim();
  const txid = sanitize(input.txid.replace(/[^A-Za-z0-9]/g, ""), 25) || "PEDIDO";
  const description = input.description ? sanitize(input.description, 40) : "";

  const merchantAccount =
    tlv("00", "br.gov.bcb.pix") + tlv("01", key) + (description ? tlv("02", description) : "");

  let payload =
    tlv("00", "01") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", input.amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", sanitize(input.merchantName, 25) || "RECEBEDOR") +
    tlv("60", sanitize(input.merchantCity, 15) || "SAO PAULO") +
    tlv("62", tlv("05", txid));

  payload += "6304";
  return payload + crc16(payload);
}
