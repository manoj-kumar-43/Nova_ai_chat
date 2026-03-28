import { useState, useCallback } from "react";
import type { Message, Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const generateId = () => crypto.randomUUID();

const createConversation = (): Conversation => ({
  id: generateId(),
  title: "New Chat",
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const initial = createConversation();
    return [initial];
  });
  const [activeId, setActiveId] = useState<string | null>(() => conversations[0]?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeId || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, userMsg],
                title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
                updatedAt: new Date(),
              }
            : c
        )
      );

      setIsLoading(true);

      try {
        // Build messages for API
        const currentConv = conversations.find((c) => c.id === activeId);
        const apiMessages = [
          ...(currentConv?.messages.map((m) => ({ role: m.role, content: m.content })) ?? []),
          { role: "user" as const, content },
        ];

        // Use fetch directly for streaming support
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => null);
          const errorMsg = errorData?.error || `Request failed (${resp.status})`;
          toast.error(errorMsg);
          setIsLoading(false);
          return;
        }

        if (!resp.body) {
          toast.error("No response received from AI");
          setIsLoading(false);
          return;
        }

        // Stream SSE tokens
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantContent = "";
        const assistantId = generateId();

        // Add empty assistant message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { id: assistantId, role: "assistant" as const, content: "", timestamp: new Date() },
                  ],
                  updatedAt: new Date(),
                }
              : c
          )
        );

        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                const captured = assistantContent;
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId ? { ...m, content: captured } : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        toast.error("Failed to get AI response. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeId, isLoading, conversations]
  );

  const newConversation = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const newConv = createConversation();
          filtered.push(newConv);
        }
        if (activeId === id) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeId]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    sendMessage,
    setActiveId,
    newConversation,
    deleteConversation,
  };
};
