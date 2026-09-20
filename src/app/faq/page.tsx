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
        A busca roda três vezes por dia. Quando um documento seu é publicado,
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

      <h2>Por que um número que está no documento não aparece no resumo?</h2>
      <p>
        Porque não foi possível confirmar o valor. Os números extraídos são
        conferidos contra o próprio texto do documento, e o que não bate é
        descartado. A escolha é deliberada: número errado é pior que número
        ausente, principalmente quando se trata de dinheiro. O valor continua no
        documento original, que fica a um clique.
      </p>

      <h2>Posso confiar no resumo para decidir?</h2>
      <p>
        Use o resumo para saber o que aconteceu e onde olhar. Ele é gerado
        automaticamente e pode conter erro ou omissão. Antes de qualquer decisão,
        abra o documento original pelo link que acompanha cada resumo. O Rezuma
        não recomenda compra nem venda, como explicam os{" "}
        <Link href="/termos">termos de uso</Link>.
      </p>

      <h2>Quantos ativos posso acompanhar?</h2>
      <p>
        Até 30 por conta. O limite existe porque cada ativo novo custa
        processamento de leitura, e o Rezuma é gratuito. Carteiras reais
        costumam ficar bem abaixo disso.
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

      <h2>É gratuito mesmo? Vai virar pago?</h2>
      <p>
        É gratuito, sem plano pago e sem anúncio. Não há cobrança futura
        automática. Quem quiser apoiar pode mandar um Pix pelo painel, o que não
        libera nada diferente.
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
