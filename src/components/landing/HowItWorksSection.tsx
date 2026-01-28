import { Palette, UserPlus, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Personalize com Sua Marca",
    description: "Crie sua conta e configure cores, logo e identidade visual em apenas 5 minutos. Sua plataforma, sua cara.",
    time: "5 minutos",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Cadastre Seus Clientes",
    description: "Importe ou cadastre seus pacientes, crie planos alimentares e treinos personalizados para cada um.",
    time: "Sem limite",
  },
  {
    number: "03",
    icon: BarChart2,
    title: "Acompanhe e Escale",
    description: "Monitore a evolução de todos os clientes em tempo real e escale seu negócio sem aumentar sua carga de trabalho.",
    time: "Automático",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-16 lg:py-24">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comece a Usar em <span className="gradient-text">3 Passos Simples</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sem complicação, sem necessidade de conhecimentos técnicos
          </p>
        </div>

        <div className="relative">
          {/* Connection line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6 relative z-10">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <step.icon className="text-primary" size={36} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {step.description}
                </p>

                {/* Time badge */}
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  {step.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 lg:mt-16 text-center">
          <Button size="lg" className="btn-primary text-base px-8 py-6 h-auto">
            Começar Agora
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
