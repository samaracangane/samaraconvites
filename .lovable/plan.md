# Alertas no WhatsApp e vendas confirmadas

## Resultado
- Enviar automaticamente ao WhatsApp Business da loja cada venda confirmada, com nome da cliente, produto e valor.
- Criar no painel uma tela exclusiva de vendas confirmadas, com o mesmo estilo rosa, dourado e mágico da loja.

## Implementação
1. Conectar uma conta Twilio com WhatsApp Business e obter as credenciais seguras para envio.
2. Disparar a mensagem somente quando o Asaas confirmar o pagamento, preservando a proteção contra avisos duplicados.
3. Criar `/admin/vendas` protegida para administradores, mostrando apenas pedidos pagos ou entregues.
4. Exibir resumo de faturamento, quantidade de vendas, busca e cartões com cliente, produto, valor, data e situação.
5. Adicionar “Vendas confirmadas” ao menu do painel e validar a visualização em celular e computador.

## Dependência
A automação do WhatsApp depende da conexão da conta Twilio e de um remetente de WhatsApp aprovado. A tela de vendas pode ser concluída independentemente dessa conexão.
