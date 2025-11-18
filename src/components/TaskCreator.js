import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import './TaskCreator.css';

function TaskCreator({ isOpen, onClose, onSave, editTask = null }) {
  const [taskName, setTaskName] = useState(editTask?.name || '');
  const [points, setPoints] = useState(editTask?.points || 10);
  const [followUps, setFollowUps] = useState(editTask?.followUps || []);

  const handleAddFollowUp = (type) => {
    const newFollowUp = {
      type,
      label: '',
      required: false,
      options: type === 'category' ? [] : undefined,
    };
    setFollowUps([...followUps, newFollowUp]);
  };

  const handleUpdateFollowUp = (index, field, value) => {
    const updated = [...followUps];
    updated[index] = { ...updated[index], [field]: value };
    setFollowUps(updated);
  };

  const handleRemoveFollowUp = (index) => {
    setFollowUps(followUps.filter((_, i) => i !== index));
  };

  const handleAddCategory = (index, category) => {
    if (!category.trim()) return;
    const updated = [...followUps];
    updated[index].options = [...(updated[index].options || []), category.trim()];
    setFollowUps(updated);
  };

  const handleRemoveCategory = (followUpIndex, categoryIndex) => {
    const updated = [...followUps];
    updated[followUpIndex].options = updated[followUpIndex].options.filter((_, i) => i !== categoryIndex);
    setFollowUps(updated);
  };

  const handleSave = () => {
    if (!taskName.trim()) return;

    const task = {
      id: editTask?.id || Date.now(),
      name: taskName.trim(),
      points: parseInt(points) || 10,
      followUps: followUps.filter(fu => fu.label.trim()),
    };

    onSave(task);
    handleClose();
  };

  const handleClose = () => {
    setTaskName('');
    setPoints(10);
    setFollowUps([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editTask ? 'edit task' : 'create new task'}>
      <div className="task-creator">
        <Input
          label="task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="e.g., morning workout"
        />

        <Input
          label="point value"
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          min="1"
          max="1000"
        />

        <div className="follow-ups-section">
          <div className="section-header">
            <span className="section-label">follow-ups (optional)</span>
          </div>

          {followUps.map((followUp, index) => (
            <div key={index} className="follow-up-item">
              <div className="follow-up-header">
                <span className="follow-up-type">[ {followUp.type} ]</span>
                <Button
                  variant="delete"
                  onClick={() => handleRemoveFollowUp(index)}
                >
                  ×
                </Button>
              </div>

              <Input
                label="question/label"
                value={followUp.label}
                onChange={(e) => handleUpdateFollowUp(index, 'label', e.target.value)}
                placeholder={
                  followUp.type === 'text'
                    ? 'e.g., what did you learn?'
                    : followUp.type === 'rating'
                    ? 'e.g., how was it?'
                    : 'e.g., what type?'
                }
              />

              {followUp.type === 'category' && (
                <div className="category-options">
                  <label className="input-label">categories</label>
                  <div className="category-list">
                    {(followUp.options || []).map((option, optIndex) => (
                      <div key={optIndex} className="category-chip">
                        <span>{option}</span>
                        <button
                          className="category-remove"
                          onClick={() => handleRemoveCategory(index, optIndex)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="category-add">
                    <input
                      className="input category-input"
                      placeholder="add category"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCategory(index, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={followUp.required}
                  onChange={(e) => handleUpdateFollowUp(index, 'required', e.target.checked)}
                />
                <span>required</span>
              </label>
            </div>
          ))}

          <div className="add-follow-up-buttons">
            <Button onClick={() => handleAddFollowUp('text')}>+ text</Button>
            <Button onClick={() => handleAddFollowUp('rating')}>+ rating</Button>
            <Button onClick={() => handleAddFollowUp('category')}>+ category</Button>
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="save" onClick={handleSave}>
            {editTask ? 'update task' : 'create task'}
          </Button>
          <Button onClick={handleClose}>cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default TaskCreator;
