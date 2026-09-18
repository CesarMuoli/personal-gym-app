import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Target, Trophy, Image as ImageIcon } from 'lucide-react';
import './PresentationMode.css';

const PresentationMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, loadProgression, emotionalHistory } = useAppContext();

  const student = students.find(s => String(s.id) === String(id));

  // Filtragem isolada por aluno
  const studentLoads = loadProgression.filter(l => String(l.student_id) === String(student?.id));
  const availableExercises = Array.from(new Set(studentLoads.map(l => l.exercise).filter(Boolean)));
  const defaultExercise = availableExercises.length > 0 ? availableExercises[0] : 'Supino Reto';
  const [selectedExercise, setSelectedExercise] = useState(defaultExercise);

  useEffect(() => {
    if (availableExercises.length > 0 && !availableExercises.includes(selectedExercise)) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [loadProgression]);

  const chartLoads = studentLoads.filter(l => (l.exercise || '').toLowerCase() === selectedExercise.toLowerCase());

  if (!student) {
    return (
      <div className="presentation-page flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>Aluno não encontrado</h2>
        <button className="primary-button" onClick={() => navigate('/students')}>
          <ArrowLeft size={18} /> Voltar para Lista de Alunos
        </button>
      </div>
    );
  }

  const studentEmotions = emotionalHistory
    .filter(e => String(e.student_id) === String(student.id))
    .map(e => ({
      ...e,
      displayDate: e.record_date ? new Date(e.record_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : (e.date || '')
    }));

  // Média de humor
  const averageEmotional = studentEmotions.length > 0 
    ? (studentEmotions.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / studentEmotions.length).toFixed(1)
    : student.emotionalScore || 'N/A';

  const bodyFatVal = student.body_fat ?? student.bodyFat ?? 0;

  return (
    <div className="presentation-page fade-in-up">
      <header className="presentation-header flex-between">
        <button className="back-button" onClick={() => navigate(`/student/${student.id}`)}>
          <ArrowLeft size={18} />
          <span>Voltar ao Perfil</span>
        </button>
        <div className="presentation-title">
          <h1>Evolução de Resultados</h1>
          <p>{student.name} • {student.plan || 'Plano Personalizado'}</p>
        </div>
        <div style={{ width: '150px' }}></div>
      </header>

      <div className="presentation-grid">
        <div className="presentation-col">
          <Card className="presentation-card goals-card">
            <h3 className="card-title flex-center" style={{ gap: '0.5rem', marginBottom: '0' }}>
              <Target size={20} color="var(--accent-color)" /> Metas & Performance
            </h3>
            <ul className="goals-list">
              <li className="achieved">
                <Trophy size={16} /> Percentual de Gordura Atual: {bodyFatVal}%
              </li>
              <li className="achieved">
                <Trophy size={16} /> Peso Corporal Registrado: {student.weight || '--'} kg
              </li>
              <li>
                <Target size={16} /> Frequência Atual: {student.frequency || 0}% de assiduidade
              </li>
            </ul>
          </Card>

          <Card title="Evolução Física (Fotos de Avaliação)" className="presentation-card">
            <div className="presentation-photos">
              <div className="photo-item">
                <div className="photo-box" style={{ overflow: 'hidden', padding: 0 }}>
                  {student.photo_before ? (
                    <img src={student.photo_before} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '0.8rem' }}>Sem foto (Antes)</span>
                    </div>
                  )}
                </div>
                <span>Início do Processo</span>
              </div>

              <div className="photo-item">
                <div className="photo-box success" style={{ overflow: 'hidden', padding: 0 }}>
                  {student.photo_after ? (
                    <img src={student.photo_after} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '0.8rem' }}>Sem foto (Atual)</span>
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Evolução Atual</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="presentation-col">
          <Card 
            title={
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
                <span>Evolução de Cargas ({selectedExercise})</span>
                {availableExercises.length > 1 && (
                  <select 
                    className="form-input" 
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto', minWidth: '150px' }}
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                  >
                    {availableExercises.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                )}
              </div>
            } 
            className="presentation-card"
          >
            <div style={{ height: '220px', width: '100%' }}>
              {chartLoads.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum registro de carga para {selectedExercise}.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartLoads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="load" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card title={`Humor & Disposição Pós-Treino (Média: ${averageEmotional}/10)`} className="presentation-card">
            <div style={{ height: '220px', width: '100%' }}>
              {studentEmotions.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum registro emocional pós-treino ainda.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentEmotions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="displayDate" stroke="var(--text-secondary)" />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="var(--text-secondary)" hide />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} />
                    <Line type="monotone" dataKey="score" stroke="var(--info)" strokeWidth={4} dot={{ r: 5, fill: 'var(--bg-card)', stroke: 'var(--info)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;
