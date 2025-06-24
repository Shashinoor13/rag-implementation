# RAG Frontend

A modern React-based frontend application for a Retrieval-Augmented Generation (RAG) system. This application provides an intuitive interface for users to upload documents, chat with an AI assistant that can reference uploaded documents, and manage their document collection.

##  Features

### Authentication
- **User Registration & Login**: Secure authentication system with JWT tokens
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Management**: Persistent login sessions with automatic token handling

### Document Management
- **File Upload**: Drag-and-drop or click-to-browse file upload interface
- **Supported Formats**: Currently supports `.txt` files (up to 10MB)
- **Upload Progress**: Real-time progress tracking for file uploads
- **Document Status**: View processing status of uploaded documents (completed, processing, failed)
- **Document List**: Browse and manage all uploaded documents

### AI Chat Interface
- **Conversational AI**: Chat with an AI assistant that can reference your uploaded documents
- **Real-time Responses**: Stream responses from the AI with typing indicators
- **Chat History**: Persistent chat sessions with message history
- **Rich Message Display**: Structured display of AI responses with executive summaries and supporting facts
- **Source References**: View which documents the AI referenced in its responses

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Built-in dark/light theme support
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Updates**: Live status updates and notifications

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API
- **Linting**: ESLint with TypeScript support

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend RAG API running (see backend documentation)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── actions/           # API action handlers
│   ├── auth.ts       # Authentication actions
│   ├── chat.ts       # Chat-related actions
│   └── documents.ts  # Document management actions
├── components/       # Reusable UI components
│   ├── chat_section.tsx
│   ├── input_box.tsx
│   ├── message_tile.tsx
│   ├── messages_list.tsx
│   ├── sidebar.tsx
│   └── ...
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── protected/   # Authenticated pages
│   │   ├── documents_screen.tsx
│   │   ├── home_screen.tsx
│   │   └── layout.tsx
│   └── public/      # Public pages
│       ├── login_screen.tsx
│       └── register_screen.tsx
├── utils/           # Utility functions
│   └── protected.tsx
├── api.ts           # API configuration
└── App.tsx          # Main application component
```
