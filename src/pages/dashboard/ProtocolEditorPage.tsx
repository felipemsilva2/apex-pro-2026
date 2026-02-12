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
import { FeatureExplainer } from "@/components/dashboard/FeatureExplainer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GifSelector } from "@/components/dashboard/GifSelector"; // Import GifSelector


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
    const [isGifSelectorOpen, setIsGifSelectorOpen] = useState(false); // State for GifSelector

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
        return (
            <div className="space-y-8 animate-fade-in p-4 lg:p-8">
                <Skeleton className="h-16 w-96" />
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-24" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!protocol) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <AlertTriangle className="h-16 w-16 text-primary/30" />
                <p className="font-display font-black italic uppercase text-xl text-white/40 tracking-widest">PROTOCOLO NÃO ENCONTRADO</p>
                <Button onClick={() => navigate('/dashboard/plans')} className="btn-athletic">
                    <ArrowLeft className="mr-2 h-4 w-4" /> VOLTAR PARA BIBLIOTECA
                </Button>
            </div>
        );
    }

    const currentExercises = protocol.workout_exercises?.filter((e: any) => (e.day || 'segunda') === activeTab) || [];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (protocol?.client_id) {
                                navigate(`/dashboard/clients/${protocol.client_id}`);
                            } else {
                                navigate('/dashboard/plans');
                            }
                        }}
                        className="w-fit text-muted-foreground hover:text-primary p-0 h-auto font-display font-bold italic text-[10px] tracking-[0.3em] uppercase mb-2"
                    >
                        <ArrowLeft className="mr-2 h-3 w-3" />
                        {protocol?.client_id ? 'VOLTAR PARA O ALUNO' : 'VOLTAR PARA BIBLIOTECA'}
                    </Button>

                    <h1 className="text-4xl lg:text-6xl font-display font-black italic uppercase leading-none tracking-tighter text-white">
                        EDITOR <span className="text-primary">DE TREINOS</span>
                        <FeatureExplainer
                            title="Protocolos de Treino"
                            description="Um protocolo é um plano de treinamento completo. Você pode criar modelos genéricos na Biblioteca ou protocolos personalizados para alunos específicos."
                            tip="Protocolos personalizados salvos aqui são vinculados diretamente ao perfil do aluno."
                            className="inline-flex ml-4 mb-2 align-middle"
                        />
                    </h1>
                    <p className="font-display font-bold uppercase italic text-[10px] tracking-[0.4em] text-primary/80">
                        CONFIGURAÇÃO DE PROTOCOLO
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-4 min-w-[350px]">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center -skew-x-12">
                        <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">NOME DO PROTOCOLO</p>
                        <Input
                            value={protocolName}
                            onChange={(e) => setProtocolName(e.target.value)}
                            onBlur={() => updateProtocolMutation.mutate(protocolName)}
                            className="bg-transparent border-none text-lg font-display font-black italic text-primary placeholder:text-primary/30 focus-visible:ring-0 px-0 h-auto uppercase tracking-tight"
                            placeholder="NOME DO PROTOCOLO..."
                        />
                    </div>
                    <Save size={14} className="text-primary/30" />
                </div>
            </div>

            {/* Weekly Tabs */}
            <Tabs defaultValue="segunda" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-transparent border-none rounded-none h-auto p-0 gap-0 overflow-x-auto scrollbar-hide">
                    {days.map(day => {
                        const dayExercises = protocol.workout_exercises?.filter((e: any) => (e.day || 'segunda') === day.id) || [];
                        return (
                            <TabsTrigger
                                key={day.id}
                                value={day.id}
                                className="bg-transparent border-none rounded-none p-0 px-5 pb-3 pt-1 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary font-display font-black uppercase italic text-[10px] tracking-[0.15em] transition-all opacity-40 data-[state=active]:opacity-100 whitespace-nowrap relative"
                            >
                                {day.label}
                                {dayExercises.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-black text-[8px] font-black flex items-center justify-center -skew-x-12">
                                        {dayExercises.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {days.map(day => (
                    <TabsContent key={day.id} value={day.id} className="m-0 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Day Config Bar */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.03] border border-white/5 p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_20px_rgba(212,255,0,0.5)] opacity-40" />
                            <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16 pointer-events-none" />

                            <div className="relative z-10 space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-primary h-4 w-4" />
                                    <h3 className="font-display font-black text-xl italic uppercase text-white tracking-tight">
                                        {day.label}
                                    </h3>
                                    <FeatureExplainer
                                        title="Foco do Dia"
                                        description="O texto que você colocar aqui (ex: Peito e Tríceps) será exibido como o título principal deste treino no app do aluno."
                                        tip="Isso ajuda o aluno a identificar rapidamente qual a estratégia da sessão de hoje."
                                    />
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">
                                        {currentExercises.length} EXERCÍCIOS
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 max-w-md">
                                    <Label className="text-[9px] font-black text-primary/50 uppercase tracking-widest italic whitespace-nowrap">FOCO:</Label>
                                    <Input
                                        value={dayFocusMap[day.id] || ""}
                                        onChange={(e) => setDayFocusMap({ ...dayFocusMap, [day.id]: e.target.value })}
                                        onBlur={() => updateDayFocusMutation.mutate({ dayId: day.id, focus: dayFocusMap[day.id] || "" })}
                                        className="bg-transparent border-none text-sm font-display font-bold italic placeholder:text-white/10 text-primary focus-visible:ring-0 px-0 h-auto uppercase tracking-tight"
                                        placeholder="PEITO E TRÍCEPS..."
                                    />
                                </div>
                            </div>

                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary hover:bg-primary/80 text-black font-display font-black italic uppercase text-[10px] px-6 py-5 rounded-none tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,255,0,0.3)] relative z-10">
                                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> ADICIONAR EXERCÍCIO
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
                                            <Label htmlFor="name" className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nome do Exercício</Label>
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
                                                className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic uppercase text-sm tracking-wide h-12"
                                                placeholder="Ex: Supino Reto"
                                            />
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-[#0A0A0B] border border-white/10 mt-1 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0 text-left group/suggestion"
                                                        >
                                                            {suggestion.gif_url && (
                                                                <div className="h-10 w-10 overflow-hidden bg-black/40 border border-white/10 -skew-x-12 flex-shrink-0">
                                                                    <img
                                                                        src={suggestion.gif_url}
                                                                        className="w-full h-full object-cover skew-x-12"
                                                                        alt=""
                                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-display font-bold text-white italic uppercase group-hover/suggestion:text-primary transition-colors">{suggestion.name_pt}</span>
                                                                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{suggestion.muscle_group}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Manual GIF Selection Button */}
                                        <div className="flex items-center justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsGifSelectorOpen(true)}
                                                className="text-[10px] h-auto py-1 px-2 text-primary hover:text-primary/80 hover:bg-primary/5 uppercase font-bold tracking-wider"
                                            >
                                                <Search className="w-3 h-3 mr-1.5" />
                                                {newExercise.gif_url ? "TROCAR GIF" : "BUSCAR GIF NA BIBLIOTECA"}
                                            </Button>
                                        </div>

                                        {/* Preview Selected GIF */}
                                        {newExercise.gif_url && (
                                            <div className="relative w-full h-32 bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center -skew-x-2">
                                                <img
                                                    src={newExercise.gif_url}
                                                    className="h-full object-contain skew-x-2"
                                                    alt="Preview"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setNewExercise({ ...newExercise, gif_url: "" })}
                                                    className="absolute top-2 right-2 h-6 w-6 bg-black/60 hover:bg-red-500/20 text-white/50 hover:text-red-500 skew-x-2 transition-colors rounded-sm"
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        )}

                                        <GifSelector
                                            open={isGifSelectorOpen}
                                            onOpenChange={setIsGifSelectorOpen}
                                            onSelect={(url) => setNewExercise({ ...newExercise, gif_url: url })}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="sets" className="text-[10px] font-black text-white/40 uppercase tracking-widest">Séries</Label>
                                                <Input
                                                    id="sets"
                                                    type="number"
                                                    value={newExercise.sets}
                                                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold h-12"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="reps" className="text-[10px] font-black text-white/40 uppercase tracking-widest">Repetições</Label>
                                                <Input
                                                    id="reps"
                                                    value={newExercise.reps}
                                                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold h-12"
                                                    placeholder="Ex: 10-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes" className="text-[10px] font-black text-white/40 uppercase tracking-widest">Observações</Label>
                                            <Textarea
                                                id="notes"
                                                value={newExercise.notes}
                                                onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                                                className="bg-white/[0.03] border-white/10 rounded-none font-bold"
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
                                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-white/10">
                                    <div className="w-16 h-16 bg-white/[0.03] border border-white/5 flex items-center justify-center -skew-x-12">
                                        <Dumbbell className="h-8 w-8 text-white/10 skew-x-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-display font-black italic uppercase text-lg text-white/20 tracking-widest">
                                            NENHUM EXERCÍCIO
                                        </p>
                                        <p className="text-[10px] text-white/10 uppercase tracking-widest font-bold">
                                            Adicione exercícios para {day.label}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {currentExercises.map((exercise: any) => (
                                        <div key={exercise.id} className="group bg-[#0A0A0B] border border-white/5 hover:border-primary/40 transition-all relative overflow-hidden p-6">
                                            {/* Left glow accent */}
                                            <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(212,255,0,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-display font-black italic -skew-x-12 flex-shrink-0">
                                                        <span className="skew-x-12">{exercise.order_index}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-display font-black italic text-lg uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-none">
                                                            {exercise.name}
                                                        </h4>
                                                        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5 text-white/40">
                                                                <Clock size={11} className="text-primary/60" /> {exercise.sets} SÉRIES
                                                            </span>
                                                            <span className="flex items-center gap-1.5 text-white/40">
                                                                <Dumbbell size={11} className="text-primary/60" /> {exercise.reps} REPS
                                                            </span>
                                                            {exercise.notes && (
                                                                <span className="text-primary/40 italic normal-case text-[10px]">
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
                                                        className="text-white/10 hover:text-destructive hover:bg-destructive/10 rounded-none"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* GIF Preview for Coach */}
                                            {exercise.gif_url && (
                                                <div className="flex gap-4 items-start mt-4 pt-4 border-t border-white/5 relative z-10">
                                                    <div
                                                        className="relative h-20 w-36 border border-white/5 overflow-hidden bg-black/40 flex items-center justify-center group/gif cursor-pointer transition-all hover:border-primary/30 -skew-x-6"
                                                        onClick={() => setSelectedGif({ url: exercise.gif_url, name: exercise.name })}
                                                    >
                                                        {!imageErrors[exercise.id] ? (
                                                            <>
                                                                <img
                                                                    src={exercise.gif_url}
                                                                    className="w-full h-full object-contain opacity-50 group-hover/gif:opacity-100 transition-opacity skew-x-6"
                                                                    alt="Preview"
                                                                    onError={() => setImageErrors(prev => ({ ...prev, [exercise.id]: true }))}
                                                                />
                                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/gif:opacity-100 flex items-center justify-center transition-all">
                                                                    <Eye className="text-white drop-shadow-[0_0_10px_rgba(0,0,0,1)] skew-x-6" size={24} />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 p-2 text-center text-white/10 uppercase tracking-widest font-bold skew-x-6">
                                                                <Dumbbell className="text-white/10" size={14} />
                                                                <p className="text-[6px]">SEM GIF</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedGif({ url: exercise.gif_url, name: exercise.name })}
                                                        className="h-auto p-0 flex items-center gap-2 text-primary/60 hover:text-primary transition-colors"
                                                    >
                                                        <Eye size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest italic">VER EXECUÇÃO</span>
                                                    </Button>
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
                            <span className="text-white/40 text-[8px] tracking-[0.4em] mb-1 not-italic font-bold">MODO DE VISUALIZAÇÃO</span>
                            <span className="flex items-center gap-3 text-primary">
                                <Eye size={20} />
                                {selectedGif?.name}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8 min-h-[400px]">
                        {selectedGif?.url ? (
                            <img
                                src={selectedGif.url}
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
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">VISUALIZAÇÃO DE EXERCÍCIO</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
