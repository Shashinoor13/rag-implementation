import { useState, useRef, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import MessageList from "./messages_list";
import InputBox from "./input_box";
import ChatHeader from "./chat_header";
import { chatActions } from '../actions';
import { v4 as uuidv4 } from 'uuid';

interface QueryMessage {
  id: string;
  text: any; // can be string or object
  type: string;
  created_at: string;
  revalidations?: Revalidation[];
}

interface Revalidation {
  id: string;
  version: number;
  regenerated_response: string;
  regenerated_at: string;
}

function mapApiMessage(msg: any) {
  if (msg.type === 'query') {
    return {
      id: msg.id,
      text: typeof msg.text === 'object' && msg.text.query ? msg.text.query : String(msg.text),
      sender: 'user',
      timestamp: msg.created_at,
      revalidations: msg.revalidations,
    };
  } else {
    const textObj = typeof msg.text === 'object' ? msg.text : {};
    return {
      id: msg.id,
      text: textObj.answer || String(msg.text),
      sender: 'ai',
      timestamp: msg.created_at,
      answer: textObj.answer,
      executiveSummary: textObj.executiveSummary,
      supportingFacts: textObj.supportingFacts,
      sources: textObj.sources,
      revalidations: msg.revalidations,
    };
  }
}

const ChatMainArea = () => {
  const outletContext = useOutletContext<{ onOpenSidebar?: () => void }>();
  const onOpenSidebar = outletContext.onOpenSidebar;
  const { id: chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!chatId) return;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('new') === 'true') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    chatActions.getChatMessages(chatId)
      .then((response) => {
        setMessages(response.data.queries.map(mapApiMessage));
      })
      .catch(() => {
        setError('Failed to load chat history.');
      })
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  // Send message to /query
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;
    setIsTyping(true);
    setError("");
    const userMsg = {
      id: `${Date.now()}-user`,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [
      ...prev,
      mapApiMessage({ id: userMsg.id, text: newMessage, type: 'query', created_at: userMsg.timestamp })
    ]);
    setNewMessage("");
    try {

      const currentChatId = chatId || uuidv4();
      const response = await chatActions.sendQuery({ query: newMessage, chat_id: currentChatId });
      let aiMsgRaw = response.data;
      if (Array.isArray(aiMsgRaw)) {
        aiMsgRaw.forEach((msg: any) => {
          setMessages((prev) => [
            ...prev,
            mapApiMessage(msg)
          ]);
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('new');
        window.history.pushState({}, '', `${window.location.pathname}?${searchParams}`);
        });
      } else {
        setMessages((prev) => [
          ...prev,
          mapApiMessage(aiMsgRaw)
        ]);
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to get response.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      <ChatHeader onOpenSidebar={onOpenSidebar} />
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">Loading chat...</div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
      ) : (
        <MessageList
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      )}
      <InputBox
        textareaRef={textareaRef}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        adjustTextareaHeight={adjustTextareaHeight}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </main>
  );
};

export default ChatMainArea;
