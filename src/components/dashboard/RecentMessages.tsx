import { MessageCircle, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/data/mockData";

interface RecentMessagesProps {
  messages: Message[];
}

const RecentMessages = ({ messages }: RecentMessagesProps) => {
  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Mensagens Recentes</h3>
          <p className="text-sm text-muted-foreground">
            {messages.filter(m => m.unread).length} não lidas
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          Ver Todas
        </Button>
      </div>

      <div className="space-y-3">
        {messages.slice(0, 4).map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
              message.unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {message.clientAvatar}
                </AvatarFallback>
              </Avatar>
              {message.unread && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-sm truncate",
                  message.unread ? "font-semibold text-foreground" : "font-medium text-foreground"
                )}>
                  {message.clientName}
                </p>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {message.time}
                </span>
              </div>
              <p className={cn(
                "text-sm mt-0.5 truncate",
                message.unread ? "text-foreground" : "text-muted-foreground"
              )}>
                {message.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Nenhuma mensagem recente</p>
        </div>
      )}
    </div>
  );
};

export default RecentMessages;
