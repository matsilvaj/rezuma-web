export interface Asset {
  id: string;
  ticker: string;
  name: string | null;
  type: "acao" | "fii" | null;
  created_at: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface Report {
  id: string;
  ticker: string;
  title: string;
  summary: string;
  document_type: string;
  source_url: string;
  published_at: string;
  created_at: string;
  metrics: Record<string, number | string | null> | null;
  /** Derivado do resumo pela API a partir do glossário do backend. */
  glossary?: GlossaryTerm[];
}

export interface UserProfile {
  id: string;
  email: string;
  profile: {
    full_name: string | null;
    notify_email: boolean;
    notify_telegram: boolean;
    telegram_chat_id: string | null;
    created_at: string;
  };
}
