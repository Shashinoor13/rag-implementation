import ChatSidebar from "../../components/sidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <Outlet context={{ onOpenSidebar: () => setSidebarOpen(true) }} />
      </div>
    </div>
  );
} 