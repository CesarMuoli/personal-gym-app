import React from 'react';
import './UI.css';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header flex-between">
          <h3 style={{margin: 0}}>{title}</h3>
          <button onClick={onClose} className="icon-btn-transparent" style={{padding: 0}}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
