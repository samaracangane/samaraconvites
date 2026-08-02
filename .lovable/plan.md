## Checkout com Paddle nos convites digitais

Verifiquei o projeto: o Paddle ainda **não está ativo** (não há chaves nem código de pagamento), e a tabela `orders` não tem campos de transação. Hoje o formulário de `/personalizar/:slug` apenas grava o pedido como `pending` e mostra "pagamento será integrado em breve".

### O que será feito

**1. Ativar o Paddle (ambiente de testes)**
Cria automaticamente o sandbox — dá para testar o fluxo inteiro sem dinheiro real. Para receber de verdade depois, é preciso completar a verificação do negócio no Paddle (produtos desse tipo podem passar por revisão extra).

**2. Cadastrar os preços**
Cada convite ganha um preço correspondente no Paddle. Guardo o identificador do preço numa nova coluna em `products`, editável no painel admin, para que o valor cobrado seja sempre o do convite escolhido.

**3. Fluxo do checkout em `/personalizar/:slug`**
O botão passa a:
1. Validar o formulário e gravar o pedido com status `pending` (com foto, música e todos os dados da festa);
2. Abrir o checkout do Paddle já com e-mail do cliente e o número do pedido como referência;
3. Ao concluir, levar para uma página de confirmação ("Pagamento aprovado, seu convite está em produção").
Se o cliente fechar o checkout, o pedido continua `pending` e pode ser retomado.

**4. Confirmação automática (webhook)**
Endpoint público que recebe os eventos do Paddle, valida a assinatura e atualiza o pedido sozinho:
- pagamento aprovado → `paid`
- reembolso/estorno → `canceled`
Sem nenhuma ação manual sua.

**5. Painel de pedidos**
`/admin/pedidos` mostra o status real de pagamento e o identificador da transação, mantendo os botões de "entregue" e "cancelar".

### Detalhes técnicos
- Migração: `paddle_price_id` em `products`, `paddle_transaction_id` em `orders`.
- Checkout via Paddle.js no cliente; webhook em `src/routes/api/public/paddle-webhook` com verificação de assinatura HMAC.
- Impostos e compliance ficam com o Paddle (merchant of record), inclusive cobrança para clientes brasileiros. Taxa: 5% + US$0,50 por transação.

### Ordem de execução
Ativar Paddle → migração + preços → checkout → webhook → ajustes no admin.