import React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FeatureExplainerProps {
    title: string;
    description: string;
    tip?: string;
    className?: string;
    icon?: "help" | "info";
}

export function FeatureExplainer({
    title,
    description,
    tip,
    className,
    icon = "help",
}: FeatureExplainerProps) {
    const Icon = icon === "help" ? HelpCircle : Info;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "p-1 rounded-full hover:bg-white/5 transition-colors text-white/30 hover:text-primary active:scale-95",
                        className
                    )}
                >
                    <Icon size={14} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="start"
                className="w-80 bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 p-5 shadow-2xl z-[100]"
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Icon size={14} className="text-primary" />
                        </div>
                        <h4 className="text-[11px] font-display font-black italic uppercase tracking-widest text-white">
                            {title}
                        </h4>
                    </div>

                    <p className="text-[11px] leading-relaxed text-white/60 font-medium">
                        {description}
                    </p>

                    {tip && (
                        <div className="pt-3 mt-3 border-t border-white/5">
                            <div className="flex gap-2">
                                <span className="text-[9px] font-black text-primary uppercase italic tracking-tighter shrink-0 pt-0.5">DICA:</span>
                                <p className="text-[10px] text-white/40 italic leading-snug">
                                    {tip}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
