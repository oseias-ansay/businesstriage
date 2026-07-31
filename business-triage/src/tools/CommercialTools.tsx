import { useState } from 'react';
import DiagnosticoComercialModal from '../components/DiagnosticoComercialModal';

const ENTREGAS_COMERCIAL = [
  'Score comercial de 0 a 100, com os quatro pilares detalhados',
  'Pontuação critério a critério e ranking dos maiores ganhos possíveis',
  'Leitura da geração de demanda e da dependência de indicação',
  'Relação entre ticket médio e CAC, quando informado',
  'Roteiro dos próximos 90 dias, priorizado por impacto',
];

/** Diagnóstico Comercial — avalia a maturidade da operação de vendas. */
export function DiagnosticoComercial() {
  const [aberto, setAberto] = useState(false);

  return (
    <div>
      <p className="m-0 mb-4 text-sm leading-relaxed text-slate-600">
        São 13 perguntas sobre processo, geração de demanda, equipe e pós-venda. O relatório completo
        chega no seu e-mail em até 24 horas úteis.
      </p>

      <ul className="m-0 mb-6 list-none space-y-2 p-0">
        {ENTREGAS_COMERCIAL.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setAberto(true)} className="btn-accent px-[22px] py-3">
        Iniciar diagnóstico
      </button>

      <p className="m-0 mt-3 text-xs text-slate-400">Leva cerca de 5 minutos.</p>

      <DiagnosticoComercialModal open={aberto} onClose={() => setAberto(false)} />
    </div>
  );
}
