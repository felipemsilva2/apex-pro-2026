import { useState } from "react";
import { useClientDocuments, useDeleteClientDocument } from "@/hooks/useCoachData";
import { Client } from "@/lib/supabase";
import { FileText, Trash2, Download, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

type DocumentsTabProps = {
    client: Client;
};

export function DocumentsTab({ client }: DocumentsTabProps) {
    const { data: documents = [], isLoading, error } = useClientDocuments(client.id);
    const deleteMutation = useDeleteClientDocument();
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

    const handleDelete = () => {
        if (!documentToDelete) return;
        deleteMutation.mutate(documentToDelete, {
            onSuccess: () => setDocumentToDelete(null)
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-white/40">Carregando arquivos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <FileText className="w-12 h-12 text-red-500/20" />
                <p className="text-white/60 font-display italic uppercase">Erro ao carregar documentos</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        if (type === 'pdf') return <FileText className="text-red-400" size={24} />;
        if (type === 'image') return <ImageIcon className="text-blue-400" size={24} />;
        return <File className="text-white/40" size={24} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-black italic uppercase text-white">
                        Arquivos & Exames
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {documents.length} documento{documents.length !== 1 ? 's' : ''} compartilhado{documents.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="athletic-card flex flex-col items-center justify-center py-16">
                    <FileText className="w-16 h-16 text-white/5 mb-4" />
                    <p className="text-white/40 font-display italic uppercase tracking-wider mb-2">Nenhum arquivo encontrado</p>
                    <p className="text-xs text-white/30 text-center max-w-sm">
                        Os exames e documentos enviados pelo atleta através do aplicativo aparecerão aqui.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc: any) => (
                        <div
                            key={doc.id}
                            className="bg-white/5 border border-white/5 hover:border-primary/30 transition-all p-4 group relative flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-12 h-full bg-primary/0 group-hover:bg-primary/5 -skew-x-[30deg] translate-x-6 transition-colors" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="p-3 bg-black/40 rounded border border-white/10">
                                    {getIcon(doc.file_type)}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/40 hover:text-primary hover:bg-primary/10"
                                        onClick={() => window.open(doc.file_url, '_blank')}
                                        title="Baixar / Visualizar"
                                    >
                                        <Download size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white/40 hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDocumentToDelete(doc.id)}
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10">
                                <p className="font-bold text-white uppercase text-sm truncate" title={doc.title}>
                                    {doc.title}
                                </p>
                                <div className="flex items-center justify-between mt-2 text-[10px] text-white/40 uppercase tracking-wider">
                                    <span>{doc.category || 'Geral'}</span>
                                    <span>{format(new Date(doc.created_at), "dd/MM/yyyy")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
                <AlertDialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-black italic uppercase text-xl">
                            Excluir Documento?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            Esta ação não pode ser desfeita. O arquivo será removido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none border-white/10 text-white hover:bg-white/5 hover:text-white uppercase font-bold text-xs">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-none bg-destructive text-white hover:bg-destructive/80 uppercase font-bold text-xs"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
