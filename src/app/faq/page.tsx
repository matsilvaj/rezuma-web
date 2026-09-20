import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "../_components/content-page";

export const metadata: Metadata = {
  title: "Perguntas frequentes | Rezuma",
  description: "De onde vêm os documentos, com que frequência chegam e o que fazer quando algo não aparece.",
};

export default function FaqPage() {
  return (
    <ContentPage
      titulo="Perguntas frequentes"
      resumo="As dúvidas que aparecem com mais frequência sobre como o Rezuma funciona."
    >
      <h2>De onde vêm os documentos?</h2>
      <p>
        Das fontes oficiais: o portal de dados da CVM, o FNET, que concentra os
        documentos de fundos imobiliários, e o catálogo de ativos da B3. Nada
        vem de blog, grupo ou casa de análise.
      </p>

      <h2>Com que frequência chegam?</h2>
      <p>
        A busca roda duas vezes por dia, de manhã e no fim da tarde. Quando um documento seu é publicado,
        ele costuma chegar no mesmo dia. Isso depende das fontes: se a CVM
        publicar com atraso, o resumo sai com atraso também.
      </p>

      <h2>Acabei de cadastrar um ativo e não veio nada. É normal?</h2>
      <p>
        Sim, nos primeiros minutos. Quando você adiciona um ativo que ninguém
        acompanhava ainda, o sistema busca as publicações dos últimos dois meses
        e avisa quando terminar. Se o ativo não publicou nada nesse período, não
        há o que mostrar até a próxima publicação dele.
      </p>

      <h2>Como devo usar o resumo?</h2>
      <p>
        Para saber, em poucos minutos, o que mudou no ativo e onde olhar com
        atenção. O Rezuma informa, não aconselha: não é recomendação de
        investimento nem consultoria financeira, e o documento original fica a
        um clique dentro de cada resumo, sempre que você quiser conferir a
        fonte. O restante está nos{" "}
        <Link href="/termos">termos de uso</Link>.
      </p>

      <h2>Quantos ativos posso acompanhar?</h2>
      <p>
        Até 30 por conta, o que cobre com folga as carteiras reais. O limite
        mantém a leitura dos documentos rápida para todo mundo.
      </p>

      <h2>Por onde recebo?</h2>
      <p>
        Por e-mail e, se você vincular, pelo Telegram. Dá para desligar cada
        canal em Conta. Tudo também fica guardado no painel, então nada depende
        de você achar o e-mail depois.
      </p>

      <h2>Como vinculo o Telegram?</h2>
      <p>
        Em Conta, na aba de notificações, clique em conectar. O site abre o bot
        com um código temporário, você envia e pronto. O código vale 15 minutos
        e serve uma vez só.
      </p>

      <h2>Quanto custa?</h2>
      <p>
        Nada. O acesso é gratuito, sem anúncio e sem plano pago, e nenhum
        recurso fica escondido atrás de cobrança. Não existe cobrança
        automática: qualquer mudança nisso seria avisada por e-mail com
        antecedência e dependeria de você aceitar.
      </p>

      <h2>Como apago minha conta?</h2>
      <p>
        Em Conta, na aba de segurança, existe o botão de excluir conta. A
        exclusão é imediata e definitiva: some a conta, os ativos cadastrados, as
        preferências e o vínculo do Telegram.
      </p>

      <h2>Não achei minha dúvida aqui</h2>
      <p>
        Escreva pela <Link href="/contato">página de contato</Link>. As perguntas
        que se repetem viram item desta lista.
      </p>
    </ContentPage>
  );
}
