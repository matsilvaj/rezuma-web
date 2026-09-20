import type { Metadata } from "next";

import { ContentPage } from "../_components/content-page";

export const metadata: Metadata = {
  title: "Política de Privacidade | Rezuma",
  description: "Quais dados o Rezuma coleta, para que usa e como você pode apagá-los.",
};

const CONTATO = "contatorezuma@gmail.com";

export default function PrivacidadePage() {
  return (
    <ContentPage
      titulo="Política de Privacidade"
      resumo="O que o Rezuma coleta, por que coleta, com quem compartilha e como você apaga tudo."
      atualizado="19 de setembro de 2026"
    >
      <h2>Quem trata os seus dados</h2>
      <p>
        O Rezuma é um produto independente mantido por Matheus Silva. Para
        qualquer assunto de privacidade, inclusive para exercer os direitos
        listados aqui, escreva para <strong>{CONTATO}</strong>.
      </p>

      <h2>O que coletamos</h2>

      <h3>Dados que você informa</h3>
      <ul>
        <li><strong>Nome e e-mail</strong>, no cadastro. O e-mail identifica a conta e é por onde os resumos chegam.</li>
        <li><strong>Senha</strong>, que não passa por nós: o cadastro e o login são feitos pelo Supabase, que guarda apenas uma versão cifrada dela.</li>
        <li><strong>Os ativos que você acompanha</strong>, ou seja, os códigos de negociação dos FIIs e ações que você cadastra.</li>
        <li><strong>Preferências de notificação</strong>, como receber ou não por e-mail e por Telegram.</li>
        <li><strong>Identificador do seu Telegram</strong>, apenas se você vincular a conta. Sem vínculo, não temos nada do Telegram.</li>
        <li><strong>Mensagens enviadas pelo formulário de contato</strong>, com o nome e o e-mail que você preencher.</li>
      </ul>

      <h3>Dados gerados pelo uso</h3>
      <ul>
        <li><strong>Registro de envios</strong>, para não mandarmos o mesmo relatório duas vezes.</li>
        <li><strong>Endereço IP</strong>, ao enviar o formulário de contato e nas proteções contra abuso. Serve para barrar robô e excesso de requisições.</li>
      </ul>

      <h3>O que não coletamos</h3>
      <p>
        Não pedimos CPF, não pedimos dados bancários e não temos acesso à sua
        corretora, ao seu saldo ou à quantidade de cotas que você possui.
        Sabemos quais ativos você acompanha, não quanto você tem deles. Também
        não usamos ferramenta de analytics nem rastreadores de publicidade: não
        há cookie de terceiros no site.
      </p>

      <h2>Por que usamos</h2>
      <ul>
        <li><strong>Para prestar o serviço</strong>, que é identificar seus ativos, gerar os resumos e entregá-los. Base legal: execução de contrato, artigo 7º, inciso V da LGPD.</li>
        <li><strong>Para manter o serviço de pé e seguro</strong>, com limites de uso e proteção contra abuso. Base legal: legítimo interesse, artigo 7º, inciso IX.</li>
        <li><strong>Para responder você</strong>, quando escreve pelo formulário. Base legal: legítimo interesse.</li>
      </ul>
      <p>
        Não vendemos, alugamos nem cedemos seus dados para ninguém, e não
        enviamos publicidade de terceiros.
      </p>

      <h2>Com quem compartilhamos</h2>
      <p>
        Apenas com os serviços necessários para o Rezuma funcionar, cada um
        recebendo só o que precisa:
      </p>
      <ul>
        <li><strong>Supabase</strong>: banco de dados e autenticação. É onde ficam sua conta, seus ativos e suas preferências.</li>
        <li><strong>Railway</strong>: onde roda o programa que lê os documentos e envia os resumos.</li>
        <li><strong>Resend</strong>: entrega dos e-mails, tanto os resumos quanto os de login e recuperação de senha.</li>
        <li><strong>Anthropic</strong>: faz a leitura e o resumo dos documentos. Enviamos a eles o texto do documento público da CVM ou do FNET, nunca o seu nome, e-mail ou carteira.</li>
        <li><strong>Telegram</strong>: apenas se você vincular, e apenas para entregar a mensagem.</li>
        <li><strong>Google</strong>: recebe a mensagem do formulário de contato, porque o aviso chega em uma caixa do Gmail.</li>
      </ul>

      <h2>Dados fora do Brasil</h2>
      <p>
        Esses serviços operam com servidores fora do país. A transferência
        internacional acontece nos termos do artigo 33 da LGPD, limitada ao
        necessário para o serviço funcionar.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <ul>
        <li><strong>Dados da conta</strong>: enquanto a conta existir.</li>
        <li><strong>Mensagens de contato</strong>: até 12 meses após a resposta.</li>
        <li><strong>Resumos dos relatórios</strong>: ficam guardados mesmo depois de você sair, porque não são seus. Eles vêm de documentos públicos e são os mesmos para todo mundo que acompanha aquele ativo. Eles não apontam para você.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>A LGPD garante que você possa, a qualquer momento:</p>
      <ul>
        <li><strong>Saber o que temos sobre você</strong> e pedir uma cópia.</li>
        <li><strong>Corrigir</strong> nome e e-mail, direto em Conta.</li>
        <li><strong>Apagar tudo</strong>, pelo botão de excluir conta em Conta, na aba de segurança. A exclusão é imediata e definitiva: some a conta, os ativos, as preferências e o vínculo do Telegram.</li>
        <li><strong>Deixar de receber</strong> e-mails ou mensagens, desligando cada canal em Conta.</li>
        <li><strong>Reclamar</strong> à Autoridade Nacional de Proteção de Dados.</li>
      </ul>
      <p>
        Para os pedidos que não têm botão, escreva para <strong>{CONTATO}</strong>.
      </p>

      <h2>Segurança</h2>
      <p>
        O site e a comunicação com o servidor usam HTTPS. O banco de dados tem
        regras que impedem uma conta de enxergar os dados de outra, e a escrita
        só acontece pela nossa API. As senhas são responsabilidade do Supabase e
        nunca chegam até nós em texto legível. Ainda assim, nenhum sistema é
        infalível: se algum incidente afetar seus dados, avisaremos você e a
        Autoridade Nacional de Proteção de Dados.
      </p>

      <h2>Cookies e armazenamento no navegador</h2>
      <p>
        Usamos apenas o cookie de sessão do Supabase, aquele que mantém você
        logado. Ele é essencial e por isso não pedimos consentimento. O
        navegador também guarda localmente duas preferências suas, que nunca
        saem do seu aparelho: quais relatórios você já abriu e se o convite de
        apoio está recolhido.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Se algo mudar, a data no topo muda junto. Alterações relevantes serão
        avisadas por e-mail antes de valer.
      </p>
    </ContentPage>
  );
}
