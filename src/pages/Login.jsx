import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Dumbbell, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { signIn, signUp } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error('As senhas digitadas não coincidem.');
      return;
    }
    
    setLoading(true);

    if (isSignUp) {
      // Cadastro de Novo Profissional (Multi-Tenant)
      const { data, error } = await signUp(email, password);
      setLoading(false);

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message || 'Erro ao criar conta de profissional.');
      } else {
        if (data?.session) {
          toast.success('Conta criada com sucesso! Acesso concedido.');
        } else {
          toast.success('Conta criada! Se necessário, confirme o link no seu e-mail.');
          setIsSignUp(false);
        }
      }
    } else {
      // Login Existente
      const { error } = await signIn(email, password);
      setLoading(false);
      
      if (error) {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        toast.success('Acesso liberado!');
      }
    }
  };

  return (
    <div className="login-container fade-in-up">
      <div className="login-card glass-panel">
        <div className="login-header">
          <Dumbbell size={48} className="logo-icon" />
          <h1 className="logo-text" style={{ fontSize: '2rem', marginTop: '1rem' }}>Personal<span style={{ color: 'var(--accent-color)' }}>GYM</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--accent-color)" />
            {isSignUp ? 'Cadastro de Novo Profissional' : 'Acesso Restrito ao Profissional'}
          </p>
        </div>

        {/* Alternador de Modo (Login vs Cadastro) */}
        <div className="auth-mode-toggle">
          <button 
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            <LogIn size={16} /> Entrar
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            <UserPlus size={16} /> Criar Conta
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail Profissional</label>
            <input 
              type="email" 
              required
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
              required
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignUp && (
            <div className="form-group fade-in-up">
              <label>Confirmar Senha</label>
              <input 
                type="password" 
                required
                className="form-input" 
                placeholder="Repita sua senha" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          
          <button type="submit" className="primary-button login-btn" disabled={loading}>
            {loading 
              ? (isSignUp ? 'Criando Conta...' : 'Autenticando...') 
              : (isSignUp ? 'Cadastrar e Iniciar' : 'Entrar no Sistema')}
          </button>
        </form>

        <div className="login-footer-info">
          <p>
            {isSignUp ? (
              <>Já tem uma conta? <button type="button" className="text-link" onClick={() => setIsSignUp(false)}>Fazer login</button></>
            ) : (
              <>É um novo personal? <button type="button" className="text-link" onClick={() => setIsSignUp(true)}>Criar minha conta</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
