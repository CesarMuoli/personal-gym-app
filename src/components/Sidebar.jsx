import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar as CalendarIcon, LogOut, DollarSign, Dumbbell, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = () => {
  const { signOut } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div 
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} 
        onClick={closeMobile}
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Dumbbell size={28} className="logo-icon" />
          <div className="logo-text">Personal<span style={{ color: 'var(--accent-color)' }}>GYM</span></div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/students" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} className="nav-icon" />
            <span>Alunos</span>
          </NavLink>
          <NavLink to="/calendar" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CalendarIcon size={20} className="nav-icon" />
            <span>Agenda</span>
          </NavLink>
          <NavLink to="/finance" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <DollarSign size={20} className="nav-icon" />
            <span>Financeiro</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={signOut}>
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
