import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "../_components/content-page";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contato | Rezuma",
  description: "Fale com quem faz o Rezuma: erro em um resumo, sugestão ou dúvida.",
};

export default function ContatoPage() {
  return (
    <ContentPage
      titulo="Contato"
      resumo="Erro em um resumo, ativo que não aparece, sugestão ou qualquer dúvida. Quem lê é quem faz o Rezuma."
    >
      <p>
        Se for sobre um resumo específico, diga o ticker e a data. Com isso dá
        para achar o documento e conferir o que saiu errado.
      </p>
      <p>
        Para assuntos de privacidade, como pedir uma cópia ou a exclusão dos seus
        dados, veja antes a <Link href="/privacidade">política de privacidade</Link>:
        a exclusão tem botão próprio em Conta e acontece na hora.
      </p>

      <div style={{ marginTop: "30px" }}>
        <ContactForm />
      </div>
    </ContentPage>
  );
}
