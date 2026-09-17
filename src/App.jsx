import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Calendar from './pages/Calendar';
import StudentProfile from './pages/StudentProfile';
import PresentationMode from './pages/PresentationMode';
import Login from './pages/Login';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const { session, authLoading } = useAppContext();

  if (authLoading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando sistema...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/presentation/:id" element={<PresentationMode />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)' } }} />
      <AppContent />
    </AppProvider>
  )
}

export default App;
