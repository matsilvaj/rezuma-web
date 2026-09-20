import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "../_components/content-page";

export const metadata: Metadata = {
  title: "Sobre o Rezuma",
  description: "Por que o Rezuma existe, como ele funciona por dentro e quem mantém.",
};

export default function SobrePage() {
  return (
    <ContentPage
      titulo="Sobre o Rezuma"
      resumo="Por que ele existe, como funciona por dentro e quem mantém."
    >
      <h2>Por que existe</h2>
      <p>
        Todo mês, cada FII e cada ação publica documentos sobre si: relatório
        gerencial, informe mensal, fato relevante, resultado trimestral. É tudo
        público, gratuito e endereçado a quem investe. E quase ninguém lê,
        porque são dezenas de páginas em linguagem contábil, por ativo, todo
        mês.
      </p>
      <p>
        O que sobra é decidir pela opinião de outra pessoa, ou seguir com uma
        posição por um motivo que já não vale. O Rezuma existe para encurtar
        essa distância: ele lê o documento inteiro e devolve o que mudou, em
        quatro parágrafos, no dia em que foi publicado.
      </p>

      <h2>Como funciona por dentro</h2>
      <p>
        Duas vezes por dia, um processo automático confere as fontes oficiais
        procurando documentos novos dos ativos que as pessoas cadastraram. Cada
        documento encontrado é baixado, lido por inteiro e transformado em um
        resumo com estrutura fixa: destaque, movimentações, pontos de atenção e
        glossário dos termos técnicos.
      </p>
      <p>
        Duas decisões de projeto moldam o resto:
      </p>
      <ul>
        <li>
          <strong>Número errado é pior que número ausente.</strong> Os valores
          extraídos são conferidos contra o próprio texto do documento, e o que
          não bate é descartado em vez de exibido. Balanço brasileiro publica em
          &quot;R$ mil&quot; ou &quot;R$ milhões&quot;, e um erro de escala transforma três bilhões
          em três trilhões sem avisar ninguém.
        </li>
        <li>
          <strong>O resumo é do documento, não do investidor.</strong> Por isso
          ele é gerado uma vez e serve a todo mundo que acompanha aquele ativo.
          É o que torna o projeto sustentável sendo gratuito: o custo cresce com
          o número de ativos existentes, não com o número de pessoas usando.
        </li>
      </ul>

      <h2>O que ele nunca faz</h2>
      <p>
        Não recomenda compra, venda ou manutenção, não emite opinião sobre preço
        e não promete antecipar o mercado. O documento original fica a um clique
        de cada resumo, e é ele que prevalece. Os detalhes estão nos{" "}
        <Link href="/termos">termos de uso</Link>.
      </p>

      <h2>Quem mantém</h2>
      <p>
        O Rezuma é um projeto independente, feito e mantido por{" "}
        <a href="https://www.linkedin.com/in/matheussilvams/" target="_blank" rel="noopener noreferrer">
          Matheus Silva
        </a>
        , que também é usuário dele. Não tem investidor, não tem publicidade e não
        vende dados. Quem quiser ajudar a pagar servidor e leitura dos
        documentos pode contribuir por Pix, de dentro do painel, sem ganhar
        nada diferente por isso.
      </p>

      <h2>Feito com</h2>
      <p>
        Next.js e TypeScript no site, Python com FastAPI no serviço que lê os
        documentos, PostgreSQL no Supabase, e a API da Anthropic para a leitura.
        As fontes são CVM, FNET e B3.
      </p>
      <p>
        Achou um erro em algum resumo ou tem uma ideia? Escreva pela{" "}
        <Link href="/contato">página de contato</Link>. Feedback de quem usa é o
        que define o que vem a seguir.
      </p>
    </ContentPage>
  );
}
