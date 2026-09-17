import React from 'react';
import './UI.css';

const Card = ({ children, className = '', title }) => {
  return (
    <div className={`card glass-panel ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
};
export default Card;
