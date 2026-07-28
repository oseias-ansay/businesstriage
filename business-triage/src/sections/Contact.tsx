import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { SITE } from '../data/content';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: integrar com o backend / serviço de e-mail.
    setSent(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="bg-white px-6 py-[90px]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap gap-14">
        <div className="min-w-[280px] flex-1 basis-80">
          <div className="eyebrow">Contato</div>
          <h2 className="m-0 mb-4 text-[30px] font-extrabold tracking-[-0.01em] text-navy-900">
            Vamos diagnosticar sua empresa
          </h2>
          <p className="m-0 mb-7 text-[15px] leading-[1.7] text-slate-600">
            Preencha o formulário ou fale diretamente pelo WhatsApp — respondemos em até 1 dia útil.
          </p>

          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mb-7 inline-flex items-center gap-2.5 rounded-[10px] bg-emerald-600 px-[22px] py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <Phone className="h-[17px] w-[17px]" />
            Falar no WhatsApp
          </a>

          <div className="flex flex-col gap-3.5 text-sm text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-emerald-600" />
              {SITE.email}
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              {SITE.location}
            </div>
          </div>
        </div>

        <div className="min-w-[300px] flex-1 basis-[400px]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-8"
          >
            <div className="flex flex-wrap gap-4">
              <input className="field flex-1 basis-[200px]" placeholder="Nome" required />
              <input
                className="field flex-1 basis-[200px]"
                type="email"
                placeholder="E-mail"
                required
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <input className="field flex-1 basis-[200px]" placeholder="Telefone" />
              <input className="field flex-1 basis-[200px]" placeholder="Nome da Empresa" />
            </div>
            <textarea className="field w-full resize-y" placeholder="Mensagem" rows={4} />
            <button type="submit" className="btn-navy w-full">
              Enviar mensagem
            </button>

            {sent && (
              <div
                role="status"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-600"
              >
                <CheckCircle className="h-4 w-4" />
                Mensagem enviada com sucesso!
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
