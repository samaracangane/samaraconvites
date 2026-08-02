import * as React from 'react'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  childName?: string
  productTitle?: string
  downloadUrl?: string
  orderUrl?: string
  customerName?: string
}

const Email = ({ childName, productTitle, downloadUrl, orderUrl, customerName }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu convite está pronto! ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={badge}>
          <Text style={badgeText}>Samara Encanto Convites</Text>
        </Section>

        <Heading style={h1}>Seu convite ficou pronto! 💗</Heading>

        <Text style={text}>
          {customerName ? `Oi, ${customerName}! ` : 'Oi! '}
          O convite {productTitle ? `"${productTitle}" ` : ''}
          {childName ? `do(a) ${childName} ` : ''}
          acabou de ser finalizado com muito carinho.
        </Text>

        {downloadUrl && (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={downloadUrl} style={button}>
              Baixar meu convite
            </Button>
          </Section>
        )}

        <Text style={text}>
          Dica: salve o arquivo no celular antes de enviar para a sua lista de convidados.
        </Text>

        <Hr style={hr} />

        {orderUrl && (
          <Text style={muted}>
            Você também pode acessar o convite a qualquer momento pela página do seu pedido:{' '}
            {orderUrl}
          </Text>
        )}
        <Text style={muted}>Obrigada por confiar na Samara Encanto Convites. ✨</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Seu convite está pronto! ✨',
  displayName: 'Convite entregue (cliente)',
  previewData: {
    customerName: 'Maria',
    childName: 'Alice',
    productTitle: 'Convite Encanto Floral',
    downloadUrl: 'https://exemplo.com/convite.mp4',
    orderUrl: 'https://www.samaraconvites.com.br/meu-pedido/123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const badge = { textAlign: 'center' as const, marginBottom: '8px' }
const badgeText = {
  color: '#c98bab', fontSize: '12px', letterSpacing: '1.5px',
  textTransform: 'uppercase' as const, fontWeight: 'bold' as const, margin: '0',
}
const h1 = { color: '#4a3040', fontSize: '26px', textAlign: 'center' as const, margin: '8px 0 20px' }
const text = { color: '#4a3040', fontSize: '15px', lineHeight: '24px' }
const muted = { color: '#8a7a84', fontSize: '13px', lineHeight: '20px' }
const button = {
  backgroundColor: '#e3a6c4', color: '#ffffff', borderRadius: '999px',
  padding: '14px 32px', fontSize: '15px', fontWeight: 'bold' as const, textDecoration: 'none',
}
const hr = { borderColor: '#f1e3ea', margin: '28px 0 16px' }
