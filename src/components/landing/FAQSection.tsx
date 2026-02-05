import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

const faqs = [
  {
    question: "O app é meu mesmo?",
    answer:
      "Sim. Publicamos na Apple Store e Google Play com seu nome, sua foto e seu logo. Para o aluno, o app é SEU e de mais ninguém.",
  },
  {
    question: "Como funciona os 30 dias grátis?",
    answer:
      "Você cadastra, configura seu app e usa TUDO por 30 dias. Se não gostar, cancela com um clique. Não cobramos nada antes do 31º dia.",
  },
  {
    question: "Preciso ter CNPJ?",
    answer:
      "Não. Você pode publicar como pessoa física sem nenhum problema técnico ou burocrático.",
  },
  {
    question: "Já tenho muitos alunos, como migrar?",
    answer:
      "Nosso suporte faz a importação da sua planilha de alunos gratuitamente. Em 24h todos estarão no seu novo app estrategicamente posicionados.",
  },
];

const FAQSection = () => {
  const { tenant } = useTenant();
  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#080808] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="text-center mb-16 lg:mb-24">
          <div className="flex items-center gap-4 justify-center mb-6">
            <span className="h-px w-12 bg-primary/50"></span>
            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
              CENTRAL DE RESPOSTAS
            </span>
            <span className="h-px w-12 bg-primary/50"></span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-6 italic uppercase tracking-tighter text-white">
            DÚVIDAS FREQUENTES <br />
            <span className="text-primary text-blur-sm">(SEM ENROLAÇÃO)</span>
          </h2>
          <p className="font-display font-bold uppercase italic text-sm tracking-[0.2em] text-white/40 max-w-xl mx-auto">
            Direto ao ponto. O que você precisa saber para tomar sua decisão agora.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="athletic-card border border-white/5 bg-white/[0.02] px-6 py-2 overflow-hidden data-[state=open]:border-primary/40 data-[state=open]:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-7 font-display font-black text-primary italic text-xl">Q.</span>
                  <AccordionTrigger className="text-left hover:no-underline py-6 group flex-1">
                    <span className="font-display font-bold italic uppercase text-lg text-white/80 group-hover:text-primary transition-colors pr-8">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="text-base text-white/50 pb-6 font-sans leading-relaxed border-t border-white/5 pt-4 mt-2 ml-10">
                  <span className="font-display font-black text-white/30 italic mr-2 text-sm">R:</span>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions - Tactical Contact */}
        <div className="mt-20 text-center">
          <div className="inline-block p-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
            <div className="bg-black/50 backdrop-blur-md border border-white/5 px-8 py-6 skew-x-[-12deg]">
              <p className="font-display font-bold uppercase italic text-[10px] tracking-widest text-white/40 mb-2 skew-x-[12deg]">
                PRECISA DE AJUDA?
              </p>
              <a
                href={`mailto:suporte@${tenant?.subdomain || 'apexpro'}.pro`}
                className="font-display font-black italic text-xl text-primary hover:text-white transition-colors skew-x-[12deg] block"
              >
                SUPORTE@{tenant?.subdomain?.toUpperCase() || 'APEXPRO'}.PRO
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
