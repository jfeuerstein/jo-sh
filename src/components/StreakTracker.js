import React from 'react';
import './StreakTracker.css';

function StreakTracker({ currentStreak, bestStreak }) {
  return (
    <div className="streak-tracker">
      <div className="streak-item">
        <div className="streak-label">current streak</div>
        <div className="streak-value">
          {currentStreak > 0 ? '♩' : '○'} {currentStreak}
        </div>
      </div>
      <div className="streak-divider">│</div>
      <div className="streak-item">
        <div className="streak-label">best streak</div>
        <div className="streak-value">♫ {bestStreak}</div>
      </div>
    </div>
  );
}

export default StreakTracker;
