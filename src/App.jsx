import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Calendar from './pages/Calendar';
import StudentProfile from './pages/StudentProfile';
import PresentationMode from './pages/PresentationMode';
import Finance from './pages/Finance';
import Login from './pages/Login';
import { AppProvider, useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { Dumbbell, ShieldCheck } from 'lucide-react';

const AppContent = () => {
  const { session, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="splash-screen fade-in-up">
        <div className="splash-card glass-panel">
          <Dumbbell size={56} className="splash-logo-icon" />
          <h1 className="logo-text" style={{ fontSize: '2rem', marginTop: '1rem' }}>
            Personal<span style={{ color: 'var(--accent-color)' }}>GYM</span>
          </h1>
          <div className="splash-loader-bar">
            <div className="splash-loader-fill"></div>
          </div>
          <div className="splash-status-badge">
            <ShieldCheck size={16} color="var(--accent-color)" />
            <span>Iniciando ambiente seguro...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/finance" element={<Finance />} />
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
