import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FeatureExplainer } from "@/components/dashboard/FeatureExplainer";
import {
  ArrowLeft,
  Dumbbell,
  TrendingDown,
  MoreVertical,
  Send,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  Utensils,
  TrendingUp,
  Loader2,
  Edit2,
  Trash2,
  Archive,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachClientDetail, useClientWorkouts, useClientMealPlans, useDeleteProtocol, useClientHormonalProtocols, useDeleteClient } from "@/hooks/useCoachData";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { AssignProtocolDialog } from "@/components/dashboard/AssignProtocolDialog";
import { ProtocolCard } from "@/components/dashboard/ProtocolCard";
import { CreateTemplateDialog } from "@/components/dashboard/CreateTemplateDialog";
import { ClientStatusControl } from "@/components/dashboard/ClientStatusControl";
import { CreateHormonalProtocolDialog } from "@/components/dashboard/CreateHormonalProtocolDialog";
import { HormonalProtocolCard } from "@/components/dashboard/HormonalProtocolCard";
import { AssessmentsTab } from "@/components/dashboard/AssessmentsTab";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: coachProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [messageText, setMessageText] = useState("");

  const { data: client, isLoading } = useCoachClientDetail(id);
  const { data: workouts } = useClientWorkouts(id);
  const { data: mealPlans } = useClientMealPlans(id);

  // Group meal plans by day label for carb cycling support
  const groupedMealPlans = useMemo(() => {
    if (!mealPlans) return {};
    return mealPlans.reduce((acc, plan) => {
      const label = plan.day_label || "Geral";
      if (!acc[label]) acc[label] = [];
      acc[label].push(plan);
      return acc;
    }, {} as Record<string, typeof mealPlans>);
  }, [mealPlans]);

  const dayLabels = useMemo(() => {
    const labels = Object.keys(groupedMealPlans);
    // Sort so 'Geral' is usually at the end or start, but maybe keep alphabetical or based on specific order
    const priority = { 'carbo_alto': 1, 'carbo_medio': 2, 'carbo_baixo': 3, 'zero_carbo': 4, 'Geral': 5 };
    return labels.sort((a, b) => (priority[a] || 9) - (priority[b] || 9));
  }, [groupedMealPlans]);

  const [activeDietLabel, setActiveDietLabel] = useState<string | null>(null);

  useEffect(() => {
    if (dayLabels.length > 0 && !activeDietLabel) {
      setActiveDietLabel(dayLabels[0]);
    }
  }, [dayLabels, activeDietLabel]);
  const { data: hormonalProtocols } = useClientHormonalProtocols(id);
  const deleteProtocolMutation = useDeleteProtocol();
  const deleteClientMutation = useDeleteClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClient = () => {
    if (!id) return;
    deleteClientMutation.mutate(id, {
      onSuccess: () => {
        navigate("/dashboard/clients");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-dashed border-white/10 mt-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-display font-black italic uppercase text-white">ALUNO NÃO ENCONTRADO</h2>
        <Button variant="outline" className="mt-6 rounded-none border-primary text-primary" onClick={() => navigate("/dashboard/clients")}>
          VOLTAR PARA MEUS ALUNOS
        </Button>
      </div>
    );
  }

  const adherence = 100; // Placeholder

  const weightProgress = [
    { date: "Início", weight: (client.current_weight || 0) + 5 },
    { date: "Atual", weight: client.current_weight },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "NÃO INFORMADO";
    // Add T12:00:00 to avoid timezone offset issues (shifting to previous day)
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <button
          onClick={() => navigate("/dashboard/clients")}
          className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/50 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-white/40 group-hover:text-primary" />
        </button>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary/20 -skew-x-12 rounded-none">
              <AvatarImage src={client.avatar_url || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display font-black italic uppercase rounded-none">
                {client.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl lg:text-5xl font-display font-black italic uppercase leading-tight tracking-tighter text-white">
                  {client.full_name}
                </h1>
                <ClientStatusControl
                  clientId={client.id}
                  currentStatus={(client.status as 'active' | 'suspended' | 'cancelled') || 'active'}
                  clientName={client.full_name}
                />
              </div>
              <p className="font-display font-bold uppercase italic text-xs tracking-[0.3em] text-primary/60 mt-2">
                PLANO: <span className="text-white/80">ALTA PERFORMANCE</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EditClientDialog client={client} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/50 transition-colors cursor-pointer text-white/40">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-white/10 rounded-none w-48">
              <DropdownMenuItem
                className="text-white/70 focus:text-primary focus:bg-white/5 cursor-pointer flex items-center gap-2 py-3"
                onClick={() => setActiveTab("perfil")}
              >
                <FileText size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">VER FICHA COMPLETA</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white/70 focus:text-primary focus:bg-white/5 cursor-pointer flex items-center gap-2 py-3"
                onClick={() => navigate('/dashboard/agenda')}
              >
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">AGENDAR SESSÃO</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 py-3"
                onSelect={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">REMOVER ALUNO</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[500px] p-0 overflow-hidden shadow-2xl shadow-destructive/5">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-destructive/50" />
              <div className="absolute top-0 left-0 w-[2px] h-full bg-destructive" />

              <AlertDialogHeader className="p-8 pb-4">
                <AlertDialogTitle className="font-display font-black italic uppercase text-3xl tracking-tighter flex flex-col leading-none">
                  <span className="text-destructive/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold uppercase">CONFIRMAÇÃO DE EXCLUSÃO</span>
                  <span className="flex items-center gap-3">
                    CONFIRMAR <span className="text-destructive">EXCLUSÃO</span>
                  </span>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/60 text-sm italic py-4 leading-relaxed font-medium">
                  VOCÊ ESTÁ PRESTES A REMOVER <span className="text-destructive font-black uppercase not-italic">{client.full_name}</span> DA SUA LISTA. <br /><br />
                  <span className="text-white/80">ESTA OPERAÇÃO É IRREVERSÍVEL.</span> TODOS OS DADOS DO ALUNO, PLANOS E MEDIÇÕES SERÃO EXCLUÍDOS.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel className="flex-1 rounded-none border border-white/10 bg-transparent text-white/40 hover:bg-white/5 hover:text-white uppercase font-display font-black italic text-[10px] tracking-widest h-14 transition-all">
                  MANTER ALUNO
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClient}
                  className="flex-[2] rounded-none bg-destructive text-white hover:bg-destructive/80 uppercase font-display font-black italic text-[10px] tracking-widest h-14 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  REMOVER DEFINITIVAMENTE
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="athletic-card group">
          <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peso Atual</p>
          <p className="text-3xl font-display font-black text-white italic leading-none">{client.current_weight || "--"}kg</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown size={12} className="text-primary" />
            <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter">Telemetria Estável</span>
          </div>
        </div>

        <div className="athletic-card group">
          <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peso Meta</p>
          <p className="text-3xl font-display font-black text-white italic leading-none">{client.target_weight || "--"}kg</p>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">META DO ALUNO</p>
        </div>

        <div className="athletic-card group">
          <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Aderência</p>
          <p className="text-3xl font-display font-black text-primary italic leading-none">{adherence}%</p>
          <div className="h-1 w-full bg-white/5 mt-3 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${adherence}%` }} />
          </div>
        </div>

        <div className="athletic-card group">
          <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Gênero</p>
          <p className="text-3xl font-display font-black text-white italic leading-none uppercase">
            {client.gender === 'male' ? 'MASCULINO' : client.gender === 'female' ? 'FEMININO' : client.gender === 'other' ? 'OUTRO' : '--'}
          </p>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">BIOMETRIA</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-white/5 rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="perfil" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            PERFIL BIOMÉTRICO
          </TabsTrigger>
          <TabsTrigger value="hormonal" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            PROTOCOLOS
          </TabsTrigger>
          <TabsTrigger value="treino" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            TREINOS
          </TabsTrigger>
          <TabsTrigger value="alimentacao" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            DIETA
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            EVOLUÇÃO
          </TabsTrigger>
          <TabsTrigger value="avaliacoes" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            AVALIAÇÕES FÍSICAS
          </TabsTrigger>
          <TabsTrigger value="arquivos" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all text-white/40">
            ARQUIVOS & EXAMES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="athletic-card border-l-2 border-l-primary">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-primary -skew-x-12" />
                <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">Biometria & Perfil</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 -skew-x-12 group-hover:border-primary/40 transition-colors">
                    <Mail size={18} className="text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email Atleta</p>
                    <p className="font-display font-bold text-white italic uppercase">{client.email || "NÃO INFORMADO"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 -skew-x-12 group-hover:border-primary/40 transition-colors">
                    <Phone size={18} className="text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status de Chamada</p>
                    <p className="font-display font-bold text-white italic uppercase">{client.phone || "NÃO INFORMADO"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 -skew-x-12 group-hover:border-primary/40 transition-colors">
                    <Calendar size={18} className="text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">DATA DE NASCIMENTO</p>
                    <p className="font-display font-bold text-white italic uppercase">{formatDate(client.birth_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="athletic-card border-l-2 border-l-destructive">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-destructive -skew-x-12" />
                <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">NOTAS TÁTICAS</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Relatórios do Coach</p>
                  <p className="text-sm font-medium text-white/80 leading-relaxed italic border-l border-white/10 pl-4">
                    {client.notes || "Sem observações críticas registradas para este atleta."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hormonal" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hormonalProtocols?.map(protocol => (
              <HormonalProtocolCard
                key={protocol.id}
                protocol={protocol}
              />
            ))}
            <CreateHormonalProtocolDialog clientId={id!} />
          </div>
        </TabsContent>

        <TabsContent value="treino" className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <FeatureExplainer
              title="Protocolos de Treino"
              description="Os treinos ativos do aluno são listados aqui. Cada card representa um protocolo completo (ex: ABC, Full Body) que ele visualiza no app mobile."
              tip="Você pode atribuir múltiplos protocolos, mas recomendo manter apenas o atual como 'Ativo' para não confundir o aluno."
            />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 italic">Protocolos Ativos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts?.map(workout => (
              <Link key={workout.id} to={`/dashboard/plans/${workout.id}`}>
                <ProtocolCard
                  protocol={workout}
                  type="workout"
                  onDelete={(id) => deleteProtocolMutation.mutate({ id, type: 'workout' })}
                  onEdit={(id) => navigate(`/dashboard/plans/${id}`)}
                />
              </Link>
            ))}
            <AssignProtocolDialog clientId={id!} defaultType="workout" />
            <CreateTemplateDialog
              key="direct-training"
              clientId={id!}
              defaultType="training"
              trigger={
                <button className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group min-h-[160px]">
                  <Plus size={24} className="text-white/20 group-hover:text-primary mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white">CRIAR PERSONALIZADO</span>
                </button>
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="alimentacao" className="mt-8">
          <div className="space-y-8">
            {dayLabels.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <FeatureExplainer
                  title="Estratégias de Dieta"
                  description="As dietas ativas do aluno são agrupadas automaticamente por rótulo (TIPO). Isso permite que o aluno escolha entre diferentes planos (ex: Dia Alto Carbo vs Dia Baixo) diretamente no app mobile."
                  tip="O agrupamento só aparece se você definir os rótulos no Editor de Dieta."
                />
                <div className="flex items-center gap-2">
                  {dayLabels.map((label) => (
                    <button
                      key={label}
                      onClick={() => setActiveDietLabel(label)}
                      className={`px-4 py-2 text-[10px] font-display font-black italic uppercase tracking-widest transition-all whitespace-nowrap border ${activeDietLabel === label
                        ? "bg-primary text-black border-primary"
                        : "bg-white/5 text-white/40 border-white/5 hover:border-primary/20 hover:text-white"
                        }`}
                    >
                      {label === "Geral" ? "Geral" : label.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeDietLabel ? groupedMealPlans[activeDietLabel] : mealPlans)?.map((plan) => (
                <Link key={plan.id} to={`/dashboard/meal-plans/${plan.id}`}>
                  <ProtocolCard
                    protocol={plan}
                    type="meal"
                    onDelete={(id) => deleteProtocolMutation.mutate({ id, type: 'meal' })}
                    onEdit={(id) => navigate(`/dashboard/meal-plans/${id}`)}
                  />
                </Link>
              ))}

              <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-4">
                  <AssignProtocolDialog clientId={id!} defaultType="meal" />
                  <CreateTemplateDialog
                    key="direct-meal"
                    clientId={id!}
                    defaultType="meal"
                    trigger={
                      <button className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group min-h-[160px] flex-1">
                        <Plus size={24} className="text-white/20 group-hover:text-primary mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white">CRIAR PERSONALIZADO</span>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evolucao" className="mt-8">
          <div className="athletic-card p-6 border-t-2 border-t-primary">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-6 bg-primary -skew-x-12" />
              <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">Roadmap de Performance</h3>
            </div>

            <div className="h-[400px] bg-white/5 p-4 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16" />

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightProgress}>
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(v) => `${v}KG`}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1C",
                      border: "1px solid rgba(212,255,0,0.2)",
                      borderRadius: "0",
                      padding: "12px"
                    }}
                    itemStyle={{
                      color: "#D4FF00",
                      fontFamily: "Syne",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      fontStyle: "italic"
                    }}
                    cursor={{ stroke: 'rgba(212,255,0,0.2)', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#D4FF00"
                    strokeWidth={4}
                    dot={{ fill: "#D4FF00", r: 4, strokeWidth: 2, stroke: "#0A0A0B" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-8">
          <AssessmentsTab client={client} tenantId={client.tenant_id} />
        </TabsContent>

        <TabsContent value="arquivos" className="mt-8">
          <DocumentsTab client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
