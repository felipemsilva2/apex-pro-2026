import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Plus, Save, Trash2, Utensils,
    Target, Search, Calculator, ChevronRight,
    AlertTriangle, MoreVertical, Edit2, Copy
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, MealPlan, Meal } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MealPlanEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // UI State
    const [protocolName, setProtocolName] = useState("");
    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [newMealName, setNewMealName] = useState("");
    const [isSearchingFood, setIsSearchingFood] = useState(false);
    const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
    const [foodSearchQuery, setFoodSearchQuery] = useState("");
    const [foodResults, setFoodResults] = useState<any[]>([]);

    // Fetch Meal Plan Details
    const { data: plan, isLoading } = useQuery({
        queryKey: ['meal-plan', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('meal_plans')
                .select('*, meals(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as MealPlan & { meals: Meal[] };
        },
        enabled: !!id
    });

    useEffect(() => {
        if (plan) {
            setProtocolName(plan.name);
        }
    }, [plan]);

    // Totals Calculation
    const totals = useMemo(() => {
        if (!plan?.meals) return { kcal: 0, protein: 0, carbs: 0, fats: 0 };
        return plan.meals.reduce((acc, meal) => {
            const mealFoods = meal.foods || [];
            mealFoods.forEach(food => {
                acc.kcal += Number(food.kcal) || 0;
                acc.protein += Number(food.protein) || 0;
                acc.carbs += Number(food.carbs) || 0;
                acc.fats += Number(food.fats) || 0;
            });
            return acc;
        }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });
    }, [plan?.meals]);

    // Mutations
    const updatePlanNameMutation = useMutation({
        mutationFn: async (name: string) => {
            const { error } = await supabase.from('meal_plans').update({ name }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Nome da dieta atualizado!");
            queryClient.invalidateQueries({ queryKey: ['meal-plan', id] });
        }
    });

    const addMealMutation = useMutation({
        mutationFn: async (name: string) => {
            const { data, error } = await supabase.from('meals').insert({
                meal_plan_id: id,
                name,
                order_index: (plan?.meals?.length || 0) + 1,
                foods: []
            }).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success("Refeição adicionada!");
            setIsAddMealOpen(false);
            setNewMealName("");
            queryClient.invalidateQueries({ queryKey: ['meal-plan', id] });
        }
    });

    const deleteMealMutation = useMutation({
        mutationFn: async (mealId: string) => {
            const { error } = await supabase.from('meals').delete().eq('id', mealId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Refeição removida!");
            queryClient.invalidateQueries({ queryKey: ['meal-plan', id] });
        }
    });

    const updateMealFoodsMutation = useMutation({
        mutationFn: async ({ mealId, foods }: { mealId: string, foods: any[] }) => {
            console.log("Updating meal foods:", { mealId, foods });
            const totalKcal = Math.round(foods.reduce((sum, f) => sum + Number(f.kcal || 0), 0));
            const totalProtein = Math.round(foods.reduce((sum, f) => sum + Number(f.protein || 0), 0));
            const totalCarbs = Math.round(foods.reduce((sum, f) => sum + Number(f.carbs || 0), 0));
            const totalFats = Math.round(foods.reduce((sum, f) => sum + Number(f.fats || 0), 0));

            const { data, error } = await supabase.from('meals').update({
                foods,
                total_calories: totalKcal,
                total_protein_g: totalProtein,
                total_carbs_g: totalCarbs,
                total_fats_g: totalFats
            }).eq('id', mealId).select();

            if (error) {
                console.error("Supabase update error:", error);
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Alimento adicionado!");
            queryClient.invalidateQueries({ queryKey: ['meal-plan', id] });
        },
        onError: (err: any) => {
            console.error("Mutation error:", err);
            toast.error(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`);
        }
    });

    // Food Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (foodSearchQuery.length < 2) {
                setFoodResults([]);
                return;
            }
            const { data, error } = await supabase
                .from('foods')
                .select('*')
                .ilike('name', `%${foodSearchQuery}%`)
                .limit(10);
            if (!error && data) setFoodResults(data);
        }, 300);
        return () => clearTimeout(timer);
    }, [foodSearchQuery]);

    const handleAddFood = (meal: Meal | undefined, food: any) => {
        if (!meal) {
            toast.error("Erro: Refeição não encontrada para adição.");
            return;
        }

        const currentFoods = meal.foods || [];
        const newFoodEntry = {
            id: food.id,
            name: food.name,
            qty: "100",
            unit: "g",
            kcal: food.kcal,
            protein: food.protein_g,
            carbs: food.carbs_g,
            fats: food.fats_g,
            base_kcal: food.kcal,
            base_protein: food.protein_g,
            base_carbs: food.carbs_g,
            base_fats: food.fats_g
        };

        updateMealFoodsMutation.mutate({
            mealId: meal.id,
            foods: [...currentFoods, newFoodEntry]
        });

        setIsSearchingFood(false);
        setFoodSearchQuery("");
    };

    const handleUpdateFoodQty = (meal: Meal, foodIndex: number, newQty: string) => {
        const foods = [...(meal.foods || [])];
        const food = (foods[foodIndex] as any);
        const qtyNum = parseFloat(newQty.replace(',', '.')) || 0;
        const ratio = qtyNum / 100;

        food.qty = newQty;
        food.kcal = (food.base_kcal * ratio).toFixed(1);
        food.protein = (food.base_protein * ratio).toFixed(1);
        food.carbs = (food.base_carbs * ratio).toFixed(1);
        food.fats = (food.base_fats * ratio).toFixed(1);

        updateMealFoodsMutation.mutate({ mealId: meal.id, foods });
    };

    const handleRemoveFood = (meal: Meal, foodIndex: number) => {
        const foods = [...(meal.foods || [])];
        foods.splice(foodIndex, 1);
        updateMealFoodsMutation.mutate({ mealId: meal.id, foods });
    };

    if (isLoading) {
        return <div className="p-8 text-white animate-pulse">Carregando editor de dieta...</div>;
    }

    if (!plan) {
        return <div className="p-8 text-white">Plano alimentar não encontrado.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 animate-fade-in space-y-8 max-w-[1600px] mx-auto">
            {/* Header HUD */}
            <div className="flex flex-col gap-6 border-b border-white/10 pb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate(plan.client_id ? `/dashboard/clients/${plan.client_id}` : '/dashboard/plans')}
                    className="w-fit text-muted-foreground hover:text-primary mb-2 p-0 h-auto font-display text-xs tracking-widest uppercase"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para {plan.client_id ? 'o Aluno' : 'Biblioteca'}
                </Button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Utensils className="text-primary h-8 w-8" />
                            <h1 className="text-4xl lg:text-5xl font-display font-black italic uppercase tracking-tighter text-white">
                                EDITOR DE DIETA
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 group">
                            <Input
                                value={protocolName}
                                onChange={(e) => setProtocolName(e.target.value)}
                                onBlur={() => updatePlanNameMutation.mutate(protocolName)}
                                className="bg-transparent border-none text-2xl font-bold text-primary placeholder:text-primary/30 focus-visible:ring-0 px-0 h-auto w-fit min-w-[300px]"
                                placeholder="NOME DA DIETA"
                            />
                            <Edit2 size={16} className="text-primary/30 group-hover:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Macro Targets HUD */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rotate-45 translate-x-8 -translate-y-8" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block">Calorias (Kcal)</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-display font-black italic text-white">{Math.round(totals.kcal)}</span>
                                <span className="text-xs text-white/30">/ {plan.target_calories || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block">Proteína (g)</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-display font-black italic text-white">{Math.round(totals.protein)}</span>
                                <span className="text-xs text-white/30">/ {plan.target_protein_g || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block">Carbos (g)</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-display font-black italic text-white">{Math.round(totals.carbs)}</span>
                                <span className="text-xs text-white/30">/ {plan.target_carbs_g || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block">Gordura (g)</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-display font-black italic text-white">{Math.round(totals.fats)}</span>
                                <span className="text-xs text-white/30">/ {plan.target_fats_g || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meals List */}
            <div className="grid gap-8">
                {plan.meals?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((meal) => (
                    <div key={meal.id} className="athletic-card p-0 group border-white/5 hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="text-primary font-display font-black italic">{meal.order_index}</span>
                                </div>
                                <h3 className="text-lg font-display font-bold uppercase italic text-white">{meal.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/40 hover:text-white hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest"
                                    onClick={() => {
                                        setSelectedMealId(meal.id);
                                        setIsSearchingFood(true);
                                    }}
                                >
                                    <Search size={14} className="mr-2" />
                                    Buscar Alimento
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/20 hover:text-destructive"
                                    onClick={() => deleteMealMutation.mutate(meal.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {meal.foods?.length === 0 ? (
                                <div className="p-8 text-center text-white/20 italic text-sm">
                                    Nenhum alimento adicionado. Clique em "Buscar Alimento" para começar.
                                </div>
                            ) : (
                                meal.foods?.map((food, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white uppercase tracking-tight">{food.name}</span>
                                            <div className="flex gap-3 mt-1">
                                                <span className="text-[10px] text-white/40 uppercase">P: <span className="text-primary/70">{food.protein}g</span></span>
                                                <span className="text-[10px] text-white/40 uppercase">C: <span className="text-primary/70">{food.carbs}g</span></span>
                                                <span className="text-[10px] text-white/40 uppercase">G: <span className="text-primary/70">{food.fats}g</span></span>
                                                <span className="text-[10px] text-white/40 uppercase">Kcal: <span className="text-primary/70">{food.kcal}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1">
                                                <Input
                                                    value={food.qty}
                                                    onChange={(e) => handleUpdateFoodQty(meal, idx, e.target.value)}
                                                    className="w-16 h-8 bg-transparent border-none text-right font-display font-bold text-primary px-0 focus-visible:ring-0"
                                                />
                                                <span className="text-[10px] font-bold text-white/30 uppercase">{food.unit}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-white/20 hover:text-destructive"
                                                onClick={() => handleRemoveFood(meal, idx)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Meal Totals Footer */}
                        {meal.foods?.length > 0 && (
                            <div className="p-4 bg-primary/5 flex justify-end gap-6 text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-white/40">Total Refeição:</span>
                                <span className="text-white">P: {meal.foods.reduce((s, f) => s + (Number(f.protein) || 0), 0).toFixed(1)}g</span>
                                <span className="text-white">C: {meal.foods.reduce((s, f) => s + (Number(f.carbs) || 0), 0).toFixed(1)}g</span>
                                <span className="text-white">G: {meal.foods.reduce((s, f) => s + (Number(f.fats) || 0), 0).toFixed(1)}g</span>
                                <span className="text-primary">{meal.foods.reduce((s, f) => s + (Number(f.kcal) || 0), 0).toFixed(0)} kcal</span>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => setIsAddMealOpen(true)}
                    className="athletic-card flex flex-col items-center justify-center p-12 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/[0.02] transition-all group"
                >
                    <Plus className="text-white/20 group-hover:text-primary mb-4 w-10 h-10" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white">Adicionar Refeição</span>
                </button>
            </div>

            {/* Modals */}
            <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                <DialogContent className="bg-background border-primary/20 max-w-sm rounded-none">
                    <DialogHeader>
                        <DialogTitle className="font-display font-black italic uppercase italic tracking-tighter text-2xl">Nova Refeição</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Nome da Refeição</Label>
                            <Input
                                value={newMealName}
                                onChange={(e) => setNewMealName(e.target.value)}
                                placeholder="ex: Café da Manhã"
                                className="bg-white/5 border-white/10 rounded-none focus:border-primary/50 h-12"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full btn-athletic rounded-none"
                            disabled={!newMealName || addMealMutation.isPending}
                            onClick={() => addMealMutation.mutate(newMealName)}
                        >
                            Criar Refeição
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isSearchingFood} onOpenChange={setIsSearchingFood}>
                <DialogContent className="bg-background border-primary/20 max-w-2xl rounded-none h-[80vh] flex flex-col p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="font-display font-black italic uppercase italic tracking-tighter text-2xl mb-4 text-white">Biblioteca de Alimentos</h2>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 w-5 h-5" />
                            <Input
                                autoFocus
                                value={foodSearchQuery}
                                onChange={(e) => setFoodSearchQuery(e.target.value)}
                                placeholder="BUSCAR ALIMENTO (ex: Frango, Arroz, Whey...)"
                                className="bg-white/5 border-white/10 rounded-none pl-12 h-14 text-lg focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {foodResults.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {foodResults.map((food) => (
                                    <button
                                        key={food.id}
                                        onClick={() => {
                                            const meal = plan.meals.find(m => m.id === selectedMealId);
                                            if (meal) handleAddFood(meal, food);
                                        }}
                                        className="w-full text-left p-6 hover:bg-primary/5 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-lg font-bold text-white uppercase italic tracking-tight">{food.name}</span>
                                            <div className="flex gap-4">
                                                <span className="text-[10px] font-bold text-white/40">P: {food.protein_g}g</span>
                                                <span className="text-[10px] font-bold text-white/40">C: {food.carbs_g}g</span>
                                                <span className="text-[10px] font-bold text-white/40">G: {food.fats_g}g</span>
                                                <span className="text-[10px] font-bold text-primary/60">{food.kcal} KCAL</span>
                                            </div>
                                        </div>
                                        <Plus className="text-white/20 group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>
                        ) : foodSearchQuery.length >= 2 ? (
                            <div className="p-12 text-center text-white/20 italic">Nenhum alimento encontrado.</div>
                        ) : (
                            <div className="p-12 text-center text-white/20 italic">Digite pelo menos 2 caracteres para buscar.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    );
}
