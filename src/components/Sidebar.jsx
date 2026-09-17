import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar as CalendarIcon, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = () => {
  const { signOut } = useAppContext();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-accent">Personal</span>GYM
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Alunos</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CalendarIcon size={20} />
          <span>Agenda</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={signOut}>
          <LogOut size={20} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
