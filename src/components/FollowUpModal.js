import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import './FollowUpModal.css';

function FollowUpModal({ isOpen, task, onComplete, onCancel }) {
  const [responses, setResponses] = useState({});

  const handleResponseChange = (followUpIndex, value) => {
    setResponses({
      ...responses,
      [followUpIndex]: value,
    });
  };

  const handleComplete = () => {
    // Check if all required follow-ups are filled
    const hasAllRequired = task.followUps.every((fu, index) => {
      if (fu.required) {
        const response = responses[index];
        return response && response !== '';
      }
      return true;
    });

    if (!hasAllRequired) {
      alert('please complete all required fields');
      return;
    }

    onComplete(responses);
    setResponses({});
  };

  const handleCancel = () => {
    setResponses({});
    onCancel();
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={`completed: ${task.name}`}>
      <div className="follow-up-modal">
        <div className="task-completion-header">
          <pre className="completion-ascii">
    ✓
  [ {task.points} pts ]
          </pre>
        </div>

        {task.followUps && task.followUps.length > 0 ? (
          <div className="follow-up-questions">
            {task.followUps.map((followUp, index) => (
              <div key={index} className="follow-up-question">
                <label className="follow-up-label">
                  {followUp.label}
                  {followUp.required && <span className="required-indicator"> *</span>}
                </label>

                {followUp.type === 'text' && (
                  <textarea
                    className="follow-up-textarea"
                    value={responses[index] || ''}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    placeholder="type your response..."
                    rows={3}
                  />
                )}

                {followUp.type === 'rating' && (
                  <div className="rating-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`star-button ${
                          responses[index] >= star ? 'active' : ''
                        }`}
                        onClick={() => handleResponseChange(index, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}

                {followUp.type === 'category' && (
                  <div className="category-select">
                    {followUp.options && followUp.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        className={`category-option ${
                          responses[index] === option ? 'selected' : ''
                        }`}
                        onClick={() => handleResponseChange(index, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-followups">great job! task completed.</p>
        )}

        <div className="modal-actions">
          <Button variant="save" onClick={handleComplete}>
            done
          </Button>
          <Button onClick={handleCancel}>cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default FollowUpModal;
