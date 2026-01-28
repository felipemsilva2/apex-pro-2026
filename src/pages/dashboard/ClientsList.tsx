import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Grid3X3, List, MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { mockClients, type Client } from "@/data/mockData";

const ClientsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesObjective = objectiveFilter === "all" || client.objective === objectiveFilter;
    return matchesSearch && matchesStatus && matchesObjective;
  });

  const objectives = [...new Set(mockClients.map(c => c.objective))];

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return "text-success";
    if (adherence >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (adherence: number) => {
    if (adherence >= 80) return "bg-success";
    if (adherence >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <div
      className="dashboard-card hover:border-primary/30 cursor-pointer transition-all"
      onClick={() => navigate(`/dashboard/clientes/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {client.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">{client.objective}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/clientes/${client.id}`); }}>
              Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              Enviar Mensagem
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Weight Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Peso atual</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{client.currentWeight}kg</span>
              {client.currentWeight < client.startWeight ? (
                <TrendingDown size={14} className="text-success" />
              ) : (
                <TrendingUp size={14} className="text-warning" />
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Meta: {client.targetWeight}kg (início: {client.startWeight}kg)
          </div>
        </div>

        {/* Adherence */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Adesão ao plano</span>
            <span className={cn("font-semibold", getAdherenceColor(client.adherence))}>
              {client.adherence}%
            </span>
          </div>
          <Progress value={client.adherence} className={cn("h-2", getProgressColor(client.adherence))} />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          <span>{client.daysActive} dias ativos</span>
          <span>Última: {formatDate(client.lastConsult)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <Badge 
        variant={client.status === "active" ? "default" : "secondary"}
        className={cn(
          "absolute top-4 right-12",
          client.status === "active" ? "bg-success/10 text-success hover:bg-success/20" : ""
        )}
      >
        {client.status === "active" ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  );

  const ClientRow = ({ client }: { client: Client }) => (
    <div
      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all"
      onClick={() => navigate(`/dashboard/clientes/${client.id}`)}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {client.avatar}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">{client.name}</h3>
          <Badge 
            variant="secondary"
            className={cn(
              "text-xs",
              client.status === "active" ? "bg-success/10 text-success" : ""
            )}
          >
            {client.status === "active" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{client.objective} • {client.planName}</p>
      </div>

      <div className="hidden md:block text-center min-w-[80px]">
        <p className="font-medium text-foreground">{client.currentWeight}kg</p>
        <p className="text-xs text-muted-foreground">Meta: {client.targetWeight}kg</p>
      </div>

      <div className="hidden md:block text-center min-w-[80px]">
        <p className={cn("font-semibold", getAdherenceColor(client.adherence))}>
          {client.adherence}%
        </p>
        <p className="text-xs text-muted-foreground">Adesão</p>
      </div>

      <div className="hidden lg:block text-center min-w-[100px]">
        <p className="font-medium text-foreground">{formatDate(client.lastConsult)}</p>
        <p className="text-xs text-muted-foreground">Última consulta</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/clientes/${client.id}`); }}>
            Ver Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Enviar Mensagem</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">Desativar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""} encontrado{filteredClients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="btn-dashboard gap-2">
          <Plus size={18} />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os objetivos</SelectItem>
            {objectives.map(obj => (
              <SelectItem key={obj} value={obj}>{obj}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={18} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      {/* Clients Grid/List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <ClientRow key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsList;
