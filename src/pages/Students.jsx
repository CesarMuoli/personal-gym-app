import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { mockStudents } from '../data/mockData';
import { Search, Filter, MoreVertical, Activity } from 'lucide-react';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = mockStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="students-page">
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Alunos</h1>
          <p className="subtitle">Gerencie seus alunos e acompanhe os planos.</p>
        </div>
        <button className="primary-button">Novo Aluno</button>
      </header>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="icon-btn-square"><Filter size={18} /> Filtrar</button>
      </div>

      <div className="students-grid">
        {filteredStudents.map(student => (
          <Card key={student.id} className="student-card">
            <div className="student-card-header flex-between">
              <div className="student-avatar-wrapper">
                <img src={student.avatar} alt={student.name} className="student-avatar" />
                <span className={`status-indicator ${student.active ? 'active' : 'inactive'}`}></span>
              </div>
              <button className="icon-btn-transparent"><MoreVertical size={18} /></button>
            </div>
            
            <div className="student-card-body">
              <h3 className="student-name">{student.name}</h3>
              <p className="student-plan">{student.plan}</p>
              
              <div className="student-stats">
                <div className="stat">
                  <span className="stat-label">Frequência</span>
                  <span className="stat-value">{student.frequency}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Última Aula</span>
                  <span className="stat-value">{new Date(student.lastClass).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="student-card-footer">
              <div className="emotional-quick-view">
                <Activity size={16} color="var(--accent-color)" />
                <span>Humor: {student.emotionalScore}/15</span>
              </div>
              <button 
                className="secondary-button"
                onClick={() => navigate(`/student/${student.id}`)}
              >
                Ver Perfil
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Students;
