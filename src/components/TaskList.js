import React from 'react';
import Button from './Button';
import './TaskList.css';

function TaskList({ tasks, completedTasks, onComplete, onEdit, onDelete }) {
  const isCompleted = (taskId) => {
    return completedTasks.some(ct => ct.taskId === taskId);
  };

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <pre className="ascii-empty">
┌─────────────────────┐<br />
│  no tasks yet...    │<br />
│  create one below!  │<br />
└─────────────────────┘
          </pre>
        </div>
      ) : (
        tasks.map((task) => {
          const completed = isCompleted(task.id);
          return (
            <div
              key={task.id}
              className={`task-item ${completed ? 'completed' : ''}`}
            >
              <div className="task-main">
                <button
                  className={`task-checkbox ${completed ? 'checked' : ''}`}
                  onClick={() => !completed && onComplete(task)}
                  disabled={completed}
                >
                  {completed ? '✓' : '○'}
                </button>
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span className="task-points">{task.points} pts</span>
                </div>
              </div>
              <div className="task-actions">
                <Button variant="small" onClick={() => onEdit(task)}>
                  edit
                </Button>
                <Button variant="delete" onClick={() => onDelete(task.id)}>
                  delete
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default TaskList;
