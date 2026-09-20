import type { Metadata } from "next";

import { ContentPage } from "../_components/content-page";

export const metadata: Metadata = {
  title: "Termos de Uso | Rezuma",
  description: "As regras de uso do Rezuma, o que ele é e o que ele não é.",
};

const CONTATO = "contatorezuma@gmail.com";

export default function TermosPage() {
  return (
    <ContentPage
      titulo="Termos de Uso"
      resumo="O que o Rezuma entrega, o que ele não é, e as regras para usar."
      atualizado="19 de setembro de 2026"
    >
      <h2>O que o Rezuma faz</h2>
      <p>
        O Rezuma acompanha os documentos que companhias e fundos publicam em
        fontes oficiais, como CVM, FNET e B3, e entrega um resumo em linguagem
        simples dos ativos que você cadastrou. Ao criar uma conta, você
        concorda com estes termos.
      </p>

      <h2>O que o Rezuma não é</h2>
      <p>
        <strong>Não é recomendação de investimento, análise de valores
        mobiliários nem consultoria financeira.</strong> Nada aqui sugere
        comprar, vender ou manter qualquer ativo. O Rezuma resume o que já é
        público e não emite opinião sobre preço, risco ou perspectiva.
      </p>
      <p>
        Toda decisão é sua e dos profissionais que você consultar. O documento
        original fica sempre a um clique dentro de cada resumo, e ele é a fonte
        que prevalece em qualquer divergência.
      </p>

      <h2>Resumos são automáticos e podem errar</h2>
      <p>
        Os resumos são gerados por um sistema automatizado a partir do texto dos
        documentos. Isso significa que pode haver erro, omissão ou atraso. Nós
        conferimos os números extraídos contra o próprio texto do documento e
        preferimos omitir um dado a exibi-lo errado, mas isso reduz o risco, não
        elimina. Antes de decidir qualquer coisa com base em um resumo, confira
        o documento original.
      </p>
      <p>
        Também não garantimos que todo documento publicado será capturado, nem
        em quanto tempo. As fontes são de terceiros e podem mudar, sair do ar ou
        publicar fora do padrão.
      </p>

      <h2>Sua conta</h2>
      <ul>
        <li>Você precisa ter 18 anos ou mais e informar dados verdadeiros.</li>
        <li>A senha é sua responsabilidade. Se desconfiar de acesso indevido, troque em Conta e nos avise.</li>
        <li>Uma conta é de uma pessoa. Não compartilhe acesso.</li>
        <li>Você pode apagar a conta quando quiser, pelo botão em Conta. A exclusão é definitiva.</li>
      </ul>

      <h2>Uso aceitável</h2>
      <p>Ao usar o Rezuma, você concorda em não:</p>
      <ul>
        <li>Automatizar acesso, raspar conteúdo ou gerar requisições em volume que prejudique o serviço.</li>
        <li>Tentar burlar limites de uso, criar contas em massa ou acessar dados de outras pessoas.</li>
        <li>Revender, republicar como próprio ou redistribuir os resumos em escala.</li>
      </ul>
      <p>
        Para manter o serviço sustentável, cada conta acompanha até 30 ativos e
        existem limites de frequência em algumas ações. Contas que
        insistirem em contornar esses limites podem ser suspensas.
      </p>

      <h2>Gratuidade</h2>
      <p>
        O acesso ao Rezuma é gratuito. Não há plano pago, cobrança automática
        nem recurso reservado a quem paga. Se uma versão paga passar a existir,
        ela será comunicada por e-mail com antecedência e só valerá mediante
        contratação expressa sua. Contribuições voluntárias por Pix, quando
        oferecidas, não são assinatura e não são reembolsáveis.
      </p>

      <h2>Disponibilidade e mudanças</h2>
      <p>
        O serviço é oferecido no estado em que se encontra, sem garantia de
        funcionamento ininterrupto. Podemos alterar funcionalidades, limites ou
        encerrar o Rezuma. Se o encerramento acontecer, avisaremos por e-mail
        com antecedência razoável para você exportar o que precisar.
      </p>

      <h2>Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o Rezuma não responde por
        perdas, prejuízos ou decisões de investimento tomadas com base no
        conteúdo do serviço, nem por indisponibilidade das fontes oficiais. Isso
        não afasta os direitos que o Código de Defesa do Consumidor garante a
        você.
      </p>

      <h2>Conteúdo</h2>
      <p>
        Os documentos originais pertencem às companhias e aos fundos que os
        publicam. O texto dos resumos, a marca e o código do Rezuma pertencem ao
        projeto. Você pode usar os resumos para seu acompanhamento pessoal e
        compartilhar trechos citando a fonte.
      </p>

      <h2>Lei e foro</h2>
      <p>
        Estes termos seguem a lei brasileira. Fica eleito o foro do domicílio do
        consumidor para resolver qualquer questão.
      </p>

      <h2>Dúvidas</h2>
      <p>
        Escreva para <strong>{CONTATO}</strong> ou use a página de contato.
      </p>
    </ContentPage>
  );
}
