export interface Perizinan {
  id: number;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  instansi: string;
  waktuPelayanan: string;
  biaya: string;
  jenisPerizinan: string;
  persyaratan: {
    administratif?: string[];
    teknis?: string[];
    umum?: string[];
    sections?: {
      title: string;
      items: string[];
    }[];
  };
  mekanismeProsedur: string[];
  portalUrl?: string;
  kbliList?: { code: string; name: string }[];
  keywords: string[];
}

export interface KategoriPerizinan {
  key: string;
  name: string;
  desc: string;
  iconName: string;
  questionCount: number;
  questions: string[];
}

export interface SourceItem {
  name: string;
  instansi: string;
  waktu?: string;
  portal?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  via?: 'faq' | 'docrag' | 'ai' | 'gemini-llm-rag' | 'pdf-rag-offline' | string;
  layer?: string;
  sourceItems?: SourceItem[];
  relatedQuestions?: string[];
  needsHuman?: boolean;
  vote?: 'up' | 'down';
  rawHtml?: string;
}

export interface RAGResponse {
  ok: boolean;
  conversation_id?: string | number;
  message_id?: string | number;
  answer: string;
  rawHtml?: string;
  layer: 'guardrail' | 'faq' | 'docrag' | 'ai' | string;
  via: 'faq' | 'docrag' | 'ai' | 'gemini-llm-rag' | 'pdf-rag-offline' | string;
  source_items: SourceItem[];
  related: string[];
  needs_human: boolean;
  error?: string;
}
