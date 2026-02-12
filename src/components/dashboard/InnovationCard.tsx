import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import SuggestionDialog from './SuggestionDialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface InnovationCardProps {
    collapsed: boolean;
}

const InnovationCard = ({ collapsed }: InnovationCardProps) => {
    const { profile } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSupportClick = () => {
        setIsDialogOpen(true);
    };

    return (
        <>
            <SuggestionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

            {collapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleSupportClick}
                            className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all duration-300 group"
                        >
                            <Lightbulb size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-display font-bold uppercase italic text-[10px] tracking-widest bg-primary text-black border-none">
                        Sugerir Funcionalidade
                    </TooltipContent>
                </Tooltip>
            ) : (
                <div className="mx-4 my-4 p-4 bg-primary/10 border border-primary/20 -skew-x-12 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 cursor-pointer" onClick={handleSupportClick}>
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 blur-xl rounded-full translate-x-4 -translate-y-4" />

                    <div className="flex flex-col gap-2 skew-x-12 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary rounded-sm -skew-x-12">
                                <Lightbulb size={14} className="text-black" />
                            </div>
                            <span className="font-display font-black text-[10px] italic uppercase text-primary tracking-widest">A Voz do Treinador</span>
                        </div>

                        <p className="text-[10px] font-bold text-white/60 leading-tight uppercase italic">
                            Tem uma ideia de nova funcionalidade? Nós construímos.
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                            <span className="text-[8px] font-black uppercase tracking-widest">Sugerir Agora</span>
                            <div className="h-[1px] flex-1 bg-primary/30" />
                        </div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
            )}
        </>
    );
};

export default InnovationCard;
