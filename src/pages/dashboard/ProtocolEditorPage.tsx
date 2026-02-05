import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, Dumbbell, Calendar, Clock, AlertTriangle, MoreVertical, Eye, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, ExerciseLibrary } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLocalGifPath } from "@/lib/gifMapping";

export default function ProtocolEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("segunda");
    const [protocolName, setProtocolName] = useState("");
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [dayFocusMap, setDayFocusMap] = useState<Record<string, string>>({});
    const [selectedGif, setSelectedGif] = useState<{ url: string, name: string } | null>(null);
    const queryClient = useQueryClient();

    // Add Exercise State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExercise, setNewExercise] = useState({
        name: "",
        sets: 3,
        reps: "10-12",
        weight_kg: 0,
        rest_seconds: 60,
        notes: "",
        gif_url: "",
        exercise_library_id: ""
    });
    const [suggestions, setSuggestions] = useState<ExerciseLibrary[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch Protocol Details
    const { data: protocol, isLoading } = useQuery({
        queryKey: ['workout-template', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('workouts')
                .select('*, workout_exercises(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

    useEffect(() => {
        if (protocol) {
            setProtocolName(protocol.name);
            if (protocol.day_focus) {
                setDayFocusMap(protocol.day_focus);
            }
        }
    }, [protocol]);

    // Mutation to Update Day Focus
    const updateDayFocusMutation = useMutation({
        mutationFn: async ({ dayId, focus }: { dayId: string, focus: string }) => {
            const newFocusMap = { ...dayFocusMap, [dayId]: focus };
            const { error } = await supabase.from('workouts').update({ day_focus: newFocusMap }).eq('id', id);
            if (error) throw error;
            return newFocusMap;
        },
        onSuccess: (newFocusMap) => {
            setDayFocusMap(newFocusMap);
            queryClient.invalidateQueries({ queryKey: ['workout-template', id] });
        }
    });

    // Mutation to Update Protocol Name
    const updateProtocolMutation = useMutation({
        mutationFn: async (name: string) => {
            const { error } = await supabase.from('workouts').update({ name }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Nome do protocolo atualizado!");
            queryClient.invalidateQueries({ queryKey: ['workout-template', id] });
        }
    });

    // Mutation to Add Exercise
    const addExerciseMutation = useMutation({
        mutationFn: async (exerciseData: any) => {
            const { error } = await supabase.from('workout_exercises').insert({
                workout_id: id,
                day: activeTab,
                ...exerciseData,
                order_index: (protocol?.workout_exercises?.filter((e: any) => e.day === activeTab).length || 0) + 1
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Exercício adicionado!");
            setIsAddOpen(false);
            setNewExercise({
                name: "",
                sets: 3,
                reps: "10-12",
                weight_kg: 0,
                rest_seconds: 60,
                notes: "",
                gif_url: "",
                exercise_library_id: ""
            });
            queryClient.invalidateQueries({ queryKey: ['workout-template', id] });
        },
        onError: (error) => {
            toast.error("Erro ao adicionar exercício: " + error.message);
        }
    });

    const deleteExerciseMutation = useMutation({
        mutationFn: async (exerciseId: string) => {
            const { error } = await supabase.from('workout_exercises').delete().eq('id', exerciseId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Exercício removido!");
            queryClient.invalidateQueries({ queryKey: ['workout-template', id] });
        }
    });

    const handleAddExercise = () => {
        if (!newExercise.name) return toast.error("Nome do exercício é obrigatório");
        addExerciseMutation.mutate(newExercise);
    };

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const { data, error } = await supabase
            .from('exercises_library')
            .select('*')
            .or(`name_pt.ilike.%${query}%,keywords.cs.{${query.toLowerCase()}}`)
            .limit(5);

        if (!error && data) {
            setSuggestions(data);
            setShowSuggestions(true);
        }
    };

    const days = [
        { id: 'segunda', label: 'SEGUNDA' },
        { id: 'terca', label: 'TERÇA' },
        { id: 'quarta', label: 'QUARTA' },
        { id: 'quinta', label: 'QUINTA' },
        { id: 'sexta', label: 'SEXTA' },
        { id: 'sabado', label: 'SÁBADO' },
        { id: 'domingo', label: 'DOMINGO' },
    ];

    if (isLoading) {
        return <div className="p-8 text-white animate-pulse">Carregando editor...</div>;
    }

    if (!protocol) {
        return <div className="p-8 text-white">Protocolo não encontrado.</div>;
    }

    const currentExercises = protocol.workout_exercises?.filter((e: any) => (e.day || 'segunda') === activeTab) || [];

    return (
        <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
                <Button
                    variant="ghost"
                    onClick={() => {
                        if (protocol?.client_id) {
                            navigate(`/dashboard/clients/${protocol.client_id}`);
                        } else {
                            navigate('/dashboard/plans');
                        }
                    }}
                    className="w-fit text-muted-foreground hover:text-primary mb-2 p-0 h-auto font-display text-xs tracking-widest uppercase"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {protocol?.client_id ? `Voltar para ${protocol.client_id ? 'o Aluno' : 'Biblioteca'}` : 'Voltar para Biblioteca'}
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Dumbbell className="text-primary h-6 w-6" />
                            <h1 className="text-3xl lg:text-4xl font-display font-black italic uppercase tracking-tighter text-white">
                                EDITOR DE TREINOS
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={protocolName}
                                onChange={(e) => setProtocolName(e.target.value)}
                                onBlur={() => updateProtocolMutation.mutate(protocolName)}
                                className="bg-transparent border-none text-2xl font-bold text-primary placeholder:text-primary/50 focus-visible:ring-0 px-0 h-auto w-fit min-w-[300px]"
                                placeholder="NOME DO PROTOCOLO"
                            />
                            <Save size={16} className="text-primary/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Tabs */}
            <Tabs defaultValue="segunda" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-white/5 h-auto p-0 gap-2 scrollbar-hide">
                    {days.map(day => (
                        <TabsTrigger
                            key={day.id}
                            value={day.id}
                            className="rounded-t-md rounded-b-none border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-display font-bold italic uppercase tracking-widest px-6 py-3 transition-all whitespace-nowrap"
                        >
                            {day.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {days.map(day => (
                    <TabsContent key={day.id} value={day.id} className="min-h-[400px] border border-white/5 rounded-b-md p-6 bg-white/5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-4">
                                <h3 className="font-display font-black text-2xl italic uppercase text-white/80">
                                    {day.label} <span className="text-primary/40 text-lg not-italic font-normal"> // Configuração do Dia</span>
                                </h3>

                                <div className="flex flex-col gap-2 max-w-md">
                                    <Label className="text-[10px] font-black text-primary/60 uppercase tracking-widest italic">FOCO DO DIA (EX: PEITO E TRÍCEPS)</Label>
                                    <Input
                                        value={dayFocusMap[day.id] || ""}
                                        onChange={(e) => setDayFocusMap({ ...dayFocusMap, [day.id]: e.target.value })}
                                        onBlur={() => updateDayFocusMutation.mutate({ dayId: day.id, focus: dayFocusMap[day.id] || "" })}
                                        className="bg-white/5 border-white/10 text-xl font-bold italic placeholder:text-white/10 text-primary"
                                        placeholder="DEFINIR FOCO..."
                                    />
                                </div>

                                <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
                                    {currentExercises.length} Exercícios configurados
                                </p>
                            </div>

                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary">
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Exercício
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[600px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                                    <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />
                                    <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                                        <div className="absolute top-8 right-8 w-16 h-16 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                                        <DialogTitle className="font-display font-black italic uppercase text-3xl tracking-tighter flex flex-col leading-none">
                                            <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">CONFIGURAÇÃO DE TREINO</span>
                                            <span className="flex items-center gap-3">
                                                ADICIONAR <span className="text-primary">EXERCÍCIO</span>
                                            </span>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="p-8 pt-4 space-y-6">
                                        <div className="grid gap-2 relative">
                                            <Label htmlFor="name">Nome do Exercício</Label>
                                            <Input
                                                id="name"
                                                value={newExercise.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewExercise({ ...newExercise, name: val });
                                                    fetchSuggestions(val);
                                                }}
                                                onFocus={() => {
                                                    if (newExercise.name.length >= 2) setShowSuggestions(true);
                                                }}
                                                className="bg-background/50 border-white/10"
                                                placeholder="Ex: Supino Reto"
                                            />
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-surface border border-white/10 rounded-md mt-1 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    {suggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewExercise({
                                                                    ...newExercise,
                                                                    name: suggestion.name_pt,
                                                                    gif_url: suggestion.gif_url || "",
                                                                    exercise_library_id: suggestion.id
                                                                });
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0 text-left"
                                                        >
                                                            {suggestion.gif_url && (
                                                                <div className="h-10 w-10 rounded overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                                                                    <img
                                                                        src={suggestion.gif_url}
                                                                        className="w-full h-full object-cover"
                                                                        alt=""
                                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-white uppercase">{suggestion.name_pt}</span>
                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{suggestion.muscle_group}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="sets">Séries</Label>
                                                <Input
                                                    id="sets"
                                                    type="number"
                                                    value={newExercise.sets}
                                                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                                                    className="bg-background/50 border-white/10"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="reps">Repetições</Label>
                                                <Input
                                                    id="reps"
                                                    value={newExercise.reps}
                                                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                                                    className="bg-background/50 border-white/10"
                                                    placeholder="Ex: 10-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Observações</Label>
                                            <Textarea
                                                id="notes"
                                                value={newExercise.notes}
                                                onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                                                className="bg-background/50 border-white/10"
                                                placeholder="Ex: Drop-set na última série"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="p-8 pt-0">
                                        <button onClick={handleAddExercise} className="btn-athletic w-full h-14 text-sm">
                                            SALVAR NA PLANILHA
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Exercise List */}
                        {
                            currentExercises.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-white/10 rounded-lg">
                                    <Dumbbell className="h-12 w-12 text-white/10" />
                                    <div className="space-y-1">
                                        <p className="font-display font-bold text-lg text-white/40 uppercase">Nenhum exercício configurado</p>
                                        <p className="text-xs text-muted-foreground text-white/30">Adicione exercícios para este dia da semana</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {currentExercises.map((exercise: any) => (
                                        <div key={exercise.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-4 group hover:border-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-display font-bold">
                                                        {exercise.order_index}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white uppercase">{exercise.name}</h4>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={12} /> {exercise.sets} Séries
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Dumbbell size={12} /> {exercise.reps} Reps
                                                            </span>
                                                            {exercise.notes && (
                                                                <span className="text-primary/60 italic">
                                                                    "{exercise.notes}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                                                        className="text-white/20 hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* GIF Preview for Coach */}
                                            {exercise.gif_url && (
                                                <div className="flex gap-4 items-start">
                                                    <div
                                                        className="relative h-24 w-40 rounded border border-white/5 overflow-hidden bg-black/20 flex items-center justify-center group/gif cursor-pointer transition-transform hover:scale-[1.02]"
                                                        onClick={() => setSelectedGif({ url: exercise.gif_url, name: exercise.name })}
                                                    >
                                                        {!imageErrors[exercise.id] ? (
                                                            <>
                                                                <img
                                                                    src={getLocalGifPath(exercise.name, exercise.gif_url)}
                                                                    className="w-full h-full object-contain opacity-60 group-hover/gif:opacity-100 transition-opacity"
                                                                    alt="Preview"
                                                                    onError={() => setImageErrors(prev => ({ ...prev, [exercise.id]: true }))}
                                                                />
                                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/gif:opacity-100 flex items-center justify-center transition-all">
                                                                    <Eye className="text-white drop-shadow-[0_0_10px_rgba(0,0,0,1)]" size={32} />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 p-2 text-center text-white/10 uppercase tracking-widest font-bold">
                                                                <Dumbbell className="text-white/10" size={16} />
                                                                <p className="text-[6px]">ERRO NO GIF</p>
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-1 right-1 bg-black/60 text-[6px] text-white/60 px-1 uppercase tracking-tighter">
                                                            {exercise.gif_url.includes('/exercises/') ? 'LOCAL HD' : 'EXTERNAL'}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest italic">Análise de Exercício</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedGif({ url: exercise.gif_url, name: exercise.name })}
                                                            className="h-auto p-0 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            <Eye size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">VER EXECUÇÃO</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </TabsContent>
                ))}
            </Tabs>

            {/* GIF Preview Modal */}
            <Dialog open={!!selectedGif} onOpenChange={(open) => !open && setSelectedGif(null)}>
                <DialogContent className="bg-black/95 border-primary/20 max-w-4xl p-0 overflow-hidden shadow-[0_0_50px_rgba(212,255,0,0.2)] rounded-none">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <DialogTitle className="font-display font-black italic uppercase text-xl leading-none flex flex-col">
                            <span className="text-white/40 text-[8px] tracking-[0.4em] mb-1 not-italic font-bold">MODO DE VISUALIZAÇÃO TÁTICA</span>
                            <span className="flex items-center gap-3 text-primary">
                                <Eye size={20} />
                                PREVIEW: {selectedGif?.name}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8 min-h-[400px]">
                        {selectedGif?.url ? (
                            <img
                                src={getLocalGifPath(selectedGif.name, selectedGif.url)}
                                className="max-w-full max-h-[70vh] object-contain shadow-2xl"
                                alt={selectedGif.name}
                            />
                        ) : (
                            <div className="text-white/20 flex flex-col items-center gap-4">
                                <Dumbbell size={64} className="animate-pulse" />
                                <p className="font-display font-bold italic uppercase tracking-widest">GIF NÃO DISPONÍVEL</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">MODO DE VISUALIZAÇÃO TÁTICA</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
