import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar as CalendarIcon, BarChart2, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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

      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={20} />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
