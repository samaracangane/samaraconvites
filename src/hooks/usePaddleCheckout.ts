import { useState } from "react";
import { initializePaddle } from "@/lib/paddle";

/**
 * Abre o checkout Paddle a partir de uma transação criada no servidor.
 * O valor cobrado é definido no servidor a partir do preço do pedido,
 * então nunca há divergência entre o que a loja mostra e o que é cobrado.
 */
export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    transactionId: string;
    successUrl?: string;
    onClose?: () => void;
  }) => {
    setLoading(true);
    try {
      await initializePaddle();

      window.Paddle.Checkout.open({
        transactionId: options.transactionId,
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/pedido-confirmado`,
          allowLogout: false,
          variant: "one-page",
          locale: "pt-BR",
          // Pix, cartão e demais métodos habilitados na conta Paddle
          allowedPaymentMethods: ["pix", "card", "paypal", "google_pay", "apple_pay"],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
