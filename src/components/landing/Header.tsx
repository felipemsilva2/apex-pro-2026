import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, Dumbbell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "FUNCIONALIDADES", href: "#funcionalidades" },
    { label: "SOBRE", href: "#como-funciona" },
    { label: "DEPOIMENTOS", href: "#depoimentos" },
    { label: "PLANOS", href: "#planos" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 border-b border-white/10 h-16 lg:h-20",
      isMenuOpen ? "bg-black" : "bg-black/60 backdrop-blur-xl"
    )}>
      <div className="section-container h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo - Apex Style */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary flex items-center justify-center -skew-x-12 group-hover:scale-110 transition-transform">
              <Dumbbell className="text-black" size={24} />
            </div>
            <span className="font-display font-black text-2xl text-white italic uppercase tracking-tighter">
              APEX<span className="text-primary text-blur-sm">PRO</span>
            </span>
          </Link>

          {/* Desktop Navigation - Tactical */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-primary/40 hover:text-primary transition-all text-[10px] font-black italic uppercase tracking-[0.3em]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/login" className="btn-athletic text-[10px] px-8 py-3 shadow-[0_5px_20px_rgba(212,255,0,0.2)]">
              ACESSAR
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden touch-target text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Apex Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-black z-[100] animate-fade-in border-t border-white/5 p-8">
            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-2xl font-display font-black text-white italic uppercase tracking-tighter border-l-2 border-primary/20 pl-6 hover:border-primary transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
                <Link to="/login" className="btn-athletic w-full py-4 text-center">
                  ACESSAR
                </Link>
              </div>
            </nav>
            {/* Decoration */}
            <div className="absolute bottom-12 right-8 opacity-10">
              <span className="font-display font-black text-6xl italic leading-none text-white uppercase">APEX</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
