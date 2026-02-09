import { useState, useEffect } from "react";
import { AdminService, type UserAdminInfo } from "@/api/services/adminService";
import {
    Search,
    User,
    Mail,
    Shield,
    MoreVertical,
    UserPlus,
    Pencil,
    Key,
    Trash2,
    CalendarPlus,
    AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

// Import dialogs
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import { ExtendPlanDialog } from "@/components/admin/ExtendPlanDialog";

const UsersListAdmin = () => {
    const [users, setUsers] = useState<UserAdminInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [extendPlanDialogOpen, setExtendPlanDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Selected user for operations
    const [selectedUser, setSelectedUser] = useState<UserAdminInfo | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await AdminService.listAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching admin users:", err);
            toast.error("Erro ao carregar usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setDeleting(true);
        try {
            await AdminService.deleteUser(selectedUser.id);
            toast.success("Usuário deletado com sucesso!");
            fetchUsers();
            setDeleteDialogOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Erro ao deletar usuário.");
        } finally {
            setDeleting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                        GESTÃO DE <span className="text-primary text-blur-sm">USUÁRIOS</span>
                    </h1>
                    <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                        Monitoramento global de todas as contas da rede Apex
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <Input
                            placeholder="BUSCAR NOME OU EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-none font-display font-bold italic uppercase text-[10px] tracking-widest focus:border-primary transition-all text-white"
                        />
                    </div>
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="btn-athletic h-12 rounded-none gap-2"
                    >
                        <UserPlus size={18} />
                        <span className="hidden md:inline">NOVO</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 italic">
                        <User size={48} className="text-white/10 mb-4" />
                        <p className="text-white/20 font-display font-bold uppercase tracking-widest text-xs">Nenhum usuário localizado</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <Card key={user.id} className="bg-black/40 border-white/5 p-6 hover:border-primary/20 transition-all flex items-center justify-between group overflow-hidden relative">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center -skew-x-12">
                                    <User size={20} className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="font-display font-black italic text-md text-white uppercase tracking-tight">{user.full_name || 'Usuário Sem Nome'}</span>
                                        <Badge className={cn(
                                            "rounded-none font-black italic text-[8px] px-2 py-0 border-none uppercase tracking-[0.2em]",
                                            user.role === 'admin' ? "bg-primary text-white" :
                                                user.role === 'coach' ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                                        )}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/40 text-[9px] font-bold uppercase italic tracking-widest mt-1">
                                        <span className="flex items-center gap-1.5"><Mail size={10} className="text-primary" /> {user.email || 'managed@acesso.apexpro.fit'}</span>
                                        <span className="flex items-center gap-1.5"><Shield size={10} className="text-primary" /> AMBIENTE: {user.tenants?.business_name || 'GLOBAL'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">REGISTRADO EM</span>
                                    <span className="text-[10px] font-display font-bold text-white/60 italic uppercase tracking-tighter">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="group-hover:text-primary transition-colors h-12 w-12 rounded-none border border-white/5">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white rounded-none w-56">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest p-4 text-white/40 italic font-display">AÇÕES</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/5" />

                                        <DropdownMenuItem
                                            className="p-4 flex items-center gap-3 cursor-pointer group focus:bg-primary/10"
                                            onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}
                                        >
                                            <Pencil size={16} className="text-primary" />
                                            <span className="text-[10px] font-black italic uppercase tracking-widest">EDITAR</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="p-4 flex items-center gap-3 cursor-pointer group focus:bg-primary/10"
                                            onClick={() => { setSelectedUser(user); setResetPasswordDialogOpen(true); }}
                                        >
                                            <Key size={16} className="text-primary" />
                                            <span className="text-[10px] font-black italic uppercase tracking-widest">RESETAR SENHA</span>
                                        </DropdownMenuItem>

                                        {user.role === 'client' && (
                                            <DropdownMenuItem
                                                className="p-4 flex items-center gap-3 cursor-pointer group focus:bg-emerald-500/10"
                                                onClick={() => { setSelectedUser(user); setExtendPlanDialogOpen(true); }}
                                            >
                                                <CalendarPlus size={16} className="text-emerald-500" />
                                                <span className="text-[10px] font-black italic uppercase tracking-widest text-emerald-500">ESTENDER PLANO</span>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-white/5" />

                                        {/* Hide delete button for admin master */}
                                        {user.email !== 'master.admin@acesso.apexpro.fit' && (
                                            <DropdownMenuItem
                                                className="p-4 flex items-center gap-3 cursor-pointer group text-red-500 focus:bg-red-500/10"
                                                onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                                            >
                                                <Trash2 size={16} />
                                                <span className="text-[10px] font-black italic uppercase tracking-widest">DELETAR</span>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Dialogs */}
            <CreateUserDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchUsers}
            />

            <EditUserDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={fetchUsers}
                user={selectedUser}
            />

            <ResetPasswordDialog
                open={resetPasswordDialogOpen}
                onOpenChange={setResetPasswordDialogOpen}
                userId={selectedUser?.id || null}
                userName={selectedUser?.full_name || ""}
            />

            <ExtendPlanDialog
                open={extendPlanDialogOpen}
                onOpenChange={setExtendPlanDialogOpen}
                onSuccess={fetchUsers}
                userId={selectedUser?.id || null}
                userName={selectedUser?.full_name || ""}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0A0A0B] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight text-red-500">
                            <AlertTriangle size={24} />
                            CONFIRMAR EXCLUSÃO
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            Esta ação não pode ser desfeita. O usuário <strong className="text-white">{selectedUser?.full_name}</strong> será permanentemente removido do sistema, incluindo todos os dados associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-none">CANCELAR</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-none"
                        >
                            {deleting ? "DELETANDO..." : "DELETAR PERMANENTEMENTE"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UsersListAdmin;
