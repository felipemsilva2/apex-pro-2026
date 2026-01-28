import { Instagram, Linkedin, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const productLinks = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Planos e Preços", href: "#planos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "FAQ", href: "#faq" },
  ];

  const legalLinks = [
    { label: "Termos de Uso", href: "#" },
    { label: "Política de Privacidade", href: "#" },
    { label: "LGPD", href: "#" },
  ];

  return (
    <footer className="bg-foreground text-background/80">
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl text-background">
                NutriManage<span className="text-primary">Pro</span>
              </span>
            </a>
            <p className="text-background/60 mb-6 text-sm leading-relaxed">
              A plataforma whitelabel mais completa para nutricionistas profissionalizarem e escalarem seu atendimento.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-background mb-4">Produto</h4>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-background mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contato@nutrimanagepro.com"
                  className="flex items-center gap-2 text-background/60 hover:text-primary transition-colors text-sm"
                >
                  <Mail size={16} />
                  contato@nutrimanagepro.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511999999999"
                  className="flex items-center gap-2 text-background/60 hover:text-primary transition-colors text-sm"
                >
                  <Phone size={16} />
                  (11) 99999-9999
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-background/40 text-xs">
                Atendimento de segunda a sexta, das 9h às 18h
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/40 text-sm">
              © {currentYear} NutriManage Pro. Todos os direitos reservados.
            </p>
            <p className="text-background/40 text-sm">
              Feito com 💚 no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
