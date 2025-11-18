import React, { useState, useEffect } from 'react';
import './PointsTracker.css';

function PointsTracker({ tasks, completedTasks }) {
  const [showSecret, setShowSecret] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);

  const totalPoints = 10;
  const earnedPoints = completedTasks.reduce((sum, ct) => {
    const task = tasks.find(t => t.id === ct.taskId);
    return sum + (task?.points || 0);
  }, 0);

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      setShowSecret(true);
    }, 3000);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    setShowSecret(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };
  }, [hoverTimer]);

  return (
    <div
      className="points-tracker"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="points-display">
        <div className="points-bar-container">
          <div className="points-bar" style={{ width: `${percentage}%` }} />
        </div>
        <div className="points-text">
          {earnedPoints} / {totalPoints} pts
          {showSecret && <span className="secret-text"> (yes, we're counting)</span>}
        </div>
        <div className="points-percentage">{percentage}% complete</div>
      </div>
    </div>
  );
}

export default PointsTracker;
