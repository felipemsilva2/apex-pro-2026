import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Grid3X3, List, MoreVertical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { type Client } from "@/lib/supabase";
import { InviteStudentDialog } from "@/components/dashboard/InviteStudentDialog";
import { CSVImportDialog } from "@/components/dashboard/CSVImportDialog";
import { useCoachClients } from "@/hooks/useCoachData";
import { Loader2 } from "lucide-react";

const ClientsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: clients, isLoading } = useCoachClients();

  const filteredClients = (clients || []).filter((client) => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const ClientCard = ({ client }: { client: Client }) => {
    const adherence = 100; // Placeholder for real adherence calculation

    return (
      <div
        className="athletic-card group hover:border-primary/40 cursor-pointer transition-all duration-300"
        onClick={() => navigate(`/dashboard/clients/${client.id}`)}
      >
        <div className="absolute top-0 right-0 w-24 h-full bg-primary/5 -skew-x-[30deg] translate-x-12 transition-transform duration-500 group-hover:translate-x-8" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-white/10 -skew-x-12 rounded-none">
                <AvatarImage src={client.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20 text-primary font-display font-black text-lg italic uppercase rounded-none">
                  {client.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-display font-black text-lg italic uppercase leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {client.full_name}
                </h3>
                <p className="font-display font-bold text-[10px] uppercase tracking-widest text-primary/60 mt-2">{client.status.toUpperCase()}</p>
              </div>
            </div>
            <div className={cn(
              "text-[9px] font-black uppercase italic px-2 py-0.5 -skew-x-12",
              client.status === "active" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,255,0,0.3)]" :
                client.status === "suspended" ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]" :
                  client.status === "cancelled" ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" :
                    "bg-white/10 text-white/40"
            )}>
              {client.status === "active" ? "ATIVO" :
                client.status === "suspended" ? "SUSPENSO" :
                  client.status === "cancelled" ? "CANCELADO" :
                    client.status.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-white/5 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="text-muted-foreground">ADERÊNCIA TÁTICA</span>
                <span className={cn("font-black italic", getAdherenceColor(adherence))}>
                  {adherence}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-1000", getProgressColor(adherence))}
                  style={{ width: `${adherence}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">PESO ATUAL</span>
                <p className="font-display font-black italic text-sm text-white">{client.current_weight || "--"} KG</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">OBJETIVO</span>
                <p className="font-display font-black italic text-sm text-primary">{client.target_weight || "--"} KG</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClientRow = ({ client }: { client: Client }) => {
    const adherence = 100;

    return (
      <div
        className="group relative bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 transition-all cursor-pointer p-4 grid grid-cols-12 items-center gap-4"
        onClick={() => navigate(`/dashboard/clients/${client.id}`)}
      >
        <div className="col-span-4 flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-white/10 -skew-x-12 rounded-none">
            <AvatarImage src={client.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary font-display font-black text-xs italic uppercase rounded-none">
              {client.full_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-display font-bold text-sm italic uppercase tracking-tight text-white group-hover:text-primary transition-colors">
              {client.full_name}
            </h4>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{client.email}</p>
          </div>
        </div>
        <div className="col-span-2">
          <Badge
            variant="outline"
            className={cn(
              "rounded-none border-white/10 text-[9px] font-black uppercase italic tracking-widest px-2 py-0.5",
              client.status === "active" ? "bg-primary/10 text-primary border-primary/30" :
                client.status === "suspended" ? "bg-amber-400/10 text-amber-400 border-amber-400/30" :
                  client.status === "cancelled" ? "bg-red-400/10 text-red-400 border-red-400/30" :
                    "text-white/40"
            )}
          >
            {client.status === "active" ? "ATIVO" :
              client.status === "suspended" ? "SUSPENSO" :
                client.status === "cancelled" ? "CANCELADO" :
                  client.status.toUpperCase()}
          </Badge>
        </div>
        <div className="col-span-3 px-4">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider mb-1.5">
            <span className={getAdherenceColor(adherence)}>{adherence}% ADERÊNCIA</span>
          </div>
          <Progress value={adherence} className="h-1 bg-white/5 [&>div]:bg-primary" />
        </div>
        <div className="col-span-2 text-right">
          <span className="text-[9px] font-bold text-white/20 uppercase block">PESO ATUAL</span>
          <span className="font-display font-black italic text-sm text-white">{client.current_weight || "--"} KG</span>
        </div>
        <div className="col-span-1 text-right group-hover:translate-x-1 transition-transform">
          <ChevronRight size={18} className="text-primary ml-auto" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-display font-black italic uppercase leading-tight tracking-tighter">
            MEUS <span className="text-primary text-blur-sm">ALUNOS</span>
          </h1>
          <p className="font-display font-bold uppercase italic text-xs tracking-[0.3em] text-primary/60 mt-2">
            GERENCIAMENTO DA CARTEIRA DE ATLETAS
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <CSVImportDialog />
          <InviteStudentDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 border border-white/5 relative">
        <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[45deg] translate-x-16 pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto relative z-10">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors" />
            <Input
              placeholder="BUSCAR ATLETA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-full md:w-72 bg-black border-white/10 rounded-none font-display font-black italic uppercase text-[10px] tracking-widest focus:border-primary transition-all"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full md:w-40 bg-black border-white/10 rounded-none font-display font-black italic uppercase text-[10px] tracking-widest">
              <SelectValue placeholder="STATUS" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-white/10 text-white rounded-none">
              <SelectItem value="all" className="uppercase font-display font-bold italic text-[10px]">TODOS STATUS</SelectItem>
              <SelectItem value="active" className="uppercase font-display font-bold italic text-[10px]">ATIVO</SelectItem>
              <SelectItem value="suspended" className="uppercase font-display font-bold italic text-[10px]">SUSPENSO</SelectItem>
              <SelectItem value="cancelled" className="uppercase font-display font-bold italic text-[10px]">CANCELADO</SelectItem>
              <SelectItem value="inactive" className="uppercase font-display font-bold italic text-[10px]">INATIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center border border-white/10 p-1 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-none h-9 w-9 transition-all",
              viewMode === "grid" ? "bg-primary text-black" : "text-white/40 hover:text-white"
            )}
          >
            <Grid3X3 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-none h-9 w-9 transition-all",
              viewMode === "list" ? "bg-primary text-black" : "text-white/40 hover:text-white"
            )}
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      {/* Clients View */}
      {filteredClients.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-white/5 border border-dashed border-white/10">
          <p className="font-display font-black italic uppercase text-lg text-white/20 tracking-widest">
            NENHUM ATLETA ENCONTRADO NA BASE
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
