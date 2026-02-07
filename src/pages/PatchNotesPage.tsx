import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Rocket,
    Bug,
    Zap,
    ChevronRight,
    Clock,
    Dumbbell,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PatchNote {
    id: string;
    title: string;
    description: string;
    content: string;
    version: string;
    type: 'feature' | 'fix' | 'improvement' | 'update';
    created_at: string;
}

const PatchNotesPage = () => {
    const [notes, setNotes] = useState<PatchNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('patch_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotes(data);
        }
        setLoading(false);
    };

    const filteredNotes = filter
        ? notes.filter(n => n.type === filter)
        : notes;

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'feature': return 'text-primary border-primary/20 bg-primary/5';
            case 'fix': return 'text-red-500 border-red-500/20 bg-red-500/5';
            case 'improvement': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
            default: return 'text-white/60 border-white/10 bg-white/5';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature': return <Rocket size={14} />;
            case 'fix': return <Bug size={14} />;
            case 'improvement': return <Zap size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'feature': return 'LANÇAMENTO';
            case 'fix': return 'CORREÇÃO';
            case 'improvement': return 'MELHORIA';
            default: return 'ATUALIZAÇÃO';
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-6 lg:p-12 relative overflow-hidden font-sans">
            {/* Kinetic Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4FF00]/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4FF00]/10 blur-[120px] rounded-full" />
                <div className="scanline" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Navigation */}
                <div className="flex justify-between items-center mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 group text-white/40 hover:text-white transition-colors duration-300">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-display font-bold uppercase italic text-[10px] tracking-widest">Voltar Home</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center -skew-x-12">
                            <Dumbbell className="text-black" size={20} />
                        </div>
                        <span className="font-display font-black text-2xl italic uppercase tracking-tighter">
                            APEX<span className="text-primary">PRO</span> <span className="text-white/20 ml-2">// PATCH NOTES</span>
                        </span>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="mb-16 space-y-4">
                    <h1 className="text-5xl lg:text-7xl font-display font-black italic uppercase leading-none tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
                        O QUE HÁ DE <span className="text-primary">NOVO</span>
                    </h1>
                    <p className="text-white/40 font-display font-bold uppercase italic text-xs tracking-[0.3em] max-w-xl leading-relaxed">
                        Acompanhe a evolução constante do nosso ecossistema de alta performance.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-12 animate-in fade-in duration-1000">
                    <button
                        onClick={() => setFilter(null)}
                        className={cn(
                            "px-6 py-3 font-display font-bold italic text-[10px] uppercase tracking-widest transition-all -skew-x-12",
                            filter === null ? "bg-white text-black" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        Tudo
                    </button>
                    {['feature', 'fix', 'improvement'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={cn(
                                "px-6 py-3 font-display font-bold italic text-[10px] uppercase tracking-widest transition-all -skew-x-12",
                                filter === type ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {getTypeLabel(type)}
                        </button>
                    ))}
                </div>

                {/* Notes List */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-none animate-spin" />
                        </div>
                    ) : filteredNotes.length > 0 ? (
                        filteredNotes.map((note, idx) => (
                            <article
                                key={note.id}
                                className="athletic-card p-8 bg-zinc-900/40 border border-white/5 backdrop-blur-sm relative group hover:border-primary/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Accent Decor */}
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {getTypeIcon(note.type)}
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest border italic",
                                            getTypeStyle(note.type)
                                        )}>
                                            {getTypeLabel(note.type)}
                                        </span>
                                        <span className="font-display font-black text-primary italic text-xl tracking-tighter">
                                            {note.version}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/20 font-display font-bold uppercase italic text-[9px] tracking-widest">
                                        <Clock size={12} />
                                        {format(new Date(note.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                    </div>
                                </div>

                                <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                    {note.title}
                                </h2>

                                <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                                    {note.description}
                                </p>

                                <div className="p-6 bg-black/40 border-l-2 border-primary/30 text-white/80 text-sm leading-relaxed italic">
                                    {note.content}
                                </div>

                                <div className="mt-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-0.5 w-12 bg-primary" />
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="text-center py-20 border border-dashed border-white/5">
                            <p className="text-white/40 font-display font-bold uppercase italic text-xs tracking-widest">
                                Nenhuma atualização encontrada para este filtro.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-20 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-display italic">
                        Apex Pro Ecosystem // Constant Evolution
                    </p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-display italic">
                        © 2026 APEX TECHNOLOGY HUB
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .font-display { font-family: 'Syne', sans-serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .text-primary { color: #D4FF00; }
        .bg-primary { background-color: #D4FF00; }
        .border-primary { border-color: #D4FF00; }
        
        .athletic-card {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%);
        }

        .scanline {
          width: 100%;
          height: 100px;
          z-index: 10;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(212, 255, 0, 0.02) 50%, rgba(0, 0, 0, 0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 10s linear infinite;
        }

        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
      `}} />
        </div>
    );
};

export default PatchNotesPage;
