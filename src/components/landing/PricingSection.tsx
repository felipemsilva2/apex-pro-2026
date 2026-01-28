import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Básico",
    description: "Ideal para quem está começando",
    price: "97",
    period: "/mês",
    clients: "Até 30 clientes",
    features: [
      "Gestão de clientes e prontuários",
      "Planos alimentares ilimitados",
      "App mobile para clientes",
      "Suporte por e-mail",
      "Relatórios básicos",
    ],
    cta: "Começar Teste Grátis",
    popular: false,
  },
  {
    name: "Profissional",
    description: "O mais escolhido pelos nutricionistas",
    price: "197",
    period: "/mês",
    clients: "Até 100 clientes",
    features: [
      "Tudo do plano Básico",
      "Whitelabel completo (sua marca)",
      "Montagem de treinos",
      "Chat integrado com clientes",
      "Dashboard de métricas avançado",
      "Suporte prioritário",
    ],
    cta: "Começar Teste Grátis",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para clínicas e equipes",
    price: "397",
    period: "/mês",
    clients: "Clientes ilimitados",
    features: [
      "Tudo do plano Profissional",
      "Múltiplos profissionais",
      "API de integração",
      "Gerente de conta dedicado",
      "Treinamento personalizado",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="planos" className="py-16 lg:py-24 bg-muted/30">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Planos e Preços
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Escolha o Plano Ideal Para Você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teste grátis por 14 dias. Sem necessidade de cartão de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-elevated p-6 lg:p-8 relative ${
                plan.popular
                  ? "border-2 border-primary ring-4 ring-primary/10 scale-105"
                  : ""
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="fill-current" />
                  Mais Popular
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-primary font-medium mt-2">
                  {plan.clients}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="text-primary" size={12} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.popular ? "btn-primary" : "btn-accent"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            💰 Garantia de 30 dias. Se não gostar, devolvemos seu dinheiro.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
