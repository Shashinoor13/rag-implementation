import { useState } from "react";
import { useParams } from "react-router-dom";
import ChatMainArea from "../../components/chat_section";
import ChatSidebar from "../../components/sidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-50 top-0 left-0 h-full w-80 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar 
          onClose={() => setSidebarOpen(false)} 
          isMobile={true}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 h-full min-w-0 flex items-center justify-center">
          <ChatMainArea/>
      </div>
    </div>
  );
}