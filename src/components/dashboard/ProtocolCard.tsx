import { Dumbbell, Utensils, Calendar, Trash2, ChevronRight, Zap } from "lucide-react";
import { type Workout, type MealPlan } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProtocolCardProps {
    protocol: Workout | MealPlan;
    type: 'workout' | 'meal';
    onDelete?: (id: string) => void;
    onClick?: (id: string) => void;
}

export function ProtocolCard({ protocol, type, onDelete, onClick }: ProtocolCardProps) {
    const isWorkout = type === 'workout';
    const workout = protocol as Workout;
    const meal = protocol as MealPlan;

    return (
        <div
            onClick={() => onClick?.(protocol.id)}
            className="group relative bg-white/5 border border-white/10 hover:border-primary/50 p-6 transition-all cursor-pointer overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 flex items-center justify-center -skew-x-12",
                        isWorkout ? "bg-primary text-black" : "bg-blue-500 text-white"
                    )}>
                        <div className="skew-x-12">
                            {isWorkout ? <Dumbbell size={20} /> : <Utensils size={20} />}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-display font-black italic uppercase text-sm tracking-tight group-hover:text-primary transition-colors">
                            {protocol.name}
                        </h4>
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={10} />
                            {format(new Date(protocol.created_at), "dd 'DE' MMM, yyyy", { locale: ptBR })}
                        </p>
                    </div>
                </div>

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(protocol.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-destructive transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div className="space-y-4 relative z-10">
                {isWorkout ? (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">STATUS</span>
                            <span className={cn(
                                "text-[10px] font-black italic uppercase",
                                workout.status === 'completed' ? "text-green-500" : "text-primary"
                            )}>
                                {workout.status === 'pending' ? 'AGUARDANDO' : workout.status === 'in_progress' ? 'EM EXECUÇÃO' : 'FINALIZADO'}
                            </span>
                        </div>
                        {workout.duration_minutes && (
                            <div className="flex flex-col border-l border-white/10 pl-4">
                                <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">DURAÇÃO</span>
                                <span className="text-[10px] font-black italic uppercase text-white">{workout.duration_minutes} MIN</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col bg-black/30 p-2 border border-white/5">
                            <span className="text-[7px] text-white/40 uppercase font-bold tracking-[0.2em]">KCAL</span>
                            <span className="text-[10px] font-black italic uppercase text-white">{meal.target_calories || '--'}</span>
                        </div>
                        <div className="flex flex-col bg-black/30 p-2 border border-white/5">
                            <span className="text-[7px] text-white/40 uppercase font-bold tracking-[0.2em]">PROT</span>
                            <span className="text-[10px] font-black italic uppercase text-primary">{meal.target_protein_g || '--'}G</span>
                        </div>
                        <div className="flex flex-col bg-black/30 p-2 border border-white/5">
                            <span className="text-[7px] text-white/40 uppercase font-bold tracking-[0.2em]">CARB</span>
                            <span className="text-[10px] font-black italic uppercase text-white">{meal.target_carbs_g || '--'}G</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[9px] font-black italic text-primary uppercase tracking-[0.2em] flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> DETALHES TÁTICOS
                    </span>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </div>
    );
}
