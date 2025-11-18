import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './CelebrationModal.css';

const CELEBRATIONS = {
  firstTask: {
    ascii: `
    ✨
  [ first task! ]
    ✨
    `,
    message: "you completed your first task!",
    subtitle: "the journey of a thousand miles begins with a single step",
  },
  allTasksComplete: {
    ascii: `
    🎉
  [ perfect day! ]
    🎉
    `,
    message: "you completed all tasks today!",
    subtitle: "incredible focus and dedication",
  },
  streak3: {
    ascii: `
    🔥
  [ 3 day streak! ]
    🔥
    `,
    message: "three days in a row!",
    subtitle: "consistency is key",
  },
  streak7: {
    ascii: `
    🔥🔥
  [ week streak! ]
    🔥🔥
    `,
    message: "seven days in a row!",
    subtitle: "you're building a powerful habit",
  },
  streak30: {
    ascii: `
    🔥🔥🔥
  [ 30 day streak! ]
    🔥🔥🔥
    `,
    message: "thirty days in a row!",
    subtitle: "legendary consistency",
  },
  personalBest: {
    ascii: `
    ⭐
  [ new record! ]
    ⭐
    `,
    message: "you beat your personal best!",
    subtitle: "keep pushing forward",
  },
};

function CelebrationModal({ isOpen, onClose, celebrationType, customData = {} }) {
  if (!celebrationType || !CELEBRATIONS[celebrationType]) {
    return null;
  }

  const celebration = CELEBRATIONS[celebrationType];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="celebration">
      <div className="celebration-modal">
        <pre className="celebration-ascii">
          {celebration.ascii}
        </pre>
        <div className="celebration-message">
          {celebration.message}
        </div>
        {customData.streakCount && (
          <div className="celebration-detail">
            {customData.streakCount} day{customData.streakCount > 1 ? 's' : ''} in a row
          </div>
        )}
        <div className="celebration-subtitle">
          {celebration.subtitle}
        </div>
        <div className="celebration-actions">
          <Button variant="primary" onClick={onClose}>
            nice
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CelebrationModal;
