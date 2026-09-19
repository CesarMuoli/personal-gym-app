import React, { useEffect } from 'react';
import './UI.css';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth, className = '' }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content glass-panel ${className}`} 
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex-between">
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="icon-btn-transparent" style={{ padding: '0.35rem' }} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
