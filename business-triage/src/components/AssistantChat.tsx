import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import type { ChatMessage } from '../types';

const INITIAL: ChatMessage[] = [
  {
    role: 'bot',
    text: 'Olá! Sou o Assistente Business Triage. Como posso ajudar sua empresa hoje?',
  },
];

/** Regras do protótipo — trocar por chamada à API quando houver backend. */
function pickReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('capital')) {
    return 'Para calcular seu Capital de Giro, acesse a ferramenta "Cálculo de Capital de Giro" no Módulo Financeiro.';
  }
  if (t.includes('margem') || t.includes('preço') || t.includes('preco')) {
    return 'A ferramenta de Margem de Contribuição te ajuda a definir preços e ponto de equilíbrio ideais.';
  }
  if (
    t.includes('tráfego') ||
    t.includes('trafego') ||
    t.includes('anúncio') ||
    t.includes('anuncio') ||
    t.includes('campanha')
  ) {
    return 'Recomendo começar pela Análise de Campanha para identificarmos oportunidades antes de criar novas campanhas.';
  }
  return 'Entendido! Recomendo começar pelo Diagnóstico Financeiro para termos uma visão completa da sua empresa.';
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    const reply: ChatMessage = { role: 'bot', text: pickReply(text) };
    timer.current = window.setTimeout(() => setMessages((prev) => [...prev, reply]), 700);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mb-9 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-navy-900">
          <MessageCircle className="h-[17px] w-[17px] text-emerald-500" />
        </div>
        <span className="text-[15px] font-bold text-navy-900">Assistente Business Triage</span>
      </div>

      <div
        ref={listRef}
        className="mb-4 flex max-h-[220px] flex-col gap-2.5 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'self-end bg-navy-900 text-white'
                : 'self-start bg-slate-100 text-navy-900'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Digite sua pergunta..."
          aria-label="Mensagem para o assistente"
          className="field flex-1 text-[13px]"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Enviar mensagem"
          className="flex cursor-pointer items-center rounded-lg border-none bg-navy-900 px-[18px] text-white transition-colors hover:bg-navy-800"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
