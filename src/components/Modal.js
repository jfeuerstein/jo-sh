import React, { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const borderLength = title ? title.length + 2 : 40;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <pre className="modal-header">
┌{'─'.repeat(borderLength)}┐<br />
│ {title}{' '.repeat(borderLength - title.length - 2)} │<br />
└{'─'.repeat(borderLength)}┘
          </pre>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
