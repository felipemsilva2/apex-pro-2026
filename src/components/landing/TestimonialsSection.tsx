import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dra. Camila Santos",
    role: "Nutricionista Esportiva",
    location: "São Paulo, SP",
    image: "CS",
    rating: 5,
    text: "Antes eu perdia horas montando planilhas e enviando PDFs pelo WhatsApp. Agora meus clientes têm tudo no app e eu acompanho em tempo real. Triplicei minha carteira de clientes em 6 meses!",
    highlight: "3x mais clientes",
  },
  {
    name: "Dr. Rafael Oliveira",
    role: "Nutrólogo",
    location: "Rio de Janeiro, RJ",
    image: "RO",
    rating: 5,
    text: "O fato de ser whitelabel foi decisivo. Meus pacientes veem minha marca, não sabem que uso uma plataforma. Isso transmite muito profissionalismo e confiança.",
    highlight: "100% sua marca",
  },
  {
    name: "Dra. Fernanda Lima",
    role: "Nutricionista Clínica",
    location: "Belo Horizonte, MG",
    image: "FL",
    rating: 5,
    text: "Economizo pelo menos 10 horas por semana em tarefas administrativas. O dashboard de métricas é incrível - meus clientes adoram ver a própria evolução em gráficos.",
    highlight: "10h economizadas/semana",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-16 lg:py-24 bg-muted/30">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Junte-se a milhares de nutricionistas que transformaram seus negócios
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-elevated p-6 lg:p-8 relative group hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 text-primary/10" size={40} />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                ))}
              </div>

              {/* Highlight badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                {testimonial.highlight}
              </div>

              {/* Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
