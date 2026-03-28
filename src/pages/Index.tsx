import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    sendMessage,
    setActiveId,
    newConversation,
    deleteConversation,
  } = useChat();

  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={isMobile ? { x: -280 } : { width: 0 }}
            animate={isMobile ? { x: 0 } : { width: 280 }}
            exit={isMobile ? { x: -280 } : { width: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`${
              isMobile ? "fixed left-0 top-0 bottom-0 z-50 w-[280px]" : "relative"
            } border-r border-border flex-shrink-0 overflow-hidden`}
          >
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 z-10 p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConversation}
              onNew={() => {
                newConversation();
                if (isMobile) setSidebarOpen(false);
              }}
              onDelete={deleteConversation}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 flex items-center px-4 border-b border-border bg-background flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-foreground truncate">
            {activeConversation?.title ?? "New Chat"}
          </span>
        </header>

        {/* Chat area */}
        <div className="flex-1 min-h-0">
          <ChatWindow
            messages={activeConversation?.messages ?? []}
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
