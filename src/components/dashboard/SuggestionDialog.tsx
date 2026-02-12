import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Lightbulb, Send, Loader2 } from "lucide-react";

interface SuggestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SuggestionDialog = ({ open, onOpenChange }: SuggestionDialogProps) => {
    const { profile } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error("Por favor, preencha o título e a descrição.");
            return;
        }

        setIsSubmitting(true);

        try {
            // The live Google Apps Script Web App URL provided by the user
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCdXdbAeDl008Hv1GJRsedNLiJZDoORy81MVxVNdjE3_CDWBTTQ0xfFYzgQhyusvUs/exec";

            const data = {
                date: new Date().toLocaleString('pt-BR'),
                coach: profile?.full_name || 'Visitante/Landing',
                email: profile?.email || 'N/A',
                title: title,
                description: description,
            };

            // If URL is not set, we'll simulate success for now and show instructions
            if (GOOGLE_SCRIPT_URL === "REPLACE_WITH_YOUR_APPS_SCRIPT_URL") {
                console.warn("Google Script URL not configured. Simulating submission.");
                await new Promise(resolve => setTimeout(resolve, 1500));
                toast.success("Sugestão recebida! (Modo Simulação)");
                onOpenChange(false);
                setTitle('');
                setDescription('');
                return;
            }

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Common for Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            toast.success("Sugestão enviada com sucesso! Obrigado por co-criar o Apex Pro.");
            onOpenChange(false);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error("Erro ao enviar sugestão:", error);
            toast.error("Ocorreu um erro ao enviar sua sugestão. Tente novamente mais tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border border-white/10 p-0 overflow-hidden rounded-none">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <DialogHeader className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-sm -skew-x-12 ring-1 ring-primary/20">
                                    <Lightbulb size={20} className="text-primary" />
                                </div>
                                <DialogTitle className="font-display font-black italic uppercase text-2xl tracking-tighter text-white">
                                    A VOZ DO <span className="text-primary">TREINADOR</span>
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-zinc-400 text-xs uppercase tracking-widest font-bold leading-relaxed">
                                Tem uma ideia? Viu algo em um app estrangeiro?
                                Compartilhe conosco e ajude a esculpir o futuro do Apex Pro.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">O que você imaginou? (Título)</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Novo gráfico de evolução de massa magra"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-white rounded-none h-12 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Conte os detalhes</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Explique como essa funcionalidade ajudaria sua consultoria..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-white rounded-none min-h-[150px] text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-white/[0.02] border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/40 hover:text-white hover:bg-white/5 font-display font-bold uppercase tracking-widest text-[10px] h-12 px-6 rounded-none"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary text-black hover:bg-primary/90 font-display font-black italic uppercase tracking-widest text-[11px] h-12 px-8 rounded-none -skew-x-12 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Enviar Sugestão
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SuggestionDialog;
