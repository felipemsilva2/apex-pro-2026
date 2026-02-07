import { Instagram, Linkedin, Youtube, Mail, Phone, Zap, Shield, Target, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

import { useTenant } from "@/contexts/TenantContext";

const Footer = () => {
  const { tenant } = useTenant();
  const currentYear = new Date().getFullYear();
  const businessName = tenant?.business_name || "APEXPRO";

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const productLinks = [
    { label: "FUNCIONALIDADES", href: "#funcionalidades" },
    { label: "PLANOS", href: "#planos" },
    { label: "DASHBOARD", href: "/dashboard" },
    { label: "CONTATO", href: "/contact" },
  ];

  const tacticalLinks = [
    { label: "PATCH NOTES", href: "/changelog" },
    { label: "TERMOS DE USO", href: "/terms" },
    { label: "PRIVACIDADE", href: "/privacy" },
  ];

  return (
    <footer className="bg-black text-white/40 pt-20 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-[0.02]">
        <div className="font-display font-black text-[300px] leading-none text-white italic uppercase select-none translate-y-1/2">
          APEX
        </div>
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 bg-primary flex items-center justify-center -skew-x-12">
                <Dumbbell className="text-black" size={20} />
              </div>
              {tenant?.business_name ? (
                <span className="font-display font-black text-2xl text-white italic uppercase tracking-tighter">
                  {tenant.business_name}
                </span>
              ) : (
                <span className="font-display font-black text-2xl text-white italic uppercase tracking-tighter">
                  APEX<span className="text-primary text-blur-sm">PRO</span>
                </span>
              )}
            </Link>
            <p className="font-display font-bold uppercase italic text-[10px] leading-relaxed tracking-widest text-white/30 mb-8 max-w-xs">
              A INFRAESTRUTURA DEFINITIVA PARA PERSONAL TRAINERS E COACHES QUE EXIGEM GESTÃO PROFISSIONAL E RESULTADOS.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 border border-white/10 -skew-x-12 flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-black text-[10px] text-primary italic uppercase tracking-[0.4em] mb-8">NAVEGAÇÃO</h4>
            <ul className="space-y-4">
              {productLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="font-display font-bold uppercase italic text-[10px] tracking-widest hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="font-display font-bold uppercase italic text-[10px] tracking-widest hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Tactical */}
          <div>
            <h4 className="font-display font-black text-[10px] text-primary italic uppercase tracking-[0.4em] mb-8">INFORMAÇÕES</h4>
            <ul className="space-y-4">
              {tacticalLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="font-display font-bold uppercase italic text-[10px] tracking-widest hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-black text-[10px] text-primary italic uppercase tracking-[0.4em] mb-8">SUPORTE AO CLIENTE</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:ola@apexpro.fit" className="flex items-center gap-3 font-display font-bold uppercase italic text-[10px] tracking-widest hover:text-white transition-colors group">
                  <div className="p-2 bg-white/5 -skew-x-12 group-hover:bg-primary group-hover:text-black transition-colors">
                    <Mail size={14} />
                  </div>
                  ola@apexpro.fit
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/556196032164?text=Olá, gostaria de saber mais sobre o Apex Pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-display font-bold uppercase italic text-[10px] tracking-widest hover:text-white transition-colors group"
                >
                  <div className="p-2 bg-white/5 -skew-x-12 group-hover:bg-primary group-hover:text-black transition-colors">
                    <Phone size={14} />
                  </div>
                  LINHA SEGURA: 61 9603-2164
                </a>
              </li>
            </ul>
            <div className="mt-8 border-l-2 border-primary/20 pl-6 py-2">
              <p className="font-display font-bold uppercase italic text-[9px] text-white/20 tracking-widest">
                ESTABILIDADE: 99.98% // LATÊNCIA: 14MS <br />
                SUPORTE: 09:00 - 18:00 BRT
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-display font-bold uppercase italic text-[9px] tracking-[0.3em]">
            © {currentYear} {businessName}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4">
            <Shield size={14} className="text-primary" />
            <span className="font-display font-bold uppercase italic text-[9px] tracking-[0.3em]">CONEXÃO SEGURA ATIVA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
