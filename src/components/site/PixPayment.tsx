import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, QrCode, Clock } from "lucide-react";
import { toast } from "sonner";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

/** Bloco de pagamento PIX gerado pelo Asaas: QR Code + código copia e cola. */
export function PixPayment({
  payload,
  amount,
  qrImage,
  expiresAt,
}: {
  payload: string;
  amount: number;
  qrImage?: string | null;
  expiresAt?: string | null;
}) {
  const [qr, setQr] = useState<string | null>(qrImage ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qrImage) {
      setQr(qrImage);
      return;
    }
    let alive = true;
    QRCode.toDataURL(payload, { width: 480, margin: 1 })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [payload, qrImage]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  return (
    <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
        <QrCode className="h-3.5 w-3.5" /> Pagamento via PIX
      </div>

      <div className="mt-4 font-display text-3xl text-foreground">{formatBRL(amount)}</div>

      {expiresAt && (
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Válido até{" "}
          {new Date(expiresAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
        </div>
      )}

      <div className="mx-auto mt-4 w-fit rounded-2xl bg-card p-3 shadow-card">
        {qr ? (
          <img
            src={qr}
            alt="QR Code PIX para pagamento"
            className="h-56 w-56 md:h-64 md:w-64"
            width={256}
            height={256}
          />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center text-xs text-muted-foreground md:h-64 md:w-64">
            Gerando QR Code…
          </div>
        )}
      </div>

      <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
        Abra o app do seu banco, escolha <strong>PIX</strong> e escaneie o QR Code — ou use o código
        copia e cola abaixo.
      </p>

      <div className="mt-4 break-all rounded-2xl border border-border bg-card px-4 py-3 text-left text-[11px] leading-relaxed text-muted-foreground">
        {payload}
      </div>

      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Código copiado" : "Copiar código PIX"}
      </button>

      <p className="mt-3 text-xs text-muted-foreground">
        Assim que o pagamento for confirmado, o status desta página muda sozinho e você recebe um
        e-mail. Não é preciso enviar comprovante.
      </p>
    </div>
  );
}
