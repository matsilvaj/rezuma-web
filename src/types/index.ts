export interface Asset {
  id: string;
  ticker: string;
  name: string | null;
  type: "acao" | "fii" | null;
  created_at: string;
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
  subscription: {
    status: "trialing" | "active" | "past_due" | "canceled";
    plan: "monthly" | "annual" | null;
    trial_ends_at: string;
    current_period_end: string | null;
  } | null;
}
