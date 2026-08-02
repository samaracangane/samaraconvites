## Checkout Paddle + webhook + e-mails de confirmação

Estado atual verificado: o Paddle **ainda não está ativo** (nenhuma chave nem código de pagamento no projeto) e não existe rota de webhook. Então o webhook precisa ser criado junto com a ativação — não há como só "testar" ainda.

### 1. Ativar o Paddle
Cria o ambiente de testes (sandbox) automaticamente, para validar todo o fluxo sem dinheiro real. Para receber de verdade, depois é necessária a verificação do negócio no Paddle.

### 2. Preços dos convites
Nova coluna em `products` guardando o preço correspondente no Paddle, editável no painel admin, para o checkout cobrar sempre o valor do convite escolhido.

### 3. Checkout em `/personalizar/:slug`
1. Grava o pedido como `pending` com todos os dados da festa, foto e música;
2. Abre o checkout do Paddle com e-mail do cliente e o número do pedido como referência;
3. Ao concluir, leva para a página de confirmação.

### 4. Webhook de pagamento
Endpoint público que valida a assinatura do Paddle e atualiza o pedido sozinho:
- pagamento aprovado → `paid`
- recusado → continua `pending` (com aviso no painel)
- reembolso/estorno → `canceled`

### 5. E-mails automáticos (você + cliente)
Quando o pagamento é aprovado, o webhook dispara:
- **Para você:** "Novo pedido pago" com nome, convite, dados da festa e link do painel;
- **Para o cliente:** confirmação de pagamento com resumo e prazo de entrega.

Pré-requisito: o envio de e-mails exige um **domínio próprio** configurado (ex.: `samaraconvites.com.br`, que você já tem). Vou abrir a configuração do domínio de e-mail no meio do processo — leva alguns minutos de propagação de DNS, mas o resto do fluxo continua funcionando.

### 6. Teste do fluxo
Com o sandbox ativo, faço um pedido de teste com cartão de teste do Paddle e confirmo: pedido criado → pagamento → status vira "pago" em `/admin/pedidos` → e-mails registrados. Reporto o resultado.

### Detalhes técnicos
- Migração: `paddle_price_id` em `products`, `paddle_transaction_id` em `orders`.
- Paddle.js no cliente; webhook em `src/routes/api/public/paddle-webhook` com verificação de assinatura HMAC e tratamento idempotente de reenvios.
- E-mails via Lovable Emails (templates React Email com a identidade rosa/dourado da loja).