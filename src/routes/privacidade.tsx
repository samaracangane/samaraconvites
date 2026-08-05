import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Como a Samara Encanto Convites coleta, usa, compartilha e protege seus dados pessoais.",
      },
      { property: "og:title", content: "Política de Privacidade — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Transparência sobre o tratamento dos seus dados pessoais na nossa loja.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Samara Encanto Convites
        </span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: 03 de agosto de 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">1. Controlador dos dados</h2>
            <p className="mt-2">
              <strong className="text-foreground">Samara Encanto Convites</strong>, nome fantasia de{" "}
              <strong className="text-foreground">Samara Roberta Cangane</strong> (CPF 419.358.788-67),
              Monte Aprazível — SP, Brasil, é a controladora dos dados pessoais tratados neste site, ou
              seja, decide como e para quê seus dados são utilizados. Para exercer seus direitos ou tirar
              dúvidas, escreva para srcangane@gmail.com ou use a{" "}
              <Link to="/contato" className="text-primary underline">
                página de contato
              </Link>
              .
            </p>

          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">2. Dados que coletamos</h2>
            <ul className="mt-2 space-y-1">
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Cadastro e acesso:</strong> nome, e-mail e
                credenciais de login.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Dados do pedido:</strong> WhatsApp, nome e idade
                do aniversariante, data, horário, local e endereço da festa, mensagem, fotos e
                músicas enviadas.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Atendimento:</strong> mensagens que você nos
                envia.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Uso e técnicos:</strong> endereço IP,
                identificadores de dispositivo, páginas visitadas e registros de segurança.
              </li>
            </ul>
            <p className="mt-2">
              Não armazenamos dados de cartão. O pagamento é processado pelo Asaas, nossa
              instituição de pagamento parceira.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">3. Para que usamos seus dados</h2>
            <ul className="mt-2 space-y-1">
              <li className="ml-5 list-disc">criar e manter sua conta;</li>
              <li className="ml-5 list-disc">
                produzir e entregar o convite personalizado e enviar avisos sobre o pedido;
              </li>
              <li className="ml-5 list-disc">prestar suporte e responder solicitações;</li>
              <li className="ml-5 list-disc">prevenir fraudes e garantir a segurança do site;</li>
              <li className="ml-5 list-disc">melhorar produtos e a experiência de navegação;</li>
              <li className="ml-5 list-disc">
                enviar comunicações de marketing, apenas com o seu consentimento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">4. Bases legais</h2>
            <p className="mt-2">
              Tratamos seus dados para execução do contrato (produção e entrega do convite),
              cumprimento de obrigação legal (fiscal e contábil), legítimo interesse (segurança,
              prevenção a fraudes e melhoria do serviço) e consentimento (marketing e cookies não
              essenciais), conforme a LGPD (Lei 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">5. Com quem compartilhamos</h2>
            <ul className="mt-2 space-y-1">
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Fornecedores de tecnologia:</strong> hospedagem,
                banco de dados, armazenamento de arquivos, envio de e-mails e ferramentas de
                suporte.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Asaas (instituição de pagamento):</strong> para
                processar cobranças por Pix e cartão de crédito, prevenção a fraudes e emissão de
                recibos.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Consultores profissionais:</strong> jurídicos e
                contábeis, quando necessário.
              </li>
              <li className="ml-5 list-disc">
                <strong className="text-foreground">Autoridades públicas:</strong> quando exigido
                por lei ou ordem judicial.
              </li>
            </ul>
            <p className="mt-2">
              Não vendemos seus dados pessoais. Alguns fornecedores podem estar fora do Brasil; nesse
              caso, adotamos salvaguardas contratuais adequadas para a transferência internacional.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">6. Por quanto tempo guardamos</h2>
            <p className="mt-2">
              Mantemos os dados do pedido enquanto sua conta estiver ativa e pelo prazo necessário
              para cumprir obrigações legais e fiscais (em regra, até 5 anos após a compra). Fotos,
              músicas e arquivos de personalização são mantidos apenas pelo tempo necessário para
              produzir e reenviar seu convite, e depois excluídos ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">7. Seus direitos</h2>
            <p className="mt-2">
              Você pode solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio
              ou eliminação de dados desnecessários, portabilidade, informação sobre
              compartilhamentos, revogação do consentimento e revisão de decisões automatizadas.
              Responderemos em até 30 dias. Você também pode apresentar reclamação à Autoridade
              Nacional de Proteção de Dados (ANPD).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">8. Segurança</h2>
            <p className="mt-2">
              Adotamos medidas técnicas e organizacionais apropriadas, como criptografia em trânsito,
              controle de acesso por perfil, armazenamento de arquivos em bucket privado com links
              assinados e registro de atividades administrativas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">9. Cookies</h2>
            <p className="mt-2">
              Usamos cookies essenciais para autenticação, segurança e funcionamento do carrinho e do
              checkout. Cookies de análise ou marketing, quando utilizados, dependem do seu
              consentimento e podem ser gerenciados nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">10. Alterações</h2>
            <p className="mt-2">
              Podemos atualizar esta política. A versão vigente estará sempre publicada nesta página,
              com a data de atualização.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
