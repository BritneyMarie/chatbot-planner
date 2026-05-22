import { useState } from 'react';
import './GoalsList.css';

const DEFAULT_GOALS = [
  { id: 1, text: 'Complete project milestone', done: false, priority: 'high' },
  { id: 2, text: 'Read 2 chapters', done: false, priority: 'medium' },
  { id: 3, text: 'Morning workout routine', done: true, priority: 'high' },
  { id: 4, text: 'Learn something new', done: false, priority: 'low' },
];

const GoalsList = () => {
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [newGoal, setNewGoal] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now(),
      text: newGoal.trim(),
      done: false,
      priority: 'medium',
    }]);
    setNewGoal('');
    setShowAdd(false);
  };

  const removeGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const completedCount = goals.filter(g => g.done).length;
  const progress = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="goals-list">
      <div className="goals-header">
        <h3>Goals</h3>
        <div className="goals-stats">
          <span className="goals-count">{completedCount}/{goals.length}</span>
          <button className="goals-add-btn" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? '✕' : '+'}
          </button>
        </div>
      </div>

      <div className="goals-progress">
        <div className="goals-progress-bar">
          <div className="goals-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="goals-progress-text">{progress}% complete</span>
      </div>

      {showAdd && (
        <div className="goals-add-form">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new goal..."
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button onClick={addGoal}>Add</button>
        </div>
      )}

      <div className="goals-items">
        {goals.map(goal => (
          <div key={goal.id} className={`goal-item ${goal.done ? 'completed' : ''} priority-${goal.priority}`}>
            <button
              className={`goal-checkbox ${goal.done ? 'checked' : ''}`}
              onClick={() => toggleGoal(goal.id)}
            >
              {goal.done && '✓'}
            </button>
            <span className="goal-text">{goal.text}</span>
            <span className={`goal-priority ${goal.priority}`}>{goal.priority}</span>
            <button className="goal-remove" onClick={() => removeGoal(goal.id)}>&#215;</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsList;
