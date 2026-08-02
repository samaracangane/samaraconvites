import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
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
  customerPhone?: string
  customerEmail?: string | null
  childName?: string
  partyDate?: string | null
  partyTime?: string | null
  partyLocation?: string | null
}

const Email = ({
  orderId,
  productTitle,
  priceFormatted,
  customerName,
  customerPhone,
  customerEmail,
  childName,
  partyDate,
  partyTime,
  partyLocation,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Novo pedido pago{customerName ? ` de ${customerName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Novo pedido pago 🎉</Heading>
        <Section style={card}>
          <Text style={line}><b>Produto:</b> {productTitle ?? '—'}</Text>
          <Text style={line}><b>Valor:</b> {priceFormatted ?? '—'}</Text>
          <Text style={line}><b>Cliente:</b> {customerName ?? '—'}</Text>
          <Text style={line}><b>WhatsApp:</b> {customerPhone ?? '—'}</Text>
          <Text style={line}><b>E-mail:</b> {customerEmail ?? '—'}</Text>
          <Text style={line}><b>Aniversariante:</b> {childName ?? '—'}</Text>
          <Text style={line}><b>Data:</b> {partyDate ?? '—'}</Text>
          <Text style={line}><b>Horário:</b> {partyTime ?? '—'}</Text>
          <Text style={line}><b>Local:</b> {partyLocation ?? '—'}</Text>
          <Text style={muted}>Pedido: {orderId ?? '—'}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Novo pedido pago — Samara Encanto Convites',
  displayName: 'Pedido pago (admin)',
  previewData: {
    orderId: '2f1c9d10-1111-2222-3333-444455556666',
    productTitle: 'Convite Princesa Encantada',
    priceFormatted: 'R$ 30,00',
    customerName: 'Ana Souza',
    customerPhone: '(11) 99999-0000',
    customerEmail: 'ana@exemplo.com',
    childName: 'Manuela',
    partyDate: '12/09/2026',
    partyTime: '15:00',
    partyLocation: 'Buffet Estrelinha',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', color: '#7a4a63', margin: '0 0 16px' }
const card = { backgroundColor: '#fdf4f8', borderRadius: '12px', padding: '18px 20px' }
const line = { fontSize: '15px', color: '#4a3b43', margin: '4px 0' }
const muted = { fontSize: '12px', color: '#9b8792', margin: '12px 0 0' }

export default Email
