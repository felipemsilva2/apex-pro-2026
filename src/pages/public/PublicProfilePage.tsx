import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, Tenant } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Instagram, Globe, CheckCircle2, ArrowRight, Loader2, Dumbbell } from "lucide-react";

const PublicProfilePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const { data, error } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                setTenant(data);

                // Update meta title
                if (data.business_name) {
                    document.title = `${data.business_name} | Consultoria Online`;
                }
            } catch (err) {
                console.error("Error fetching public tenant:", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchTenant();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
                <Dumbbell size={64} className="text-white/10" />
                <h1 className="font-display font-black italic uppercase text-4xl tracking-tighter">PÁGINA NÃO <span className="text-primary">ENCONTRADA</span></h1>
                <p className="text-white/40 uppercase tracking-widest text-sm">O LINK QUE VOCÊ ACESSOU PODE ESTAR INCORRETO OU FOI REMOVIDO.</p>
                <Button asChild className="btn-athletic px-12 h-14 font-black italic uppercase">
                    <Link to="/">VOLTAR AO INÍCIO</Link>
                </Button>
            </div>
        );
    }

    const primaryColor = tenant.primary_color || '#d4ff00';
    const secondaryColor = tenant.secondary_color || '#09090b';
    const config = tenant.landing_page_config || {};

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            {/* Dynamic Branding Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
        }
      `}} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {tenant.logo_url ? (
                            <img src={tenant.logo_url} className="h-10 object-contain brightness-200" alt={tenant.business_name} />
                        ) : (
                            <span className="font-display font-black italic text-2xl tracking-tighter">{tenant.business_name}</span>
                        )}
                    </div>
                    <Button asChild className="btn-athletic h-10 px-6 text-xs font-black italic uppercase tracking-tighter">
                        <Link to="/signup">ÁREA DO ALUNO</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden min-h-[90vh] flex items-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -ml-64 -mb-64" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-primary text-black font-display font-black italic text-[10px] uppercase tracking-widest -skew-x-12">
                                    CONSULTORIA ELITE
                                </span>
                                <h1 className="font-display font-black italic uppercase text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white">
                                    {config.hero_title || `TRANSFORME SEU CORPO COM ${tenant.business_name}`}
                                </h1>
                                <p className="text-white/60 text-lg md:text-xl font-medium tracking-tight max-w-lg leading-relaxed">
                                    {config.hero_subtitle || "Metodologia avançada focada em hipertrofia, emagrecimento e performance máxima. Treine com quem entende de resultados."}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button className="btn-athletic h-16 px-12 text-sm font-black italic uppercase tracking-widest flex items-center gap-3">
                                    QUERO COMEÇAR AGORA <ArrowRight size={20} />
                                </Button>
                                <Button variant="outline" className="rounded-none border-white/20 h-16 px-12 text-sm font-black italic uppercase tracking-widest text-white/60 hover:bg-white/5">
                                    VER METODOLOGIA
                                </Button>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="aspect-[4/5] bg-white/5 border border-white/10 relative overflow-hidden -skew-x-3">
                                <img
                                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                                    className="w-full h-full object-cover scale-110 skew-x-3 grayscale hover:grayscale-0 transition-all duration-700"
                                    alt="Performance"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10 p-6 bg-black/60 backdrop-blur-md border-l-4 border-primary space-y-2 max-w-xs">
                                    <p className="font-display font-black italic uppercase text-sm tracking-tight">+500 ALUNOS IMPACTADOS</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">METODOLOGIA VALIDADA COM RESULTADOS COMPROVADOS.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-32 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="font-display font-black italic uppercase text-4xl tracking-tighter">O QUE EU <span className="text-primary">ACREDITO</span></h2>
                        <div className="w-12 h-1 bg-primary mx-auto" />
                    </div>

                    <p className="text-xl md:text-2xl text-white/80 font-medium italic leading-relaxed">
                        "{config.about_text || "Dedico minha carreira a ajudar pessoas a superarem seus limites físicos e mentais. Não se trata apenas de estética, mas de construir uma mentalidade inabalável através do treinamento de força."}"
                    </p>

                    <div className="flex items-center justify-center gap-8 pt-8 text-white/40">
                        <Instagram size={24} className="hover:text-primary transition-colors cursor-pointer" />
                        <Globe size={24} className="hover:text-primary transition-colors cursor-pointer" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center -skew-x-12">
                            <Dumbbell size={16} className="text-black" />
                        </div>
                        <span className="font-display font-black italic text-xl uppercase tracking-tighter">{tenant.business_name}</span>
                    </div>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">
                        © 2026 APEX PRO SYSTEM • POWERED BY NUTRI PRO HUB
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicProfilePage;
