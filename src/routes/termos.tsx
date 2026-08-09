import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos e Condições — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Termos e condições de uso e de compra dos convites digitais da Samara Encanto Convites.",
      },
      { property: "og:title", content: "Termos e Condições — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Regras de uso, compra, entrega e cancelamento dos convites digitais.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Samara Encanto Convites
        </span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Termos e Condições</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: 03 de agosto de 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">1. Quem somos</h2>
            <p className="mt-2">
              Este site é operado por <strong className="text-foreground">Samara Encanto Convites</strong>,
              nome fantasia de <strong className="text-foreground">Samara Roberta Cangane</strong>, CPF
              419.358.788-67, com sede em Monte Aprazível — SP, Brasil ("nós", "nosso"). Vendemos convites
              digitais infantis personalizados, entregues exclusivamente em formato digital (imagem, vídeo ou
              link interativo), sem envio de produto físico. Ao comprar ou utilizar nossos serviços, você
              celebra um contrato diretamente conosco. Contato: WhatsApp (17) 99672-2089 · e-mail
              srcangane@gmail.com · veja também nossa{" "}
              <Link to="/contato" className="text-primary underline">
                página de contato
              </Link>
              .
            </p>
          </section>


          <section>
            <h2 className="font-display text-2xl text-foreground">2. Aceitação dos termos</h2>
            <p className="mt-2">
              Ao acessar o site, criar um pedido ou continuar utilizando nossos serviços, você
              declara que leu, entendeu e concorda com estes Termos. Se você não concorda, por
              favor, não utilize o site. Você declara ter idade legal para contratar ou possuir
              autorização do responsável.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">3. Nosso produto</h2>
            <p className="mt-2">
              Vendemos convites digitais personalizados (arquivos de imagem, vídeo ou conteúdo
              interativo) criados a partir das informações que você fornece no formulário de
              personalização. A entrega é feita em formato digital, por link ou arquivo, dentro do
              prazo informado na página do produto. Não há envio de itens físicos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">4. Informações e conta</h2>
            <p className="mt-2">
              Você se compromete a fornecer informações verdadeiras, completas e atualizadas
              (nome, e-mail, WhatsApp e dados da festa). Você é responsável por manter a
              confidencialidade das suas credenciais de acesso e por toda atividade realizada na
              sua conta. Erros de digitação nos dados enviados podem exigir ajustes e afetar o
              prazo de entrega.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">5. Uso indevido</h2>
            <p className="mt-2">Você não pode usar o site para:</p>
            <ul className="mt-2 space-y-1">
              <li className="ml-5 list-disc">finalidades ilegais ou que violem a lei aplicável;</li>
              <li className="ml-5 list-disc">fraude, spam ou envio de conteúdo enganoso;</li>
              <li className="ml-5 list-disc">
                violar direitos de propriedade intelectual de terceiros, inclusive enviando fotos,
                músicas ou personagens sobre os quais você não tem direitos;
              </li>
              <li className="ml-5 list-disc">
                interferir na segurança do serviço, incluindo malware, varreduras, engenharia
                reversa, raspagem de dados ou tentativas de burlar limites técnicos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              6. Propriedade intelectual e licença de uso
            </h2>
            <p className="mt-2">
              Todos os modelos, artes, textos, marcas, software e demais elementos do site são de
              propriedade da Samara Encanto Convites ou de seus licenciantes. Com a compra, você
              recebe uma licença limitada, não exclusiva e intransferível para uso pessoal do
              convite entregue (divulgação do seu evento). Não é permitido revender, redistribuir,
              comercializar ou usar comercialmente os arquivos.
            </p>
            <p className="mt-2">
              Ao enviar fotos, textos ou músicas, você declara possuir os direitos necessários e
              nos concede uma licença limitada para processar esse conteúdo apenas para produzir e
              entregar o seu convite. Titulares de direitos podem solicitar a remoção de conteúdo
              pela nossa página de contato; casos reincidentes podem levar ao cancelamento do
              pedido e da conta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">7. Disponibilidade do serviço</h2>
            <p className="mt-2">
              Trabalhamos para manter o site sempre disponível, mas não garantimos funcionamento
              ininterrupto ou livre de erros. O serviço é fornecido "no estado em que se encontra",
              e, na máxima extensão permitida pela lei, excluímos garantias implícitas de
              comercialização e adequação a uma finalidade específica.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              8. Pagamentos, assinaturas e impostos
            </h2>
            <p className="mt-2">
              Os preços são exibidos no site e o pagamento é processado no checkout. As condições
              de pagamento, cobrança, impostos, cancelamento e reembolso seguem estes Termos e a
              legislação brasileira aplicável. Consulte também nossa{" "}
              <Link to="/reembolso" className="text-primary underline">
                Política de Reembolso
              </Link>
              .
            </p>
            <p className="mt-2">
              Os meios de pagamento aceitos são PIX e cartão de crédito, processados pelo Asaas. A venda, o suporte e os
              reembolsos são realizados diretamente por nós.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">9. Suspensão e encerramento</h2>
            <p className="mt-2">
              Podemos suspender ou encerrar seu acesso em caso de violação material destes Termos,
              falta de pagamento, risco de fraude ou segurança, ou violações graves e repetidas das
              nossas políticas. Encerrado o acesso, os arquivos já entregues permanecem seus dentro
              da licença concedida; dados da conta podem ser excluídos conforme nossa{" "}
              <Link to="/privacidade" className="text-primary underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">10. Limitação de responsabilidade</h2>
            <p className="mt-2">
              Na máxima extensão permitida pela lei, nossa responsabilidade total fica limitada ao
              valor pago por você nos 12 meses anteriores ao evento que gerou a reclamação. Não
              respondemos por danos indiretos, incidentais ou consequenciais, como lucros cessantes,
              perda de dados ou danos à reputação. Nada nestes Termos exclui responsabilidade por
              dolo, fraude, morte ou lesão pessoal quando a lei não permitir tal exclusão.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">11. Indenização</h2>
            <p className="mt-2">
              Você concorda em nos indenizar por reclamações de terceiros decorrentes do conteúdo
              que você enviar, do uso ilegal do serviço ou da violação destes Termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">12. Disposições gerais</h2>
            <p className="mt-2">
              Estes Termos são regidos pelas leis do Brasil, e fica eleito o foro do domicílio do
              consumidor para dirimir controvérsias. Você não pode ceder este contrato sem nosso
              consentimento; podemos cedê-lo em caso de reorganização societária. Não somos
              responsáveis por atrasos causados por eventos fora do nosso controle razoável (caso
              fortuito ou força maior). Podemos atualizar estes Termos e publicaremos a nova versão
              nesta página.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
