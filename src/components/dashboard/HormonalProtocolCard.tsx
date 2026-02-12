
import { HormonalProtocol } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Trash2, Calendar, Activity, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteHormonalProtocol } from "@/hooks/useCoachData";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { EditHormonalProtocolDialog } from "./EditHormonalProtocolDialog";

interface HormonalProtocolCardProps {
    protocol: HormonalProtocol;
}

export function HormonalProtocolCard({ protocol }: HormonalProtocolCardProps) {
    const deleteProtocol = useDeleteHormonalProtocol();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProtocol.mutateAsync(protocol.id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    };

    return (
        <>
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-zinc-950/50">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">
                                <Calendar size={10} className="text-primary/60" />
                                <span>INÍCIO: {formatDate(protocol.start_date)}</span>
                            </div>
                            {protocol.end_date && (
                                <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">
                                    <Calendar size={10} className="text-primary/60" />
                                    <span>FIM: {formatDate(protocol.end_date)}</span>
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-lg font-display font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            {protocol.name}
                        </CardTitle>
                        {protocol.description && (
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mt-1">{protocol.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={
                                protocol.status === "active"
                                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-bold uppercase tracking-widest text-[10px]"
                                    : "border-zinc-700 text-zinc-500 font-bold uppercase tracking-widest text-[10px]"
                            }
                        >
                            {protocol.status === "active" ? "ACTIVE" : "FINISHED"}
                        </Badge>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditOpen(true)}
                                className="h-8 w-8 text-zinc-500 hover:text-primary hover:bg-primary/10"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-display font-black italic uppercase text-white">Excluir Protocolo?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-400">
                                            Tem certeza que deseja remover este protocolo? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-white">
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold uppercase tracking-widest text-xs">
                                            {isDeleting ? "Excluindo..." : "Excluir"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center text-xs font-bold text-zinc-500 uppercase tracking-widest gap-2 bg-zinc-950/30 p-2 rounded-sm border border-white/5">
                        <Calendar className="h-3 w-3 text-primary" />
                        Início: <span className="text-zinc-300">{format(new Date(protocol.start_date), "PPP", { locale: ptBR })}</span>
                        {protocol.end_date && (
                            <> • Fim: <span className="text-zinc-300">{format(new Date(protocol.end_date), "PPP", { locale: ptBR })}</span></>
                        )}
                    </div>

                    {protocol.compounds && protocol.compounds.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-1">Compostos do Protocolo</h4>
                            <div className="space-y-2">
                                {protocol.compounds.map((compound) => (
                                    <div key={compound.id} className="grid grid-cols-12 gap-2 bg-zinc-950/50 p-3 rounded-none border border-white/5 text-sm hover:border-primary/20 transition-colors group">
                                        <div className="col-span-12 md:col-span-5 font-bold text-white flex items-center gap-2 italic">
                                            <Pill className="h-3 w-3 text-primary group-hover:text-primary transition-colors" />
                                            {compound.name}
                                        </div>
                                        <div className="col-span-6 md:col-span-3 text-zinc-400">
                                            <span className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider block mb-0.5">Dose</span>
                                            {compound.dosage}
                                        </div>
                                        <div className="col-span-6 md:col-span-4 text-zinc-400">
                                            <span className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider block mb-0.5">Frequência</span>
                                            {compound.frequency}
                                        </div>
                                        {compound.notes && (
                                            <div className="col-span-12 text-xs text-zinc-500 italic border-t border-zinc-900 pt-1 mt-1">
                                                Note: {compound.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">Nenhum composto registrado.</p>
                    )}
                </CardContent>
            </Card>

            <EditHormonalProtocolDialog
                protocol={protocol}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}

