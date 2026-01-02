import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-modal-icon confirm-modal-icon-${type}`}>
                    {type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}
                </div>
                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-actions">
                    <button className="btn btn-outline" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
