import MessageTile from "./message_tile";
import {
    Bot,
  } from "lucide-react";
  import type { Ref } from "react";
  
  interface Revalidation {
    id: string;
    version: number;
    regenerated_response: string;
    regenerated_at: string;
  }
  
  interface Message {
    id: string;
    text: string;
    sender: "user" | "ai" | string;
    timestamp: string;
    revalidations?: Revalidation[];
    executiveSummary?: string[];
    supportingFacts?: string[];
    answer?: string;
  }
  
  interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
    messagesEndRef: Ref<HTMLDivElement> | undefined;
  }
  
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const regenerateResponse = (messageId: string) => {
    console.log("Regenerating response for message:", messageId);
  };
  
  export default function MessageList({
    messages,
    isTyping,
    messagesEndRef,
  }: MessageListProps) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {messages.map((message) => (
          <MessageTile
            key={message.id}
            id={message.id}
            sender={message.sender}
            timestamp={message.timestamp}
            executiveSummary={message.executiveSummary}
            supportingFacts={message.supportingFacts}
            answer={message.answer}
            text={message.text}
            revalidations={message.revalidations}
          />
        ))}
  
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
  
        <div ref={messagesEndRef} />
      </div>
    );
  }
  