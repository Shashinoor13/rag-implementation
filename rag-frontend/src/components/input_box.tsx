import { Send } from "lucide-react";
import type { Ref } from "react";

interface InputBoxProps {
  textareaRef: Ref<HTMLTextAreaElement>;
  newMessage: string;
  setNewMessage: (value: string) => void;
  adjustTextareaHeight: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
}

export default function InputBox({
  textareaRef,
  newMessage,
  setNewMessage,
  adjustTextareaHeight,
  handleKeyPress,
  handleSendMessage,
  isTyping,
}: InputBoxProps) {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 lg:py-4 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 lg:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your knowledge base..."
              className="w-full resize-none border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 lg:px-4 lg:py-3 pr-10 lg:pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent max-h-32 min-h-[40px] lg:min-h-[48px] text-sm lg:text-base"
              rows={1}
              maxLength={2000}
            />
            <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 text-xs text-gray-400 dark:text-gray-500">
              {newMessage.length}/2000
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-blue-600 text-white rounded-xl p-2 lg:p-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            title="Send message"
          >
            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send
            {typeof window !== "undefined" && window.innerWidth >= 640
              ? ", Shift+Enter for new line"
              : ""}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Powered by RAG
          </p>
        </div>
      </div>
    </footer>
  );
}
