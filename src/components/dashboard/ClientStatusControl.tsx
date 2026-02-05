import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
import { CheckCircle, XCircle, Ban, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientStatus = 'active' | 'suspended' | 'cancelled';

interface ClientStatusControlProps {
    clientId: string;
    currentStatus: ClientStatus;
    clientName: string;
}

const statusConfig: Record<ClientStatus, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
    active: {
        label: "Ativo",
        icon: CheckCircle,
        color: "text-green-400",
        bg: "bg-green-400/10"
    },
    suspended: {
        label: "Suspenso",
        icon: Ban,
        color: "text-amber-400",
        bg: "bg-amber-400/10"
    },
    cancelled: {
        label: "Cancelado",
        icon: XCircle,
        color: "text-red-400",
        bg: "bg-red-400/10"
    }
};

export function ClientStatusControl({ clientId, currentStatus, clientName }: ClientStatusControlProps) {
    const queryClient = useQueryClient();
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; newStatus: ClientStatus | null }>({
        open: false,
        newStatus: null
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: ClientStatus) => {
            const { data, error } = await supabase
                .from('clients')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', clientId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });

            const status = statusConfig[data.status as ClientStatus];
            toast.success(`Status alterado para ${status.label}`, {
                description: data.status === 'suspended'
                    ? `${clientName} não poderá acessar o app até ser reativado.`
                    : data.status === 'cancelled'
                        ? `${clientName} foi removido do sistema.`
                        : `${clientName} agora tem acesso total ao app.`
            });
        },
        onError: (error) => {
            console.error('Error updating status:', error);
            toast.error("Erro ao alterar status");
        }
    });

    const handleStatusChange = (newStatus: ClientStatus) => {
        if (newStatus === currentStatus) return;

        // Require confirmation for suspend/cancel
        if (newStatus === 'suspended' || newStatus === 'cancelled') {
            setConfirmDialog({ open: true, newStatus });
        } else {
            updateStatusMutation.mutate(newStatus);
        }
    };

    const confirmStatusChange = () => {
        if (confirmDialog.newStatus) {
            updateStatusMutation.mutate(confirmDialog.newStatus);
        }
        setConfirmDialog({ open: false, newStatus: null });
    };

    const config = statusConfig[currentStatus];
    const StatusIcon = config.icon;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                            config.bg,
                            config.color,
                            "border-current/20 hover:border-current/40"
                        )}
                        disabled={updateStatusMutation.isPending}
                    >
                        {updateStatusMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <StatusIcon size={16} />
                        )}
                        <span className="font-display font-bold uppercase text-xs tracking-wider">
                            {config.label}
                        </span>
                        <ChevronDown size={14} className="opacity-60" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-surface border-white/10 min-w-[160px]">
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('active')}
                        className={cn(
                            "gap-2 cursor-pointer",
                            currentStatus === 'active' && "bg-green-400/10"
                        )}
                    >
                        <CheckCircle size={16} className="text-green-400" />
                        <span>Ativo</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('suspended')}
                        className={cn(
                            "gap-2 cursor-pointer",
                            currentStatus === 'suspended' && "bg-amber-400/10"
                        )}
                    >
                        <Ban size={16} className="text-amber-400" />
                        <span>Suspenso</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleStatusChange('cancelled')}
                        className={cn(
                            "gap-2 cursor-pointer",
                            currentStatus === 'cancelled' && "bg-red-400/10"
                        )}
                    >
                        <XCircle size={16} className="text-red-400" />
                        <span>Cancelado</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, newStatus: null })}>
                <AlertDialogContent className="bg-surface border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-black italic uppercase text-xl">
                            {confirmDialog.newStatus === 'suspended' ? 'Suspender Aluno?' : 'Cancelar Aluno?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            {confirmDialog.newStatus === 'suspended' ? (
                                <>
                                    <strong className="text-amber-400">{clientName}</strong> não poderá acessar o app enquanto estiver suspenso.
                                    Você pode reativar a qualquer momento.
                                </>
                            ) : (
                                <>
                                    <strong className="text-red-400">{clientName}</strong> perderá acesso permanentemente.
                                    Os dados serão mantidos para histórico.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 hover:bg-white/5">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            className={cn(
                                confirmDialog.newStatus === 'suspended'
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-red-600 hover:bg-red-700"
                            )}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
