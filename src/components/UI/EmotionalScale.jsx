import React, { useState } from 'react';
import { Frown, Smile, Meh, Sparkles } from 'lucide-react';
import './EmotionalScale.css';

const SCORE_DETAILS = [
  { level: 0, label: 'Muito Ruim', desc: 'Exaustão severa, dor ou energia nula', icon: Frown, color: '#f87171' },
  { level: 1, label: 'Muito Fraco', desc: 'Rendimento muito abaixo do esperado', icon: Frown, color: '#fb923c' },
  { level: 2, label: 'Cansado', desc: 'Desgaste acentuado e pouca disposição', icon: Frown, color: '#fb923c' },
  { level: 3, label: 'Desgastado', desc: 'Esforço pesado, recuperação necessária', icon: Meh, color: '#facc15' },
  { level: 4, label: 'Abaixo da Média', desc: 'Treino exigente, ânimo moderado para baixo', icon: Meh, color: '#facc15' },
  { level: 5, label: 'Moderado / Neutro', desc: 'Esforço equilibrado, disposição estável', icon: Meh, color: '#38bdf8' },
  { level: 6, label: 'Bom', desc: 'Treino produtivo e boa resposta corporal', icon: Smile, color: '#38bdf8' },
  { level: 7, label: 'Muito Bom', desc: 'Ótima energia, foco e rendimento físico', icon: Smile, color: '#34d399' },
  { level: 8, label: 'Forte & Disposto', desc: 'Excelente resposta muscular e ânimo elevado', icon: Smile, color: '#34d399' },
  { level: 9, label: 'Excelente', desc: 'Desempenho no topo e vigor físico alto', icon: Sparkles, color: '#2dd4bf' },
  { level: 10, label: 'Excelente / No Topo', desc: 'Sensação impecável, máxima energia!', icon: Sparkles, color: '#00c853' }
];

const EmotionalScale = ({ onChange, value = null }) => {
  const [hovered, setHovered] = useState(null);

  const activeIndex = hovered !== null ? hovered : value;
  const currentDetail = activeIndex !== null ? SCORE_DETAILS[activeIndex] : null;

  return (
    <div className="emotional-scale-wrapper">
      <div className="scale-header-block">
        <h4 className="scale-question-title">Como você está se sentindo hoje?</h4>
        <p className="scale-question-subtitle">
          Classifique a percepção subjetiva de esforço e humor pós-treino (escala de 0 a 10)
        </p>
      </div>

      {/* Grade de 11 orbs (0 a 10) com preenchimento líquido proporcional */}
      <div className="scale-orbs-row">
        {SCORE_DETAILS.map((item) => {
          const fillPercent = item.level * 10; // 0 = 0%, 5 = 50%, 10 = 100%
          const isSelected = value === item.level;
          const isHovered = hovered === item.level;

          return (
            <button
              key={item.level}
              type="button"
              className={`scale-orb ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => onChange(item.level)}
              onMouseEnter={() => setHovered(item.level)}
              onMouseLeave={() => setHovered(null)}
              title={`${item.level} • ${item.label}`}
              aria-label={`Nota ${item.level}: ${item.label}`}
            >
              {/* Nível de preenchimento líquido: 0 vazio, 10 cheio */}
              <span 
                className={`orb-liquid-fill ${item.level === 0 ? 'empty-level' : ''} ${item.level === 10 ? 'full-level' : ''}`} 
                style={{ height: `${fillPercent}%` }} 
              />
              <span className="orb-number-label">{item.level}</span>
            </button>
          );
        })}
      </div>

      {/* Legendas de Extremos Cristalinas e Didáticas */}
      <div className="scale-anchors-bar">
        <span className="scale-anchor-tag left">
          <span className="anchor-circle-indicator empty" />
          <span><strong>0</strong> • Muito Ruim</span>
        </span>
        <span className="scale-anchor-tag center">
          <span><strong>5</strong> • Moderado</span>
        </span>
        <span className="scale-anchor-tag right">
          <span><strong>10</strong> • Muito Bom</span>
          <span className="anchor-circle-indicator full" />
        </span>
      </div>

      {/* Caixa de Feedback Instantâneo */}
      <div className="scale-feedback-card">
        {currentDetail ? (
          <div className="feedback-inner flex-between">
            <div className="feedback-left">
              <div className="feedback-icon-box" style={{ backgroundColor: `${currentDetail.color}20`, borderColor: `${currentDetail.color}40`, color: currentDetail.color }}>
                <currentDetail.icon size={20} />
              </div>
              <div className="feedback-info">
                <span className="feedback-score-pill" style={{ color: currentDetail.color, backgroundColor: `${currentDetail.color}18`, borderColor: `${currentDetail.color}35` }}>
                  Nota {currentDetail.level}/10 • {currentDetail.label}
                </span>
                <p className="feedback-description-text">{currentDetail.desc}</p>
              </div>
            </div>
            {value === currentDetail.level && (
              <span className="feedback-selected-mark">Selecionado</span>
            )}
          </div>
        ) : (
          <div className="feedback-empty-hint">
            <span>Selecione uma bolinha acima para registrar o humor pós-treino</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalScale;
