
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface WhatsAppSupportProps {
    phoneNumber?: string; // Format: 5511999999999
    message?: string;
}

export const WhatsAppSupport = ({
    phoneNumber = "5511999999999", // Placeholder default, should be configurable
    message = "Olá! Preciso de ajuda com a plataforma APEX PRO."
}: WhatsAppSupportProps) => {
    const { profile } = useAuth();

    // If not logged in or no profile, maybe don't show? Or show generic.
    if (!profile) return null;

    const handleSupportClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleSupportClick}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95 group animate-in fade-in slide-in-from-bottom-10 duration-700 delay-1000"
            title="Suporte via WhatsApp"
        >
            <MessageCircle size={28} className="fill-white stroke-none" />

            {/* Tooltip-ish text on hover */}
            <span className="absolute right-full mr-4 bg-[#0A0A0B] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase italic whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-2 group-hover:translate-x-0">
                Suporte <span className="text-[#25D366]">WhatsApp</span>
            </span>

            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
        </button>
    );
};
