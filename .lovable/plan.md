## Ativar Paddle e conectar ao checkout

A verificação de elegibilidade passou: convites digitais personalizados são um produto digital aceito. **Aviso importante:** o Paddle pode pedir uma revisão extra desse tipo de produto antes de liberar pagamentos reais — a aprovação não é garantida. O ambiente de **testes** funciona imediatamente, então dá para construir e validar todo o fluxo hoje.

### O que será feito

**1. Ativar o Paddle**
Cria automaticamente um ambiente de testes (sandbox). Você não precisa de conta Paddle prévia. Para receber de verdade, depois é necessário completar a verificação do negócio.

**2. Cadastrar os produtos**
Hoje o preço vem da tabela de produtos do banco. Para o checkout, cada convite precisa de um produto/preço correspondente no Paddle. Duas abordagens:
- **Recomendada:** criar produtos no Paddle a partir dos convites já cadastrados e guardar o ID do preço numa nova coluna `paddle_price_id` na tabela `products`, editável pelo painel admin.
- Alternativa: um único produto "Convite digital" com preço variável — mais simples, mas relatórios do Paddle ficam genéricos.

**3. Checkout no formulário de personalização**
Em `/personalizar/:slug`, o botão "Enviar pedido" passa a:
1. Gravar o pedido no banco com status `pending` (como hoje, incluindo foto/música e todos os dados da festa);
2. Abrir o checkout do Paddle com o preço do convite, e-mail do cliente e o `order_id` como referência;
3. Após pagamento, redirecionar para uma página de confirmação.

**4. Webhook de confirmação**
Endpoint público que recebe os eventos do Paddle, valida a assinatura e atualiza o pedido para `paid` automaticamente — sem intervenção manual.

**5. Painel de pedidos**
`/admin/pedidos` passa a mostrar o status real de pagamento (pago/pendente) vindo do Paddle, mantendo os botões de "entregue"/"cancelar".

### Detalhes técnicos
- Migração: coluna `paddle_price_id` em `products` e `paddle_transaction_id` em `orders`.
- Checkout via Paddle.js no cliente; criação de transação e webhook em rotas de servidor (`src/routes/api/public/paddle-webhook`), com verificação de assinatura.
- Impostos, moeda e compliance ficam por conta do Paddle (merchant of record), incluindo cobrança em BRL para clientes brasileiros.
- Taxa: 5% + US$0,50 por transação, tudo incluso.

### Ordem de execução
Ativar Paddle → cadastrar produtos → checkout → webhook → ajustes no admin.
