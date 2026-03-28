import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types/chat";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete }: ChatSidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-3">
        <Button
          onClick={onNew}
          variant="outline"
          className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent text-sidebar-foreground"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              activeId === conv.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
            <span className="flex-1 truncate">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">AI Chat App</p>
      </div>
    </div>
  );
};

export default ChatSidebar;
