import { 
  Users, 
  Utensils, 
  Dumbbell, 
  BarChart3, 
  MessageCircle, 
  Palette,
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestão Completa de Clientes",
    description: "Prontuários digitais, histórico de atendimentos e evolução de cada paciente em um só lugar.",
  },
  {
    icon: Utensils,
    title: "Planos Alimentares Personalizados",
    description: "Crie dietas customizadas com banco de alimentos completo, cálculo automático de macros e receitas.",
  },
  {
    icon: Dumbbell,
    title: "Montagem de Treinos",
    description: "Biblioteca de exercícios com vídeos, montagem de treinos e acompanhamento de carga progressiva.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de Métricas",
    description: "Acompanhe a evolução de peso, medidas, fotos e metas de cada cliente com gráficos detalhados.",
  },
  {
    icon: MessageCircle,
    title: "Comunicação Integrada",
    description: "Chat direto com seus clientes, lembretes automáticos e notificações de acompanhamento.",
  },
  {
    icon: Palette,
    title: "100% Whitelabel",
    description: "Sua marca, suas cores, seu logo. Seus clientes veem apenas a sua identidade visual.",
  },
  {
    icon: Smartphone,
    title: "App Mobile para Clientes",
    description: "Seus pacientes acessam treinos, dietas e registram progresso pelo celular.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-16 lg:py-24">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Tudo Que Você Precisa Para{" "}
            <span className="gradient-text">Escalar Seu Negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais projetadas especificamente para nutricionistas que querem crescer
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group card-elevated p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
