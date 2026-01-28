import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import dashboardMockup from "@/assets/dashboard-mockup.png";

const HeroSection = () => {
  return (
    <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative">
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
            <Sparkles size={16} />
            <span>Plataforma #1 para Nutricionistas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Gerencie Todos os Seus Clientes em{" "}
            <span className="gradient-text">Uma Única Plataforma</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Plataforma whitelabel completa para nutricionistas escalarem seu negócio com gestão de treinos, planos alimentares e acompanhamento personalizado.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="btn-primary text-base px-8 py-6 h-auto">
              Agendar Demonstração
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto group">
              <Play size={20} className="mr-2 group-hover:text-primary transition-colors" />
              Ver Plataforma
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>+2.500 nutricionistas</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} className="w-4 h-4 text-accent fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span className="ml-1">4.9/5 avaliação</span>
            </div>
          </div>
        </div>

        {/* Dashboard Image */}
        <div className="relative max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
            <img
              src={dashboardMockup}
              alt="Dashboard NutriManage Pro"
              className="w-full h-auto"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
          </div>
          
          {/* Floating badges */}
          <div className="absolute -left-4 lg:-left-8 top-1/4 bg-card rounded-xl p-4 shadow-lg border border-border animate-float hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">+340%</p>
                <p className="text-xs text-muted-foreground">Produtividade</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 lg:-right-8 bottom-1/4 bg-card rounded-xl p-4 shadow-lg border border-border animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent text-lg">⏰</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">10h/semana</p>
                <p className="text-xs text-muted-foreground">Tempo economizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
