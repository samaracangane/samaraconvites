import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  orderId?: string
  productTitle?: string
  priceFormatted?: string
  customerName?: string
  childName?: string
  partyDate?: string | null
  partyTime?: string | null
  partyLocation?: string | null
  orderUrl?: string
}

const Email = ({
  orderId,
  productTitle = 'Seu convite digital',
  priceFormatted,
  customerName,
  childName,
  partyDate,
  partyTime,
  partyLocation,
  orderUrl,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Recebemos seu pagamento — seu convite já está em produção ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Samara Encanto Convites</Text>
        <Heading style={h1}>Pagamento confirmado ✨</Heading>
        <Text style={text}>
          {customerName ? `Oi, ${customerName}!` : 'Oi!'} Recebemos seu pagamento e já
          começamos a preparar {childName ? `o convite da ${childName}` : 'o seu convite'}.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{productTitle}</Text>
          {priceFormatted ? <Text style={cardLine}>Valor: {priceFormatted}</Text> : null}
          {childName ? <Text style={cardLine}>Aniversariante: {childName}</Text> : null}
          {partyDate ? <Text style={cardLine}>Data: {partyDate}</Text> : null}
          {partyTime ? <Text style={cardLine}>Horário: {partyTime}</Text> : null}
          {partyLocation ? <Text style={cardLine}>Local: {partyLocation}</Text> : null}
          {orderId ? <Text style={cardMuted}>Pedido: {orderId}</Text> : null}
        </Section>

        {orderUrl ? (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={orderUrl} style={button}>
              Acompanhar meu pedido
            </Button>
          </Section>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>
          Em breve entraremos em contato por e-mail com a prévia do seu convite.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Pagamento confirmado — seu convite está a caminho ✨',
  displayName: 'Pedido pago (cliente)',
  previewData: {
    orderId: '2f1c9d10-1111-2222-3333-444455556666',
    productTitle: 'Convite Princesa Encantada',
    priceFormatted: 'R$ 30,00',
    customerName: 'Ana',
    childName: 'Manuela',
    partyDate: '12/09/2026',
    partyTime: '15:00',
    partyLocation: 'Buffet Estrelinha',
    orderUrl: 'https://www.samaraconvites.com.br/meu-pedido/2f1c9d10',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, Arial, sans-serif' }
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
  border: '1px solid #f4e3ec',
  borderRadius: '16px',
}
const brand = {
  fontSize: '13px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: '#c9a227',
  margin: '0 0 8px',
}
const h1 = { fontSize: '24px', color: '#7a4a63', margin: '0 0 12px' }
const text = { fontSize: '16px', lineHeight: '24px', color: '#4a3b43' }
const card = {
  backgroundColor: '#fdf4f8',
  borderRadius: '12px',
  padding: '18px 20px',
  margin: '20px 0',
}
const cardTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#7a4a63', margin: '0 0 8px' }
const cardLine = { fontSize: '15px', color: '#4a3b43', margin: '4px 0' }
const cardMuted = { fontSize: '12px', color: '#9b8792', margin: '10px 0 0' }
const button = {
  backgroundColor: '#e8a0bf',
  color: '#ffffff',
  padding: '12px 26px',
  borderRadius: '999px',
  fontSize: '15px',
  textDecoration: 'none',
}
const hr = { borderColor: '#f4e3ec', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#9b8792' }

export default Email
