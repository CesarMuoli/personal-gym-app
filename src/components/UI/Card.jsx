import React from 'react';
import './UI.css';

const Card = ({ children, className = '', title, onClick, ...rest }) => {
  return (
    <div 
      className={`card glass-panel ${className}`} 
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
      {...rest}
    >
      {typeof title === 'string' ? (
        title && <h3 className="card-title">{title}</h3>
      ) : (
        title
      )}
      {children}
    </div>
  );
};
export default Card;
