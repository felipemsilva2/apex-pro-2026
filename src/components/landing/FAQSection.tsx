import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso de conhecimentos técnicos para usar a plataforma?",
    answer:
      "Não! O NutriManage Pro foi desenvolvido para ser extremamente intuitivo. Se você sabe usar WhatsApp e planilhas, consegue usar nossa plataforma sem problemas. Além disso, oferecemos tutoriais em vídeo e suporte dedicado para ajudá-lo nos primeiros passos.",
  },
  {
    question: "Meus clientes precisam baixar algum aplicativo?",
    answer:
      "Seus clientes podem acessar a plataforma pelo navegador do celular ou baixar nosso app disponível para iOS e Android. O app terá sua marca e identidade visual, proporcionando uma experiência profissional e personalizada.",
  },
  {
    question: "Posso usar minha própria marca (whitelabel)?",
    answer:
      "Sim! A partir do plano Profissional, você pode personalizar completamente a plataforma com seu logo, cores e identidade visual. Seus clientes verão apenas sua marca, sem nenhuma referência ao NutriManage Pro.",
  },
  {
    question: "Como funciona o suporte ao cliente?",
    answer:
      "Oferecemos suporte por e-mail no plano Básico, suporte prioritário com chat ao vivo no plano Profissional, e um gerente de conta dedicado no plano Enterprise. Nossa equipe é 100% brasileira e responde em português.",
  },
  {
    question: "Existe período de teste gratuito?",
    answer:
      "Sim! Oferecemos 14 dias de teste grátis em todos os planos, sem necessidade de cartão de crédito. Você pode explorar todas as funcionalidades e decidir se a plataforma atende suas necessidades.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Com certeza! Não temos fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel, sem burocracia. Além disso, oferecemos garantia de 30 dias com devolução do dinheiro.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 lg:py-24">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o NutriManage Pro
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="card-elevated px-6 border rounded-xl data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Ainda tem dúvidas? Estamos aqui para ajudar!
          </p>
          <a
            href="mailto:contato@nutrimanagepro.com"
            className="text-primary hover:text-primary/80 font-medium"
          >
            contato@nutrimanagepro.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
