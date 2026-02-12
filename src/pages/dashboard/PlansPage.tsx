import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, Search, FileText, Dumbbell, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainingTemplates, useMealTemplates, useDeleteProtocol } from "@/hooks/useCoachData";
import { Workout } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTemplateDialog } from "@/components/dashboard/CreateTemplateDialog";
import { FeatureExplainer } from "@/components/dashboard/FeatureExplainer";

const PlansPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: trainingTemplates, isLoading: trainingLoading } = useTrainingTemplates();
  const { data: mealTemplates, isLoading: mealLoading } = useMealTemplates();
  const deleteProtocolMutation = useDeleteProtocol();

  const filteredTraining = trainingTemplates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredMeals = mealTemplates?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = (id: string, type: 'workout' | 'meal') => {
    if (window.confirm("Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.")) {
      deleteProtocolMutation.mutate({ id, type });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl lg:text-7xl font-display font-black italic uppercase leading-none tracking-tighter text-white">
            TREINOS <span className="text-primary">& DIETAS</span>
            <FeatureExplainer
              title="Biblioteca de Modelos"
              description="Aqui você cria a base teórica da sua consultoria. Crie modelos de treinos e planos alimentares que podem ser replicados ou adaptados para qualquer aluno em segundos."
              tip="Modelos economizam tempo: em vez de digitar tudo do zero para cada aluno, você importa um modelo e faz apenas os ajustes finos."
              className="inline-flex ml-4 mb-2 align-middle"
            />
          </h1>
          <p className="font-display font-bold uppercase italic text-[10px] tracking-[0.4em] text-primary/80">
            GERENCIAMENTO DE TREINOS E DIETAS
          </p>
        </div>
        <CreateTemplateDialog
          defaultType="training"
          trigger={
            <Button className="bg-primary hover:bg-primary/80 text-black font-display font-black italic uppercase text-sm px-8 py-6 rounded-none tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,255,0,0.3)]">
              <Plus className="mr-2 h-5 w-5 stroke-[3px]" /> NOVO MODELO
            </Button>
          }
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 border-y border-white/5 py-6 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
          <Input
            placeholder="BUSCAR MODELOS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-16 bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary/50 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <FeatureExplainer
          title="Como usar os modelos?"
          description="Você pode buscar modelos prontos aqui. Ao entrar no perfil de um aluno, você terá a opção de 'Importar da Biblioteca'. Isso puxará toda a estrutura deste modelo para o aluno específico."
          tip="Mantenha seus modelos genéricos o suficiente para serem úteis para vários alunos, fazendo as individualidades apenas após a importação."
        />
      </div>

      <Tabs defaultValue="treino" className="space-y-8">
        <TabsList className="bg-transparent border-none rounded-none h-auto p-0 gap-10">
          <TabsTrigger value="treino" className="bg-transparent border-none rounded-none p-0 pb-2 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary font-display font-black uppercase italic text-xs tracking-[0.2em] transition-all opacity-40 data-[state=active]:opacity-100">
            MODELOS DE TREINO
          </TabsTrigger>
          <TabsTrigger value="alimentar" className="bg-transparent border-none rounded-none p-0 pb-2 data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary font-display font-black uppercase italic text-xs tracking-[0.2em] transition-all opacity-40 data-[state=active]:opacity-100">
            MODELOS DE DIETA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="treino" className="m-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" variant="shimmer" />
              ))
            ) : (
              <>
                {filteredTraining.map(workout => {
                  const template = workout as Workout & { workout_exercises?: any[] };
                  const frequency = new Set(template.workout_exercises?.map((ex: any) => ex.day)).size || 0;
                  return (
                    <div
                      key={template.id}
                      onClick={() => navigate(`/dashboard/plans/${template.id}`)}
                      className="group bg-[#0A0A0B] border border-white/5 hover:border-primary/40 cursor-pointer transition-all relative overflow-hidden p-8 shadow-2xl h-[220px] flex flex-col justify-between"
                    >
                      {/* Left glow accent */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-[0_0_20px_rgba(212,255,0,0.5)] opacity-40 group-hover:opacity-100 transition-opacity" />

                      {/* Animated diagonal shine */}
                      <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16 transition-transform duration-700 group-hover:translate-x-4" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center -skew-x-12 group-hover:bg-primary group-hover:text-black transition-all">
                            <Dumbbell className="w-5 h-5" />
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-black text-primary italic uppercase tracking-[0.2em] leading-none mb-1">
                              {frequency}X/SEMANA
                            </p>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(template.id, 'workout');
                                }}
                                className="p-1 text-white/10 hover:text-destructive transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-display font-black text-2xl lg:text-3xl text-white italic uppercase tracking-tighter leading-[0.9] group-hover:text-primary transition-all pr-4">
                          {template.name}
                        </h3>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                          {new Date(template.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic group-hover:text-white/60 transition-colors">
                          ALUNOS ATIVOS: <span className="text-white italic">0</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
                <CreateTemplateDialog
                  defaultType="training"
                  trigger={
                    <button className="group border border-dashed border-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center text-white/5 hover:text-primary h-[220px] bg-transparent w-full">
                      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all">
                        <Plus size={32} className="transition-transform group-hover:rotate-90" />
                      </div>
                      <span className="font-display font-black italic uppercase text-[10px] tracking-[0.3em]">CRIAR NOVA FICHA</span>
                    </button>
                  }
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alimentar" className="m-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" variant="shimmer" />
              ))
            ) : (
              <>
                {filteredMeals.map(template => (
                  <div
                    key={template.id}
                    className="group bg-[#0A0A0B] border border-white/5 hover:border-primary/40 cursor-pointer transition-all relative overflow-hidden p-8 shadow-2xl h-[220px] flex flex-col justify-between"
                  >
                    {/* Left glow accent */}
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-[0_0_20px_rgba(212,255,0,0.5)] opacity-40 group-hover:opacity-100 transition-opacity" />

                    {/* Animated diagonal shine */}
                    <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16 transition-transform duration-700 group-hover:translate-x-4" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center -skew-x-12 group-hover:bg-primary group-hover:text-black transition-all">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-black text-primary italic uppercase tracking-[0.2em] leading-none mb-1">
                            NUTRIÇÃO
                          </p>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id, 'meal');
                              }}
                              className="p-1 text-white/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-display font-black text-2xl lg:text-3xl text-white italic uppercase tracking-tighter leading-[0.9] group-hover:text-primary transition-all pr-4">
                        {template.name}
                      </h3>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-4">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic group-hover:text-white/60 transition-colors">
                        SISTEMA <span className="text-white italic">ATIVO</span>
                      </p>
                    </div>
                  </div>
                ))}
                <CreateTemplateDialog
                  defaultType="meal"
                  trigger={
                    <button className="group border border-dashed border-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center text-white/5 hover:text-primary h-[220px] bg-transparent w-full">
                      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all">
                        <Plus size={32} className="transition-transform group-hover:rotate-90" />
                      </div>
                      <span className="font-display font-black italic uppercase text-[10px] tracking-[0.3em]">CRIAR NOVO PLANO</span>
                    </button>
                  }
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlansPage;
