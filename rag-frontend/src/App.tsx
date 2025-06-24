import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Login } from './pages/public/login_screen';
import { DocumentManager } from './pages/protected/documents_screen';
import { Register } from './pages/public/register_screen';
import ProtectedRoute from './utils/protected';
import ProtectedLayout from './pages/protected/layout';
import ChatMainArea from './components/chat_section';
import Placeholder from './components/placeholder';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Placeholder />} />
          <Route path="chats/:id" element={<ChatMainArea />} />
          <Route path="documents" element={<DocumentManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
