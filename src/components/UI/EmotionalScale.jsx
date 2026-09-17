import React, { useState } from 'react';
import './UI.css';

const EmotionalScale = ({ onChange, value = null }) => {
  const [hovered, setHovered] = useState(null);
  
  return (
    <div className="emotional-scale-container">
      <p className="emotional-scale-question">Como você está se sentindo hoje?</p>
      <div className="scale-wrapper">
        <span className="scale-label">Muito ruim</span>
        <div className="scale-points">
          {[...Array(16)].map((_, i) => (
            <button 
              key={i} 
              className={`scale-point ${value === i ? 'selected' : ''} ${hovered >= i ? 'hovered' : ''}`}
              onClick={() => onChange(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {i}
            </button>
          ))}
        </div>
        <span className="scale-label">Muito bom</span>
      </div>
    </div>
  );
};
export default EmotionalScale;
