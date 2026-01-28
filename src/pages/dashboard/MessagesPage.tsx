import { useState } from "react";
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockClients, mockMessages } from "@/data/mockData";

const MessagesPage = () => {
  const [selectedClient, setSelectedClient] = useState(mockClients[0]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = mockClients.slice(0, 5).map(client => ({
    ...client,
    lastMessage: mockMessages.find(m => m.clientId === client.id)?.message || "Nenhuma mensagem",
    lastTime: mockMessages.find(m => m.clientId === client.id)?.time || "",
    unread: mockMessages.find(m => m.clientId === client.id)?.unread || false,
  }));

  const chatMessages = [
    { id: "1", sender: "client", text: "Bom dia, Dra.! Posso substituir o frango por peixe hoje?", time: "08:45" },
    { id: "2", sender: "nutri", text: "Bom dia! Claro, pode sim. Pode usar salmão ou tilápia na mesma quantidade 👍", time: "09:15" },
    { id: "3", sender: "client", text: "Perfeito! E sobre a quantidade de carboidrato no jantar, posso aumentar um pouco?", time: "09:20" },
    { id: "4", sender: "nutri", text: "Pode aumentar em até 50g de batata doce se for treinar à noite. Se não treinar, melhor manter a quantidade atual.", time: "09:25" },
    { id: "5", sender: "client", text: "Entendi! Vou treinar sim. Obrigada pela ajuda! 🙏", time: "09:30" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mensagens</h1>
        <p className="text-muted-foreground mt-1">
          Central de comunicação com seus clientes
        </p>
      </div>

      <div className="dashboard-card p-0 overflow-hidden">
        <div className="grid lg:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Buscar conversas..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(600px-73px)]">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border",
                    selectedClient?.id === conv.id ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedClient(conv)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {conv.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-sm truncate",
                        conv.unread ? "font-semibold" : "font-medium"
                      )}>
                        {conv.name}
                      </p>
                      <span className="text-xs text-muted-foreground">{conv.lastTime}</span>
                    </div>
                    <p className={cn(
                      "text-xs truncate",
                      conv.unread ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedClient?.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedClient?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient?.objective}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={18} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === "nutri" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[70%] p-3 rounded-2xl",
                    msg.sender === "nutri" 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-card border border-border rounded-bl-sm"
                  )}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender === "nutri" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip size={18} />
                </Button>
                <Textarea
                  placeholder="Digite sua mensagem..."
                  className="min-h-[44px] max-h-[120px] resize-none"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={1}
                />
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Smile size={18} />
                </Button>
                <Button className="btn-dashboard shrink-0">
                  <Send size={18} />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                  Como está a adesão?
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                  Lembre-se de beber água!
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                  Bom treino! 💪
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
