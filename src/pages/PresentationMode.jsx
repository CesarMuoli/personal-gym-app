import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { mockStudents, mockLoadProgression, mockEmotionalHistory } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Target, Trophy } from 'lucide-react';
import './PresentationMode.css';

const PresentationMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find(s => s.id === parseInt(id)) || mockStudents[0];

  return (
    <div className="presentation-page">
      <header className="presentation-header flex-between">
        <button className="icon-btn-transparent" onClick={() => navigate(`/student/${student.id}`)}>
          <ArrowLeft size={20} /> Voltar ao Perfil
        </button>
        <div className="presentation-title">
          <h1>Evolução de Resultados</h1>
          <p>{student.name}</p>
        </div>
        <div style={{ width: '150px' }}></div>
      </header>

      <div className="presentation-grid">
        <div className="presentation-col">
          <Card className="presentation-card goals-card">
            <h3 className="card-title flex-center" style={{ gap: '0.5rem', marginBottom: '0' }}>
              <Target size={20} color="var(--accent-color)" /> Metas Estabelecidas
            </h3>
            <ul className="goals-list">
              <li className="achieved"><Trophy size={16} /> Reduzir BF para 16% (Atual: {student.bodyFat}%)</li>
              <li className="achieved"><Trophy size={16} /> Aumentar força no Supino (+15kg)</li>
              <li><Target size={16} /> Melhorar constância (Meta: 100% | Atual: {student.frequency}%)</li>
            </ul>
          </Card>

          <Card title="Evolução Física" className="presentation-card">
            <div className="presentation-photos">
              <div className="photo-item">
                <div className="photo-box">Antes</div>
                <span>Início - {student.weight + 5} kg</span>
              </div>
              <div className="photo-item">
                <div className="photo-box success">Depois</div>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Hoje - {student.weight} kg</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="presentation-col">
          <Card title="Evolução de Força (Supino)" className="presentation-card">
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockLoadProgression}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="load" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Bem-estar Percebido (Média: 11.8/15)" className="presentation-card">
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockEmotionalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis domain={[0, 15]} stroke="var(--text-secondary)" hide />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} />
                  <Line type="monotone" dataKey="score" stroke="var(--info)" strokeWidth={4} dot={{ r: 5, fill: 'var(--bg-card)', stroke: 'var(--info)', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default PresentationMode;
