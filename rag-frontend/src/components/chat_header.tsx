import { Menu, Bot } from "lucide-react";

interface ChatHeaderProps {
  onOpenSidebar?: () => void;
}

export default function ChatHeader({ onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:py-4 shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Assistant Avatar */}
          <div className="w-9 h-9 lg:w-10 lg:h-10  rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-white">
              RAG Assistant
            </h2>
          </div>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
