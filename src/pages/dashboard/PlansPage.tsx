import { ClipboardList, Plus, Search, FileText, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMealPlan, mockTrainingPlan } from "@/data/mockData";

const PlansPage = () => {
  const mealTemplates = [
    { id: "1", name: "Emagrecimento 1800kcal", clients: 12, calories: 1800 },
    { id: "2", name: "Hipertrofia 2500kcal", clients: 8, calories: 2500 },
    { id: "3", name: "Manutenção 2000kcal", clients: 5, calories: 2000 },
    { id: "4", name: "Low Carb 1500kcal", clients: 6, calories: 1500 },
    { id: "5", name: "Vegano 1800kcal", clients: 3, calories: 1800 },
  ];

  const trainingTemplates = [
    { id: "1", name: "Treino ABC - Hipertrofia", clients: 10, frequency: "3x/semana" },
    { id: "2", name: "Treino ABCD - Avançado", clients: 4, frequency: "4x/semana" },
    { id: "3", name: "Full Body - Iniciante", clients: 8, frequency: "3x/semana" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Planos e Templates</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus templates de planos alimentares e treinos
          </p>
        </div>
        <Button className="btn-dashboard gap-2">
          <Plus size={18} />
          Novo Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Buscar templates..." className="pl-10" />
      </div>

      <Tabs defaultValue="alimentar">
        <TabsList>
          <TabsTrigger value="alimentar" className="gap-2">
            <FileText size={16} /> Planos Alimentares
          </TabsTrigger>
          <TabsTrigger value="treino" className="gap-2">
            <Dumbbell size={16} /> Fichas de Treino
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alimentar" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealTemplates.map(template => (
              <div key={template.id} className="dashboard-card hover:border-primary/30 cursor-pointer transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{template.calories}kcal</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Usado por {template.clients} clientes
                </p>
              </div>
            ))}
            <div className="dashboard-card border-dashed hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center text-muted-foreground hover:text-primary min-h-[140px]">
              <Plus size={24} className="mb-2" />
              <span className="text-sm font-medium">Criar Novo Template</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="treino" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingTemplates.map(template => (
              <div key={template.id} className="dashboard-card hover:border-primary/30 cursor-pointer transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-success/10">
                    <Dumbbell className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">{template.frequency}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Usado por {template.clients} clientes
                </p>
              </div>
            ))}
            <div className="dashboard-card border-dashed hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center text-muted-foreground hover:text-primary min-h-[140px]">
              <Plus size={24} className="mb-2" />
              <span className="text-sm font-medium">Criar Nova Ficha</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlansPage;
