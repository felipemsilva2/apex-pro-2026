import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  MessageCircle, 
  FileText,
  Mail,
  Phone,
  Calendar,
  Edit,
  MoreVertical,
  Send,
  AlertCircle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { mockClients, mockMealPlan, mockTrainingPlan } from "@/data/mockData";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("perfil");
  const [messageText, setMessageText] = useState("");

  const client = mockClients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Cliente não encontrado</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/clientes")}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return "text-success";
    if (adherence >= 60) return "text-warning";
    return "text-destructive";
  };

  const weightProgress = [
    { date: "Sem 1", weight: client.startWeight },
    { date: "Sem 2", weight: client.startWeight - 1.2 },
    { date: "Sem 3", weight: client.startWeight - 2.5 },
    { date: "Sem 4", weight: client.startWeight - 3.8 },
    { date: "Sem 5", weight: client.startWeight - 5.2 },
    { date: "Atual", weight: client.currentWeight },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/clientes")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {client.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                <Badge 
                  variant={client.status === "active" ? "default" : "secondary"}
                  className={client.status === "active" ? "bg-success/10 text-success" : ""}
                >
                  {client.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{client.objective} • {client.planName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit size={16} />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Agendar Consulta</DropdownMenuItem>
              <DropdownMenuItem>Enviar Lembrete</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Desativar Cliente</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Peso Atual</p>
            <p className="text-2xl font-bold">{client.currentWeight}kg</p>
            <p className="text-xs text-success">
              {(client.startWeight - client.currentWeight).toFixed(1)}kg perdidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Meta</p>
            <p className="text-2xl font-bold">{client.targetWeight}kg</p>
            <p className="text-xs text-muted-foreground">
              Faltam {(client.currentWeight - client.targetWeight).toFixed(1)}kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Adesão</p>
            <p className={cn("text-2xl font-bold", getAdherenceColor(client.adherence))}>
              {client.adherence}%
            </p>
            <Progress value={client.adherence} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dias Ativos</p>
            <p className="text-2xl font-bold">{client.daysActive}</p>
            <p className="text-xs text-muted-foreground">dias no programa</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="perfil" className="gap-2">
            <User size={16} /> Perfil
          </TabsTrigger>
          <TabsTrigger value="plano" className="gap-2">
            <Utensils size={16} /> Plano Alimentar
          </TabsTrigger>
          <TabsTrigger value="treino" className="gap-2">
            <Dumbbell size={16} /> Treino
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="gap-2">
            <TrendingUp size={16} /> Evolução
          </TabsTrigger>
          <TabsTrigger value="comunicacao" className="gap-2">
            <MessageCircle size={16} /> Comunicação
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <FileText size={16} /> Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="perfil" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatDate(client.birthDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anamnese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alergias</p>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.length > 0 ? (
                      client.allergies.map(a => (
                        <Badge key={a} variant="destructive">{a}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhuma alergia registrada</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Restrições</p>
                  <div className="flex flex-wrap gap-2">
                    {client.restrictions.length > 0 ? (
                      client.restrictions.map(r => (
                        <Badge key={r} variant="secondary">{r}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhuma restrição registrada</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meal Plan Tab */}
        <TabsContent value="plano" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{mockMealPlan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {mockMealPlan.totalCalories}kcal | P: {mockMealPlan.protein}g | C: {mockMealPlan.carbs}g | G: {mockMealPlan.fat}g
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Editar Plano</Button>
                <Button size="sm" className="btn-dashboard gap-1">
                  <Send size={14} /> Enviar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMealPlan.meals.map(meal => (
                  <div key={meal.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{meal.name}</h4>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {meal.foods.reduce((acc, f) => acc + f.calories, 0)}kcal
                      </p>
                    </div>
                    <div className="space-y-2">
                      {meal.foods.map((food, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{food.name}</span>
                          <span className="text-muted-foreground">{food.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="treino" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{mockTrainingPlan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{mockTrainingPlan.frequency}</p>
              </div>
              <Button variant="outline" size="sm">Editar Treino</Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {mockTrainingPlan.workouts.map(workout => (
                  <div key={workout.id} className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">{workout.name}</h4>
                    <div className="space-y-2">
                      {workout.exercises.map((ex, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium">{ex.name}</p>
                          <p className="text-muted-foreground">
                            {ex.sets}x{ex.reps} • {ex.weight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolucao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolução de Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}kg`, "Peso"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="comunicacao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chat com {client.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{client.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="bg-card p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">Bom dia, Dra.! Posso substituir o frango por peixe hoje?</p>
                      <p className="text-xs text-muted-foreground mt-1">08:45</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">Bom dia! Claro, pode sim. Pode usar salmão ou tilápia na mesma quantidade 👍</p>
                      <p className="text-xs text-primary-foreground/70 mt-1">09:15</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button className="btn-dashboard self-end">
                  <Send size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="relatorios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relatórios do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <FileText className="text-primary" />
                  <span className="font-medium">Relatório de Evolução</span>
                  <span className="text-xs text-muted-foreground">PDF exportável</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <TrendingUp className="text-success" />
                  <span className="font-medium">Taxa de Adesão</span>
                  <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                  <Utensils className="text-warning" />
                  <span className="font-medium">Registro Alimentar</span>
                  <span className="text-xs text-muted-foreground">Check-ins do cliente</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
