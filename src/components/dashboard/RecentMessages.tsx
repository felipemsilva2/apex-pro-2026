import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/supabase";

interface RecentMessagesProps {
  messages: any[]; // Using any because of the join structure
  isLoading?: boolean;
}

const RecentMessages = ({ messages, isLoading }: RecentMessagesProps) => {
  const navigate = useNavigate();

  return (
    <div className="athletic-card group">
      <div className="kinetic-border" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="stat-label">Inbox Atleta</h3>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary/40" />}
          </div>
          <p className="text-xl font-display font-black italic uppercase tracking-tighter mt-1">
            Comunicação <span className="text-primary">Direta</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border border-white/5 bg-white/5 animate-pulse">
              <div className="h-10 w-10 bg-white/10 rounded-none -skew-x-12" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 w-1/2" />
                <div className="h-2 bg-white/5 w-full" />
              </div>
            </div>
          ))
        ) : (
          messages.slice(0, 4).map((msg, index) => {
            const sender = (msg as any).sender;
            return (
              <div
                key={msg.id}
                onClick={() => navigate(`/dashboard/messages?clientId=${sender?.id || msg.sender_id}`)}
                className={cn(
                  "group flex items-start gap-4 p-4 border border-white/5 bg-white/5 hover:border-primary/40 transition-all duration-300 relative overflow-hidden cursor-pointer",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-12 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <Avatar className="h-10 w-10 border border-white/10 -skew-x-12 rounded-none">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold uppercase rounded-none">
                      {sender?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {!msg.is_read && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary -skew-x-12 shadow-[0_0_10px_rgba(212,255,0,0.5)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-xs text-foreground uppercase italic truncate">
                      {sender?.full_name || "Desconhecido"}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2 shrink-0">
                      {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[10px] mt-1 truncate font-medium",
                    !msg.is_read ? "text-white" : "text-muted-foreground"
                  )}>
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 border border-white/5 bg-white/5 -skew-x-6">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-primary/40" />
          <p className="font-display font-bold italic uppercase text-xs tracking-widest opacity-50">Nenhuma mensagem direta</p>
        </div>
      )}

      <button
        onClick={() => navigate('/dashboard/messages')}
        className="w-full mt-6 py-2 border border-white/10 text-[10px] font-display font-black italic uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        ABRIR MURAL DE MENSAGENS
      </button>
    </div>
  );
};

export default RecentMessages;
