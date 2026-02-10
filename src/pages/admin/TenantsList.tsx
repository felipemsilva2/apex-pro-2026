import { useState, useEffect } from "react";
import { AdminService, type TenantAdminInfo } from "@/api/services/adminService";
import {
    Search,
    Filter,
    MoreVertical,
    Building,
    User,
    Users,
    Calendar,
    Ban,
    CheckCircle,
    ChevronRight,
    ExternalLink,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
import { toast } from "sonner";

const TenantsList = () => {
    const [tenants, setTenants] = useState<TenantAdminInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<TenantAdminInfo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const data = await AdminService.listTenants();
            setTenants(data);
        } catch (err) {
            console.error("Error fetching tenants:", err);
            toast.error("Erro ao carregar ambientes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            await AdminService.updateTenantStatus(tenantId, newStatus);
            toast.success(`Ambiente ${newStatus === 'active' ? 'reativado' : 'suspenso'} com sucesso.`);
            fetchTenants();
        } catch (err) {
            console.error("Error updating tenant status:", err);
            toast.error("Erro ao alterar status do ambiente.");
        }
    };

    const handleDeleteTenant = async () => {
        if (!selectedTenant) return;

        try {
            setIsDeleting(true);
            await AdminService.deleteTenant(selectedTenant.id);

            // Optimistic update: Remove from state immediately
            setTenants(current => current.filter(t => t.id !== selectedTenant.id));

            toast.success("Ambiente removido com sucesso.");
            setDeleteDialogOpen(false);

            // Refetch in background to ensure consistency
            fetchTenants();
        } catch (err: any) {
            console.error("Error deleting tenant:", err);
            toast.error(err.message || "Erro ao remover ambiente.");
            // If error, rollback (refetch)
            fetchTenants();
        } finally {
            setIsDeleting(false);
            setSelectedTenant(null);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.master_coach?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewTenant = (tenant: TenantAdminInfo) => {
        // Construct URL: prioritize custom domain, fallback to subdomain
        const url = tenant.custom_domain
            ? `https://${tenant.custom_domain}`
            : `https://${tenant.subdomain}.apexpro.fit`;

        window.open(url, '_blank');
    };

    const sortedTenants = [...filteredTenants].sort((a, b) => {
        // Active first
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
    });

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                        GESTÃO DE <span className="text-primary text-blur-sm">AMBIENTES</span>
                    </h1>
                    <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                        Controle total sobre a frota de treinadores Apex Pro
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <Input
                            placeholder="PESQUISAR AMBIENTE OU COACH..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-none font-display font-bold italic uppercase text-[10px] tracking-widest focus:border-primary transition-all text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                ) : filteredTenants.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 italic">
                        <Building size={48} className="text-white/10 mb-4" />
                        <p className="text-white/20 font-display font-bold uppercase tracking-widest text-xs">Nenhum ambiente localizado</p>
                    </div>
                ) : (
                    filteredTenants.map((tenant) => (
                        <Card key={tenant.id} className="bg-black/40 border-white/5 p-6 hover:border-primary/30 transition-all group overflow-hidden relative">
                            {/* Status Indicator Bar */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1 transition-all",
                                tenant.status === 'active' ? "bg-emerald-500" : "bg-primary"
                            )} />

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white flex items-center justify-center -skew-x-12 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <span className="text-black font-display font-black text-3xl italic">{tenant.business_name?.charAt(0)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-display font-black italic uppercase text-white tracking-tighter leading-none">
                                                {tenant.business_name}
                                            </h3>
                                            <Badge className={cn(
                                                "rounded-none font-black italic text-[9px] px-2 py-0 border-none uppercase tracking-widest",
                                                tenant.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                                            )}>
                                                {tenant.status === 'active' ? 'ATIVO' : 'SUSPENSO'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase italic tracking-widest mt-1">
                                            <span className="flex items-center gap-1.5"><Building size={12} className="text-primary" /> {tenant.subdomain}.nutripro.pro</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> INÍCIO: {new Date(tenant.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PERSONAL MESTRE</span>
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-primary" />
                                            <span className="text-xs font-display font-bold italic text-white uppercase">{tenant.master_coach?.full_name || 'NÃO DEFINIDO'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">ALUNOS ATIVOS</span>
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="text-emerald-500" />
                                            <span className="text-xs font-display font-bold italic text-white">{tenant.client_count || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">PLANO ATUAL</span>
                                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 w-fit">
                                            <span className="text-[9px] font-black italic text-primary uppercase tracking-widest">{tenant.plan_tier || 'FREE'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 lg:ml-4">
                                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors h-14 w-14 rounded-none border border-white/5">
                                        <ChevronRight size={20} />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
                                                <MoreVertical size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white rounded-none w-56">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest p-4 text-white/40 italic font-display">AÇÕES DE COMANDO</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem
                                                className="p-4 flex items-center gap-3 cursor-pointer group focus:bg-primary/10"
                                                onClick={() => handleViewTenant(tenant)}
                                            >
                                                <Building size={16} className="text-primary transition-transform group-hover:scale-110" />
                                                <span className="text-[10px] font-black italic uppercase tracking-widest">VER AMBIENTE</span>
                                                <ExternalLink size={12} className="ml-auto opacity-30" />
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="p-4 flex items-center gap-3 cursor-pointer group text-red-500 focus:bg-red-500/10"
                                                onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                                            >
                                                {tenant.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                <span className="text-[10px] font-black italic uppercase tracking-widest">
                                                    {tenant.status === 'active' ? 'SUSPENDER TRABALHOS' : 'ATIVAR TRABALHOS'}
                                                </span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="bg-white/5" />

                                            <DropdownMenuItem
                                                className="p-4 flex items-center gap-3 cursor-pointer group text-red-500 focus:bg-red-500/10"
                                                onClick={() => { setSelectedTenant(tenant); setDeleteDialogOpen(true); }}
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                                <span className="text-[10px] font-black italic uppercase tracking-widest">REMOVER AMBIENTE</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0A0A0A] border-white/10 rounded-none max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-display font-black italic uppercase text-white flex items-center gap-3">
                            <AlertTriangle className="text-red-500" />
                            CONFIRMAR EXCLUSÃO
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60 font-medium">
                            Esta ação é <span className="text-white font-bold underline">irreversível</span>. Ao remover o ambiente
                            <span className="text-white font-bold italic ml-1 uppercase">{selectedTenant?.business_name}</span>,
                            todos os alunos, treinadores, protocolos e históricos vinculados serão <span className="text-red-500 font-bold uppercase tracking-tight">permanentemente deletados</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="bg-white/5 border-white/10 rounded-none text-white/40 font-display font-black italic uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all h-12">
                            CANCELAR
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteTenant();
                            }}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 rounded-none text-black font-display font-black italic uppercase tracking-widest text-[10px] transition-all h-12 px-8"
                        >
                            {isDeleting ? "REMOVENDO..." : "REMOVER DEFINITIVAMENTE"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TenantsList;
