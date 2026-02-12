import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachClients, useClientMessages } from "@/hooks/useCoachData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase, type Client } from "@/lib/supabase";
import { toast } from "sonner";

const MessagesPage = () => {
  const { profile } = useAuth();
  const { data: clients, isLoading: clientsLoading } = useCoachClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages, refetch: refetchMessages } = useClientMessages(selectedClient?.user_id);
  const selectedClientRef = useRef<Client | null>(selectedClient);

  useEffect(() => {
    selectedClientRef.current = selectedClient;
  }, [selectedClient]);

  const [searchParams, setSearchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get('clientId');

  // Auto-select client from URL or first available
  useEffect(() => {
    if (clients && clients.length > 0) {
      if (clientIdFromUrl) {
        const client = clients.find(c => c.user_id === clientIdFromUrl);
        if (client && (!selectedClient || selectedClient.user_id !== clientIdFromUrl)) {
          setSelectedClient(client);
        }
      } else if (!selectedClient) {
        setSelectedClient(clients[0]);
      }
    }
  }, [clients, clientIdFromUrl, selectedClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.tenant_id) return;

    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Only trigger for incoming messages
          if (newMessage.sender_id !== profile.id) {
            // Play notification sound
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
              audio.volume = 0.5;
              audio.play();
            } catch (e) {
              console.log("Audio play blocked");
            }

            // If it's for the currently open chat, refetch
            if (newMessage.sender_id === selectedClientRef.current?.user_id) {
              refetchMessages();
            } else {
              // Show notification for other active chats
              toast("Nova mensagem!", {
                description: "Você recebeu uma nova mensagem de um atleta.",
                action: {
                  label: "Ver",
                  onClick: () => {
                    // This is limited as we'd need more logic to switch client here
                  }
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.tenant_id, refetchMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedClient || !profile) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        tenant_id: profile.tenant_id,
        sender_id: profile.id,
        receiver_id: selectedClient.user_id,
        content: messageText
      });

      if (error) throw error;
      setMessageText("");
      refetchMessages();
    } catch (error: any) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const filteredClients = clients?.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] animate-fade-in pb-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-display font-black italic uppercase leading-tight tracking-tighter">
            CHAT <span className="text-primary text-blur-sm">PRO</span>
          </h1>
          <p className="font-display font-bold uppercase italic text-xs tracking-[0.3em] text-primary/60 mt-2">
            CANAL DIRETO COM O ALUNO
          </p>
        </div>
      </div>

      <div className="athletic-card p-0 overflow-hidden border-t-2 border-t-primary flex-1 min-h-0 mt-6">
        <div className="grid lg:grid-cols-3 h-full bg-black/40">
          {/* Conversations List */}
          <div className="border-r border-white/5 bg-white/[0.02] flex flex-col min-h-0">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                <Input
                  placeholder="FILTRAR ALUNOS..."
                  className="pl-9 bg-black/50 border-white/10 rounded-none font-display font-bold italic text-[10px] tracking-widest focus:border-primary transition-all h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className={cn(
                    "flex items-center gap-4 p-5 cursor-pointer transition-all border-b border-white/5 relative overflow-hidden group",
                    selectedClient?.id === client.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-white/5"
                  )}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12 border border-white/10 -skew-x-12 rounded-none">
                      <AvatarFallback className="bg-primary/20 text-primary font-display font-black italic uppercase rounded-none">
                        {client.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-display font-black italic uppercase tracking-tight text-sm text-white">
                        {client.full_name}
                      </p>
                    </div>
                    <p className="text-[10px] truncate font-bold uppercase tracking-wider text-white/30">
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col bg-black/20 min-h-0">
            {selectedClient ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-primary/20 -skew-x-12 rounded-none">
                      <AvatarFallback className="bg-primary/20 text-primary font-display font-black italic uppercase rounded-none">
                        {selectedClient.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display font-black italic uppercase text-lg text-white leading-none tracking-tight">
                        {selectedClient.full_name}
                      </p>
                      <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mt-2 italic">
                        {selectedClient.status.toUpperCase()} • ONLINE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 relative min-h-0">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

                  {messages?.map(msg => {
                    const isCoach = msg.sender_id === profile?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isCoach ? "justify-end" : "justify-start")}
                      >
                        <div className={cn("flex gap-4 max-w-[80%]", isCoach ? "flex-row-reverse text-right" : "flex-row")}>
                          {!isCoach && (
                            <Avatar className="h-8 w-8 border border-white/10 -skew-x-12 rounded-none shrink-0 mt-auto">
                              <AvatarFallback className="bg-white/5 text-white/40 text-[10px] font-display font-bold uppercase rounded-none">
                                {selectedClient.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn(
                            "p-4 relative",
                            isCoach
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-white/5 border border-white/10"
                          )}>
                            <p className={cn(
                              "text-sm font-medium leading-relaxed italic tracking-tight",
                              isCoach ? "text-primary" : "text-white/90"
                            )}>
                              {msg.content}
                            </p>
                            <p className={cn(
                              "text-[8px] font-black uppercase italic mt-3 tracking-widest",
                              isCoach ? "text-primary/40" : "text-white/20"
                            )}>
                              {new Date(msg.created_at).toLocaleTimeString()} • {isCoach ? "ENVIADO" : "RECEBIDO"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-white/5">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-4 bg-black/40 border border-white/10 p-4">
                    <textarea
                      placeholder="DIGITAR MENSAGEM..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-display font-bold italic placeholder:text-white/10 min-h-[44px] max-h-[120px] resize-none py-2"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="bg-primary text-primary-foreground -skew-x-12 px-6 py-2 font-display font-black italic uppercase text-xs hover:bg-white transition-colors disabled:opacity-50"
                    >
                      ENVIAR
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                <MessageSquare size={48} className="mb-4 text-white/10" />
                <p className="text-sm font-display font-black uppercase italic tracking-widest text-white/40">
                  SELECIONE UM ALUNO
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">
                  PARA INICIAR
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
