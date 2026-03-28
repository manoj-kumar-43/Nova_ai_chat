import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import type { Message } from "@/types/chat";

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
}

const suggestions = [
  "Explain quantum computing simply",
  "Write a Python function to sort a list",
  "What are the best practices for React?",
  "Help me brainstorm startup ideas",
];

const ChatWindow = ({ messages, onSend, isLoading }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10"
            >
              <Sparkles className="w-9 h-9 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you?</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything — I can write code, explain concepts, brainstorm ideas, and more.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSend(s)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent text-sm text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;
