import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Dumbbell } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { signIn } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha.');
      return;
    }
    
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
    } else {
      toast.success('Acesso liberado!');
    }
  };

  return (
    <div className="login-container fade-in-up">
      <div className="login-card glass-panel">
        <div className="login-header">
          <Dumbbell size={48} className="logo-icon" />
          <h1 className="logo-text" style={{ fontSize: '2rem', marginTop: '1rem' }}>PersonalGYM</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Acesso Restrito ao Profissional</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail Corporativo</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Senha de Acesso</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="primary-button login-btn" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
