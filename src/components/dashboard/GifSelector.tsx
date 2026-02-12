import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Loader2 } from "lucide-react";
import { supabase, ExerciseLibrary } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this hook exists, if not I'll implement debounce locally or check if it exists. 
// Actually, I'll check for useDebounce existence first or just implement a simple effect.
// Let's assume standard debouncing or just simple state for now to be safe.

interface GifSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (gifUrl: string) => void;
}

export function GifSelector({ open, onOpenChange, onSelect }: GifSelectorProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: exercises, isLoading } = useQuery({
        queryKey: ['gif-selector', debouncedSearch],
        queryFn: async () => {
            let query = supabase
                .from('exercises_library')
                .select('id, name_pt, gif_url, muscle_group')
                .not('gif_url', 'is', null);

            if (debouncedSearch.length >= 2) {
                query = query.or(`name_pt.ilike.%${debouncedSearch}%,keywords.cs.{${debouncedSearch.toLowerCase()}}`);
            } else {
                query = query.limit(50); // Default limit to avoid overfetching
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as ExerciseLibrary[];
        },
        enabled: open,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[800px] p-0 overflow-hidden shadow-2xl shadow-primary/5 h-[80vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
                    <DialogTitle className="font-display font-black italic uppercase text-xl tracking-tighter flex items-center gap-3">
                        <Search className="text-primary" size={20} />
                        BIBLIOTECA DE <span className="text-primary">GIFS</span>
                    </DialogTitle>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/50 border-white/10 pl-10 font-display font-bold italic uppercase h-10 focus-visible:ring-primary/50"
                            placeholder="BUSCAR EXERCÍCIO..."
                            autoFocus
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                            <Loader2 className="animate-spin" size={32} />
                            <p className="text-xs font-bold uppercase tracking-widest">CARREGANDO...</p>
                        </div>
                    ) : exercises?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                            <Dumbbell size={48} />
                            <p className="text-xs font-bold uppercase tracking-widest">NENHUM GIF ENCONTRADO</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {exercises?.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    onClick={() => {
                                        if (exercise.gif_url) {
                                            onSelect(exercise.gif_url);
                                            onOpenChange(false);
                                        }
                                    }}
                                    className="group relative flex flex-col gap-2 p-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all text-left"
                                >
                                    <div className="aspect-square w-full bg-black/40 overflow-hidden relative border border-white/5 group-hover:border-primary/20 transition-colors">
                                        <img
                                            src={exercise.gif_url || ''}
                                            alt={exercise.name_pt}
                                            className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-primary text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest -skew-x-12">
                                                SELECIONAR
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-white/80 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {exercise.name_pt}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase text-white/30 tracking-wider">
                                            {exercise.muscle_group}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
