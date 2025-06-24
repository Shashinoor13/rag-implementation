import { useState, useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Bot,
  LogOut,
  FileText,
  ChevronDown,
} from "lucide-react";
import { chatActions } from '../actions';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

interface ChatSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

interface ChatHistoryItem {
  id: string;
  title: string;
}

const ChatSidebar = ({ onClose, isMobile }: ChatSidebarProps) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await chatActions.getChatHistory();
        setChatHistory(response.data.chats);
      } catch (err: any) {
        setError('Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Gen AI Brand */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gen AI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Assistant</p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* New Chat Button */}
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <button
          className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors text-sm lg:text-base"
          onClick={() => {
            const newId = uuidv4();
            navigate(`/chats/${newId}?new=true`);
            window.location.reload();
            if (isMobile && onClose) onClose();
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 lg:top-3 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm lg:text-base"
          />
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 lg:p-4">
          <h4 className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Chats</h4>
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : (
            <div className="space-y-1 lg:space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id);
                    if (isMobile && onClose) onClose();
                  }}
                  className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedChat === chat.id
                      ? "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-600"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Link to={`/chats/${chat.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageCircle
                          className={`w-4 h-4 flex-shrink-0 ${
                            selectedChat === chat.id ? "text-blue-600" : "text-gray-400 dark:text-gray-500"
                          }`}
                          />
                        <h5 className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.title}
                        </h5>
                      </div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
              </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Settings at Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{username || 'User'}</h3>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
              <ChevronDown className={`w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => {
                    navigate('/documents');
                    setShowDropdown(false);
                    if (isMobile && onClose) onClose();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
