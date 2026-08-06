/** Formatação e parsing pt-BR. Isolado aqui para não repetir regra de moeda. */

export const brl = (v: unknown): string =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Versão compacta para eixos de gráfico: R$ 12,5 mil. */
export const brlCurto = (v: unknown): string => {
  const n = Number(v ?? 0);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')} mil`;
  return n.toFixed(0);
};

/**
 * Converte 'AAAA-MM-DD' para Date ao meio-dia.
 *
 * O meio-dia não é capricho: `new Date('2026-07-31')` é interpretado como UTC
 * e, num fuso negativo como o nosso, exibe 30/07. Ancorar às 12h elimina o
 * erro de um dia — que num sistema de vencimentos seria grave.
 */
export const paraData = (iso: string): Date => new Date(`${iso}T12:00:00`);

export const dataBR = (iso?: string | null): string =>
  iso ? paraData(iso).toLocaleDateString('pt-BR') : '—';

export const diaMes = (iso: string): string =>
  paraData(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const mesAno = (iso: string): string => {
  const d = paraData(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
};

/** Data de hoje em 'AAAA-MM-DD' no fuso local (não em UTC). */
export const hojeISO = (): string => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

/** Primeiro e último dia do mês de uma data ISO. */
export const intervaloDoMes = (iso = hojeISO()) => {
  const d = paraData(iso);
  const ano = d.getFullYear();
  const mes = d.getMonth();
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    inicio: `${ano}-${p(mes + 1)}-01`,
    fim: `${ano}-${p(mes + 1)}-${p(new Date(ano, mes + 1, 0).getDate())}`,
  };
};

/**
 * Lê valor digitado em pt-BR ("1.234,56") e devolve número.
 * Aceita também o formato com ponto decimal, para quem cola de planilha.
 */
export const parseMoeda = (texto: string): number => {
  const limpo = texto.replace(/[^\d,.-]/g, '');
  if (!limpo) return 0;
  const temVirgula = limpo.includes(',');
  const normalizado = temVirgula ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : 0;
};

export const pct = (v: unknown): string =>
  v === null || v === undefined ? '—' : `${Number(v).toFixed(1).replace('.', ',')}%`;
